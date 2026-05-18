"use client";

import type { RiskSummary, Verdict } from "@/lib/risk/score";
import { VERDICT_LABELS } from "@/lib/risk/score";

const VERDICT_STYLES: Record<
  Verdict,
  { dot: string; text: string; border: string; bg: string }
> = {
  HIGH_RISK: {
    dot: "bg-red-500",
    text: "text-red-300",
    border: "border-red-500/40",
    bg: "bg-red-500/5",
  },
  REVIEW_NEEDED: {
    dot: "bg-orange-500",
    text: "text-orange-300",
    border: "border-orange-500/40",
    bg: "bg-orange-500/5",
  },
  MOSTLY_CLEAN: {
    dot: "bg-yellow-500",
    text: "text-yellow-300",
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/5",
  },
  ALL_CLEAR: {
    dot: "bg-emerald-500",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
  },
};

export function RiskVerdictHero({ summary }: { summary: RiskSummary }) {
  const style = VERDICT_STYLES[summary.verdict];
  const tally = buildTally(summary);
  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} p-6`}
      data-testid="risk-verdict-hero"
    >
      <div className="flex items-center gap-6">
        <div
          className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full ${style.dot} shadow-lg`}
        >
          <span className="text-3xl font-bold text-white">{summary.score}</span>
        </div>
        <div className="min-w-0">
          <div className={`text-2xl font-bold tracking-wide ${style.text}`}>
            {VERDICT_LABELS[summary.verdict]}
          </div>
          <div className="mt-1 text-sm text-slate-300">{tally}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">
            Risk score · {summary.score} / 100
          </div>
        </div>
      </div>
    </div>
  );
}

function buildTally(summary: RiskSummary): string {
  if (summary.total === 0) return "No risks detected";
  const parts: string[] = [];
  parts.push(`${summary.total} risky clause${summary.total > 1 ? "s" : ""}`);
  if (summary.counts.CRITICAL > 0) parts.push(`${summary.counts.CRITICAL} critical`);
  if (summary.counts.HIGH > 0) parts.push(`${summary.counts.HIGH} high`);
  if (summary.counts.MEDIUM > 0) parts.push(`${summary.counts.MEDIUM} medium`);
  if (summary.counts.LOW > 0) parts.push(`${summary.counts.LOW} low`);
  return parts.join(" · ");
}
