import type { ModelProvider } from "../providers/base";
import type { Clause, RiskFinding, RejectedFinding, PipelineError } from "../schema";
import { HIDDEN_SYSTEM, buildHiddenUserPrompt } from "../prompts/hidden";
import { verifyDrafts } from "./verifier";

const MAX_HIDDEN_PROMPT_CHARS = 80_000;

export async function runHiddenPass(args: {
  jobId: string;
  provider: ModelProvider;
  clauses: Clause[];
}): Promise<{ verified: RiskFinding[]; rejected: RejectedFinding[]; errors: PipelineError[] }> {
  const { jobId, provider, clauses } = args;
  const clausesById = new Map(clauses.map((c) => [c.clauseId, c]));
  const userPrompt = buildHiddenUserPrompt({
    clauses: clauses.map((c) => ({ clauseId: c.clauseId, heading: c.heading, text: c.text })),
  });

  if (userPrompt.length > MAX_HIDDEN_PROMPT_CHARS) {
    return {
      verified: [],
      rejected: [],
      errors: [
        {
          phase: "HIDDEN",
          clauseId: null,
          code: "CLAUSE_TOO_LARGE",
          message: `Hidden-pass prompt is ${userPrompt.length.toLocaleString()} chars; exceeds the ${MAX_HIDDEN_PROMPT_CHARS.toLocaleString()}-char limit. Skipping.`,
        },
      ],
    };
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
    return { ...r, errors: [] };
  } catch (e) {
    return {
      verified: [],
      rejected: [],
      errors: [
        {
          phase: "HIDDEN",
          clauseId: null,
          code: "LLM_ERROR",
          message: (e as Error).message ?? String(e),
        },
      ],
    };
  }
}
