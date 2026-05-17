import pLimit from "p-limit";
import type { ModelProvider } from "../providers/base";
import type { Clause, RiskFinding, RejectedFinding, PipelineError } from "../schema";
import { CROSS_REF_SYSTEM, buildCrossRefUserPrompt } from "../prompts/cross_ref";
import { findCrossReferences } from "../clauses/segment";
import { verifyDrafts } from "./verifier";

export async function runCrossRefPass(args: {
  jobId: string;
  provider: ModelProvider;
  clauses: Clause[];
  concurrency?: number;
}): Promise<{ verified: RiskFinding[]; rejected: RejectedFinding[]; errors: PipelineError[] }> {
  const { jobId, provider, clauses } = args;
  const pairs = findCrossReferences(clauses);
  const clausesById = new Map(clauses.map((c) => [c.clauseId, c]));
  const limit = pLimit(args.concurrency ?? 4);
  const allVerified: RiskFinding[] = [];
  const allRejected: RejectedFinding[] = [];
  const errors: PipelineError[] = [];

  await Promise.all(
    pairs.map(([aId, bId]) =>
      limit(async () => {
        const a = clausesById.get(aId);
        const b = clausesById.get(bId);
        if (!a || !b) return;
        const userPrompt = buildCrossRefUserPrompt({
          clauseA: { clauseId: a.clauseId, text: a.text },
          clauseB: { clauseId: b.clauseId, text: b.text },
        });

        try {
          const resp = await provider.complete({
            messages: [
              { role: "system", content: CROSS_REF_SYSTEM },
              { role: "user", content: userPrompt },
            ],
            responseFormat: "json_object",
            maxTokens: 1500,
          });
          // For cross-ref findings, the textSpan may belong to either clause.
          // We try defaultClauseId=a first; if that rejects, the verifier output
          // will fall through. To handle this cleanly we run the verifier with a
          // tiny adapter that tries both clauses.
          const tryWith = (defaultId: string) =>
            verifyDrafts(resp.text, {
              jobId,
              passType: "CROSS_REF",
              modelId: resp.modelId,
              promptText: userPrompt,
              clausesById,
              defaultClauseId: defaultId,
            });
          const first = tryWith(aId);
          // For drafts rejected as TEXT_SPAN_NOT_FOUND under clause A, retry under B.
          if (first.rejected.length > 0) {
            const second = tryWith(bId);
            allVerified.push(...first.verified, ...second.verified);
            // Only count it as rejected if BOTH passes rejected; we approximate
            // by taking the second pass's rejects (a draft that's missing from
            // both clauses will show up there too).
            allRejected.push(...second.rejected);
          } else {
            allVerified.push(...first.verified);
          }
        } catch (e) {
          errors.push({
            phase: "CROSS_REF",
            clauseId: `${aId}↔${bId}`,
            code: "LLM_ERROR",
            message: (e as Error).message ?? String(e),
          });
        }
      }),
    ),
  );

  return { verified: allVerified, rejected: allRejected, errors };
}
