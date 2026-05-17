import pLimit from "p-limit";
import type { ModelProvider } from "../providers/base";
import type { Clause, RiskFinding, RejectedFinding, PipelineError } from "../schema";
import { EXTRACTOR_SYSTEM, buildExtractorUserPrompt } from "../prompts/extractor";
import { extractConcepts } from "../concepts/extract";
import { conceptCache } from "../store/conceptCache";
import { verifyDrafts } from "./verifier";

export type ExtractorProgress = (done: number, total: number) => void;

/** Conservative cap. DeepSeek max context is ~64k tokens (~256k chars), but the
 * full prompt also includes the system message + citation list (~6k chars).
 * 60k chars leaves plenty of headroom. */
const MAX_CLAUSE_CHARS = 60_000;

export async function runPerClauseExtraction(args: {
  jobId: string;
  provider: ModelProvider;
  clauses: Clause[];
  concurrency?: number;
  onProgress?: ExtractorProgress;
}): Promise<{ verified: RiskFinding[]; rejected: RejectedFinding[]; errors: PipelineError[] }> {
  const { jobId, provider, clauses } = args;
  const limit = pLimit(args.concurrency ?? 6);
  const clausesById = new Map(clauses.map((c) => [c.clauseId, c]));
  const allVerified: RiskFinding[] = [];
  const allRejected: RejectedFinding[] = [];
  const errors: PipelineError[] = [];
  let done = 0;

  await Promise.all(
    clauses.map((clause) =>
      limit(async () => {
        try {
          const concepts = extractConcepts(clause);
          conceptCache.put(jobId, clause.clauseId, concepts);

          if (clause.text.length > MAX_CLAUSE_CHARS) {
            errors.push({
              phase: "PER_CLAUSE",
              clauseId: clause.clauseId,
              code: "CLAUSE_TOO_LARGE",
              message: `Clause is ${clause.text.length.toLocaleString()} chars; exceeds the ${MAX_CLAUSE_CHARS.toLocaleString()}-char per-request limit. The document likely wasn't segmented into clauses — try a PDF with numbered headings, or use the sample.`,
            });
            return;
          }

          const userPrompt = buildExtractorUserPrompt({
            clauseId: clause.clauseId,
            clauseHeading: clause.heading,
            clauseText: clause.text,
            concepts,
          });

          const resp = await provider.complete({
            messages: [
              { role: "system", content: EXTRACTOR_SYSTEM },
              { role: "user", content: userPrompt },
            ],
            responseFormat: "json_object",
            maxTokens: 2000,
          });
          const { verified, rejected } = verifyDrafts(resp.text, {
            jobId,
            passType: "PER_CLAUSE",
            modelId: resp.modelId,
            promptText: userPrompt,
            clausesById,
            defaultClauseId: clause.clauseId,
          });
          allVerified.push(...verified);
          allRejected.push(...rejected);
        } catch (e) {
          errors.push({
            phase: "PER_CLAUSE",
            clauseId: clause.clauseId,
            code: "LLM_ERROR",
            message: (e as Error).message ?? String(e),
          });
        } finally {
          done += 1;
          args.onProgress?.(done, clauses.length);
        }
      }),
    ),
  );

  return { verified: allVerified, rejected: allRejected, errors };
}
