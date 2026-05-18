import type { AnalysisResult, RiskFinding } from "@/lib/schema";
import type { Severity } from "@/lib/taxonomy";

export type Verdict = "HIGH_RISK" | "REVIEW_NEEDED" | "MOSTLY_CLEAN" | "ALL_CLEAR";

export type RiskSummary = {
  score: number;
  verdict: Verdict;
  counts: Record<Severity, number>;
  total: number;
  allFindings: RiskFinding[];
};

const WEIGHTS: Record<Severity, number> = { CRITICAL: 25, HIGH: 12, MEDIUM: 5, LOW: 1 };
const SEVERITY_RANK: Record<Severity, number> = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };

export const VERDICT_LABELS: Record<Verdict, string> = {
  HIGH_RISK: "HIGH RISK",
  REVIEW_NEEDED: "REVIEW NEEDED",
  MOSTLY_CLEAN: "MOSTLY CLEAN",
  ALL_CLEAR: "ALL CLEAR",
};

export function computeOverallRisk(result: AnalysisResult): RiskSummary {
  const seen = new Set<string>();
  const all: RiskFinding[] = [];
  for (const list of [result.verifiedFindings, result.crossRefFindings, result.hiddenFindings]) {
    for (const f of list) {
      if (seen.has(f.findingId)) continue;
      seen.add(f.findingId);
      all.push(f);
    }
  }
  all.sort((a, b) => {
    const d = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    return d !== 0 ? d : b.riskScore - a.riskScore;
  });
  const counts: Record<Severity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  let raw = 0;
  for (const x of all) {
    counts[x.severity]++;
    raw += WEIGHTS[x.severity];
  }
  const score = Math.min(100, raw);
  return { score, verdict: scoreToVerdict(score), counts, total: all.length, allFindings: all };
}

function scoreToVerdict(score: number): Verdict {
  if (score >= 60) return "HIGH_RISK";
  if (score >= 25) return "REVIEW_NEEDED";
  if (score >= 1) return "MOSTLY_CLEAN";
  return "ALL_CLEAR";
}
