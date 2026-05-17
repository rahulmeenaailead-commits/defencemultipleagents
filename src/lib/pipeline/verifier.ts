import { createHash } from "node:crypto";
import { RiskFindingSchema, DraftFindingSchema } from "../schema";
import type { RiskFinding, RejectedFinding, Clause } from "../schema";
import { regCorpus } from "../regCorpus";

export type VerifyContext = {
  jobId: string;
  passType: "PER_CLAUSE" | "CROSS_REF" | "HIDDEN";
  modelId: string;
  promptText: string;
  /**
   * Map clauseId → clause. Verifier looks up the clause by the draft's clauseId
   * (or by the route-supplied default clauseId for per-clause findings).
   */
  clausesById: Map<string, Clause>;
  defaultClauseId?: string;
};

export type VerifyResult = {
  verified: RiskFinding[];
  rejected: RejectedFinding[];
};

function promptHash(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

function makeFindingId(seed: string, idx: number): string {
  return `F-${createHash("sha1").update(seed + ":" + idx).digest("hex").slice(0, 10)}`;
}

/**
 * Mechanical verifier. Drops any draft where:
 *   - schema is invalid (Zod fail)
 *   - textSpan.quote is not an exact substring of the clause text
 *   - regulatoryCitation.citationId is not in regCorpus
 * Survivors are normalized into RiskFinding shape with provenance.
 */
export function verifyDrafts(
  rawJson: string,
  ctx: VerifyContext,
): VerifyResult {
  const verified: RiskFinding[] = [];
  const rejected: RejectedFinding[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { verified, rejected };
  }
  const findings =
    parsed && typeof parsed === "object" && Array.isArray((parsed as { findings?: unknown }).findings)
      ? (parsed as { findings: unknown[] }).findings
      : [];

  const hash = promptHash(ctx.promptText);
  const extractedAt = new Date().toISOString();

  findings.forEach((raw, idx) => {
    const draftParse = DraftFindingSchema.safeParse(raw);
    if (!draftParse.success) {
      rejected.push({
        findingId: makeFindingId(hash, idx),
        clauseId: ctx.defaultClauseId ?? "C-?",
        category: typeof (raw as { category?: unknown })?.category === "string" ? (raw as { category: string }).category : "UNKNOWN",
        reason: "SCHEMA_INVALID",
        rawDraft: raw,
      });
      return;
    }
    const draft = draftParse.data;

    // Resolve clauseId — for per-clause / cross-ref passes the default is supplied;
    // for hidden pass the raw object must carry clauseId.
    const candidateClauseId =
      (raw as { clauseId?: string }).clauseId ?? ctx.defaultClauseId ?? "C-?";
    const clause = ctx.clausesById.get(candidateClauseId);

    // Exact-substring check
    if (!clause || !clause.text.includes(draft.textSpan.quote)) {
      rejected.push({
        findingId: makeFindingId(hash, idx),
        clauseId: candidateClauseId,
        category: draft.category,
        reason: "TEXT_SPAN_NOT_FOUND",
        rawDraft: raw,
      });
      return;
    }

    // Closed citation check
    if (draft.regulatoryCitation && !regCorpus.has(draft.regulatoryCitation.citationId)) {
      rejected.push({
        findingId: makeFindingId(hash, idx),
        clauseId: candidateClauseId,
        category: draft.category,
        reason: "CITATION_NOT_IN_CORPUS",
        rawDraft: raw,
      });
      return;
    }

    // Recompute span offsets from the clause text to keep them honest
    const quoteStart = clause.text.indexOf(draft.textSpan.quote);
    const charStart = clause.charStart + quoteStart;
    const charEnd = charStart + draft.textSpan.quote.length;

    // Resolve citation to the canonical text
    const citation = draft.regulatoryCitation
      ? regCorpus.get(draft.regulatoryCitation.citationId)
      : undefined;

    const candidate = {
      findingId: makeFindingId(hash, idx),
      clauseId: candidateClauseId,
      category: draft.category,
      severity: draft.severity,
      riskScore: Math.round(draft.riskScore),
      confidence: draft.confidence,
      textSpan: {
        quote: draft.textSpan.quote,
        charStart,
        charEnd,
      },
      regulatoryCitation: citation
        ? { citationId: citation.citationId, citationText: citation.citationText }
        : null,
      reasoning: draft.reasoning,
      recommendedAction: draft.recommendedAction,
      redlineSuggestion: draft.redlineSuggestion ?? null,
      provenance: {
        promptHash: hash,
        modelId: ctx.modelId,
        extractedAt,
        passType: ctx.passType,
        relatedClauseIds: draft.relatedClauseIds ?? [],
      },
    };

    const verifyParse = RiskFindingSchema.safeParse(candidate);
    if (!verifyParse.success) {
      rejected.push({
        findingId: candidate.findingId,
        clauseId: candidateClauseId,
        category: draft.category,
        reason: "SCHEMA_INVALID",
        rawDraft: raw,
      });
      return;
    }
    verified.push(verifyParse.data);
  });

  return { verified, rejected };
}
