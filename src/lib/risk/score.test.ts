import { describe, it, expect } from "vitest";
import { computeOverallRisk, VERDICT_LABELS } from "./score";
import type { AnalysisResult, RiskFinding } from "@/lib/schema";

function f(over: Partial<RiskFinding> & { findingId: string; severity: RiskFinding["severity"] }): RiskFinding {
  return {
    findingId: over.findingId,
    clauseId: over.clauseId ?? "§1",
    category: over.category ?? "INDEMNIFICATION",
    severity: over.severity,
    riskScore: over.riskScore ?? 50,
    confidence: over.confidence ?? 0.9,
    textSpan: over.textSpan ?? { quote: "x", charStart: 0, charEnd: 1 },
    regulatoryCitation: over.regulatoryCitation ?? null,
    reasoning: over.reasoning ?? "r",
    recommendedAction: over.recommendedAction ?? "a",
    redlineSuggestion: over.redlineSuggestion ?? null,
    provenance: over.provenance ?? {
      promptHash: "h", modelId: "m", extractedAt: "2026-05-18T00:00:00Z",
      passType: "PER_CLAUSE", relatedClauseIds: [],
    },
  };
}

function r(findings: { verified?: RiskFinding[]; crossRef?: RiskFinding[]; hidden?: RiskFinding[] }): AnalysisResult {
  return {
    jobId: "j", documentTitle: "t", documentChars: 100, clauses: [],
    verifiedFindings: findings.verified ?? [],
    crossRefFindings: findings.crossRef ?? [],
    hiddenFindings: findings.hidden ?? [],
    rejectedFindings: [], errors: [], elapsedMs: 0, providerId: "stub", timedOut: false,
  } as AnalysisResult;
}

describe("computeOverallRisk", () => {
  it("returns ALL_CLEAR with score 0 when no findings", () => {
    const s = computeOverallRisk(r({}));
    expect(s.score).toBe(0);
    expect(s.verdict).toBe("ALL_CLEAR");
    expect(s.total).toBe(0);
    expect(s.counts).toEqual({ CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 });
    expect(s.allFindings).toEqual([]);
  });

  it("applies severity weights: CRITICAL=25, HIGH=12, MEDIUM=5, LOW=1", () => {
    const s = computeOverallRisk(r({ verified: [
      f({ findingId: "a", severity: "CRITICAL" }),
      f({ findingId: "b", severity: "HIGH" }),
      f({ findingId: "c", severity: "MEDIUM" }),
      f({ findingId: "d", severity: "LOW" }),
    ] }));
    expect(s.score).toBe(25 + 12 + 5 + 1);
    expect(s.counts).toEqual({ CRITICAL: 1, HIGH: 1, MEDIUM: 1, LOW: 1 });
  });

  it("caps score at 100", () => {
    const verified = Array.from({ length: 10 }, (_, i) => f({ findingId: `f${i}`, severity: "CRITICAL" }));
    expect(computeOverallRisk(r({ verified })).score).toBe(100);
  });

  it("dedupes findings by findingId across pass types", () => {
    const dup = f({ findingId: "same", severity: "HIGH" });
    const s = computeOverallRisk(r({ verified: [dup], crossRef: [dup], hidden: [dup] }));
    expect(s.total).toBe(1);
    expect(s.score).toBe(12);
  });

  it("sorts allFindings by severity desc, then riskScore desc", () => {
    const s = computeOverallRisk(r({ verified: [
      f({ findingId: "low", severity: "LOW", riskScore: 90 }),
      f({ findingId: "crit-low-rs", severity: "CRITICAL", riskScore: 10 }),
      f({ findingId: "crit-high-rs", severity: "CRITICAL", riskScore: 80 }),
      f({ findingId: "high", severity: "HIGH", riskScore: 50 }),
    ] }));
    expect(s.allFindings.map((x) => x.findingId)).toEqual(["crit-high-rs", "crit-low-rs", "high", "low"]);
  });

  it("maps thresholds: 60+ HIGH_RISK, 25-59 REVIEW_NEEDED, 1-24 MOSTLY_CLEAN, 0 ALL_CLEAR", () => {
    expect(computeOverallRisk(r({})).verdict).toBe("ALL_CLEAR");
    expect(computeOverallRisk(r({ verified: [f({ findingId: "a", severity: "LOW" })] })).verdict).toBe("MOSTLY_CLEAN");
    expect(computeOverallRisk(r({ verified: Array.from({ length: 5 }, (_, i) =>
      f({ findingId: `m${i}`, severity: "MEDIUM" })) })).verdict).toBe("REVIEW_NEEDED");
    expect(computeOverallRisk(r({ verified: Array.from({ length: 3 }, (_, i) =>
      f({ findingId: `c${i}`, severity: "CRITICAL" })) })).verdict).toBe("HIGH_RISK");
  });

  it("exposes VERDICT_LABELS for display", () => {
    expect(VERDICT_LABELS.HIGH_RISK).toBe("HIGH RISK");
    expect(VERDICT_LABELS.REVIEW_NEEDED).toBe("REVIEW NEEDED");
    expect(VERDICT_LABELS.MOSTLY_CLEAN).toBe("MOSTLY CLEAN");
    expect(VERDICT_LABELS.ALL_CLEAR).toBe("ALL CLEAR");
  });
});
