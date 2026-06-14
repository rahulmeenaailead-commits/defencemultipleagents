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
 * Coerce common LLM format drift to canonical shape before schema validation.
 * Cosmetic only — does not invent or alter substantive content. Truth-critical
 * checks (quote-in-text, citation-in-corpus) still run downstream.
 */
function normalizeRawDraft(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const r = { ...(raw as Record<string, unknown>) };

  if (typeof r.severity === "string") r.severity = r.severity.toUpperCase();
  if (typeof r.category === "string") r.category = r.category.toUpperCase();

  if (typeof r.confidence === "number" && r.confidence > 1 && r.confidence <= 100) {
    r.confidence = r.confidence / 100;
  }
  if (typeof r.confidence === "string") {
    const m: Record<string, number> = { low: 0.5, medium: 0.7, high: 0.9, "very high": 0.95 };
    const v = m[r.confidence.trim().toLowerCase()];
    if (v !== undefined) r.confidence = v;
  }

  if (typeof r.regulatoryCitation === "string") {
    r.regulatoryCitation = { citationId: r.regulatoryCitation };
  }

  return r;
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

  findings.forEach((rawOriginal, idx) => {
    const raw = normalizeRawDraft(rawOriginal);
    const draftParse = DraftFindingSchema.safeParse(raw);
    if (!draftParse.success) {
      rejected.push({
        findingId: makeFindingId(hash, idx),
        clauseId: ctx.defaultClauseId ?? "C-?",
        category: typeof (raw as { category?: unknown })?.category === "string" ? (raw as { category: string }).category : "UNKNOWN",
        reason: "SCHEMA_INVALID",
        rawDraft: rawOriginal,
      });
      return;
    }
    const draft = draftParse.data;

    // Resolve clauseId — for per-clause / cross-ref passes the default is supplied;
    // for hidden pass the raw object must carry clauseId.
    const candidateClauseId =
      (raw as { clauseId?: string }).clauseId ?? ctx.defaultClauseId ?? "C-?";
    const clause = ctx.clausesById.get(candidateClauseId);

    // Exact-substring check, with whitespace-tolerant fallbacks for PDFs that
    // introduce wrap-induced line breaks (sometimes mid-word). Truth guarantee:
    // the non-whitespace skeleton of the quote must appear contiguously in the
    // clause's non-whitespace skeleton.
    const exactHit = clause && clause.text.includes(draft.textSpan.quote);
    const normHaystack = clause ? clause.text.replace(/\s+/g, " ") : "";
    const normNeedle = draft.textSpan.quote.replace(/\s+/g, " ");
    const wsNormHit =
      !exactHit && clause && normHaystack.includes(normNeedle);
    const stripHaystack = clause ? clause.text.replace(/\s+/g, "") : "";
    const stripNeedle = draft.textSpan.quote.replace(/\s+/g, "");
    const compactHit =
      !exactHit &&
      !wsNormHit &&
      clause &&
      stripNeedle.length > 0 &&
      stripHaystack.includes(stripNeedle);
    if (!clause || (!exactHit && !wsNormHit && !compactHit)) {
      rejected.push({
        findingId: makeFindingId(hash, idx),
        clauseId: candidateClauseId,
        category: draft.category,
        reason: "TEXT_SPAN_NOT_FOUND",
        rawDraft: rawOriginal,
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
        rawDraft: rawOriginal,
      });
      return;
    }

    // Recompute span offsets from the clause text to keep them honest. For
    // fuzzy hits the exact byte offset is approximate (clause.charStart) since
    // PDF whitespace artifacts make precise mapping unreliable.
    const exactStart = clause.text.indexOf(draft.textSpan.quote);
    const charStart =
      exactStart >= 0 ? clause.charStart + exactStart : clause.charStart;
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
        rawDraft: rawOriginal,
      });
      return;
    }
    verified.push(verifyParse.data);
  });

  return { verified, rejected };
}
