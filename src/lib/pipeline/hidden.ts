import type { ModelProvider } from "../providers/base";
import type { Clause, RiskFinding, RejectedFinding, PipelineError } from "../schema";
import { HIDDEN_SYSTEM, buildHiddenUserPrompt } from "../prompts/hidden";
import { verifyDrafts } from "./verifier";

const MAX_HIDDEN_PROMPT_CHARS = 80_000;
const BATCH_OVERLAP = 3;

type HiddenClause = { clauseId: string; heading: string | null; text: string };

export async function runHiddenPass(args: {
  jobId: string;
  provider: ModelProvider;
  clauses: Clause[];
}): Promise<{ verified: RiskFinding[]; rejected: RejectedFinding[]; errors: PipelineError[] }> {
  const { jobId, provider, clauses } = args;
  const clausesById = new Map(clauses.map((c) => [c.clauseId, c]));
  const hiddenClauses: HiddenClause[] = clauses.map((c) => ({
    clauseId: c.clauseId,
    heading: c.heading,
    text: c.text,
  }));

  const batches = packBatches(hiddenClauses, MAX_HIDDEN_PROMPT_CHARS);

  const verifiedAll: RiskFinding[] = [];
  const rejectedAll: RejectedFinding[] = [];
  const errorsAll: PipelineError[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const userPrompt = buildHiddenUserPrompt({ clauses: batch });

    if (userPrompt.length > MAX_HIDDEN_PROMPT_CHARS) {
      errorsAll.push({
        phase: "HIDDEN",
        clauseId: null,
        code: "CLAUSE_TOO_LARGE",
        message: `Hidden-pass batch ${i + 1}/${batches.length} prompt is ${userPrompt.length.toLocaleString()} chars; single clause exceeds the ${MAX_HIDDEN_PROMPT_CHARS.toLocaleString()}-char limit. Skipping batch.`,
      });
      continue;
    }

    try {
      const resp = await provider.complete({
        messages: [
          { role: "system", content: HIDDEN_SYSTEM },
          { role: "user", content: userPrompt },
        ],
        responseFormat: "json_object",
        maxTokens: 3000,
      });
      const r = verifyDrafts(resp.text, {
        jobId,
        passType: "HIDDEN",
        modelId: resp.modelId,
        promptText: userPrompt,
        clausesById,
      });
      verifiedAll.push(...r.verified);
      rejectedAll.push(...r.rejected);
    } catch (e) {
      errorsAll.push({
        phase: "HIDDEN",
        clauseId: null,
        code: "LLM_ERROR",
        message: `Batch ${i + 1}/${batches.length}: ${(e as Error).message ?? String(e)}`,
      });
    }
  }

  return {
    verified: dedupeFindings(verifiedAll),
    rejected: rejectedAll,
    errors: errorsAll,
  };
}

/**
 * Greedily pack clauses into batches whose rendered prompt fits under maxChars.
 * Adjacent batches overlap by BATCH_OVERLAP clauses so cross-clause patterns
 * straddling a batch boundary still have a chance to surface.
 */
function packBatches(clauses: HiddenClause[], maxChars: number): HiddenClause[][] {
  if (clauses.length === 0) return [];

  // Fast path: everything fits in one prompt.
  const wholePrompt = buildHiddenUserPrompt({ clauses });
  if (wholePrompt.length <= maxChars) return [clauses];

  const batches: HiddenClause[][] = [];
  let start = 0;

  while (start < clauses.length) {
    let end = start;
    let lastFitEnd = start;

    while (end < clauses.length) {
      const candidate = clauses.slice(start, end + 1);
      const prompt = buildHiddenUserPrompt({ clauses: candidate });
      if (prompt.length > maxChars) break;
      lastFitEnd = end + 1;
      end++;
    }

    if (lastFitEnd === start) {
      // Single clause already exceeds the limit; emit it alone so the caller
      // surfaces a CLAUSE_TOO_LARGE error for that batch and we keep moving.
      lastFitEnd = start + 1;
    }

    batches.push(clauses.slice(start, lastFitEnd));

    if (lastFitEnd >= clauses.length) break;
    const nextStart = lastFitEnd - BATCH_OVERLAP;
    start = nextStart > start ? nextStart : lastFitEnd;
  }

  return batches;
}

function dedupeFindings(findings: RiskFinding[]): RiskFinding[] {
  const seen = new Set<string>();
  const out: RiskFinding[] = [];
  for (const f of findings) {
    const key = `${f.clauseId}|${f.category}|${f.textSpan.quote}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}
