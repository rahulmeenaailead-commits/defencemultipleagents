"use client";

import type { Clause, RiskFinding } from "@/lib/schema";
import { CATEGORY_LABELS } from "@/lib/taxonomy";

const SEVERITY_STYLES: Record<
  RiskFinding["severity"],
  { dot: string; label: string; ring: string }
> = {
  CRITICAL: { dot: "bg-red-500", label: "text-red-300", ring: "border-red-500/40" },
  HIGH: { dot: "bg-orange-500", label: "text-orange-300", ring: "border-orange-500/40" },
  MEDIUM: { dot: "bg-yellow-500", label: "text-yellow-300", ring: "border-yellow-500/40" },
  LOW: { dot: "bg-emerald-500", label: "text-emerald-300", ring: "border-emerald-500/40" },
};

export function TopRiskCard({
  finding,
  clause,
  onOpen,
}: {
  finding: RiskFinding;
  clause: Clause | undefined;
  onOpen: () => void;
}) {
  const style = SEVERITY_STYLES[finding.severity];
  const firstSentence = pickFirstSentence(finding.reasoning);
  const isCrossRef = finding.provenance.passType === "CROSS_REF";
  const isHidden = finding.provenance.passType === "HIDDEN";
  const related = finding.provenance.relatedClauseIds.filter((id) => id !== finding.clauseId);

  return (
    <div className={`rounded-md border ${style.ring} bg-[var(--color-panel)] p-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${style.dot}`} />
        <span className="font-mono text-xs text-slate-400">{finding.clauseId}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${style.label}`}>
          {finding.severity}
        </span>
        <span className="text-sm font-semibold text-slate-100">
          {CATEGORY_LABELS[finding.category]}
        </span>
        {isCrossRef && related.length > 0 && (
          <span className="rounded border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-sky-300">
            Across {finding.clauseId} and {related.join(", ")}
          </span>
        )}
        {isHidden && (
          <span className="rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-violet-300">
            🔍 Hidden risk
          </span>
        )}
      </div>

      <p className="mt-2 text-[13.5px] leading-snug text-slate-200">{firstSentence}</p>

      {finding.recommendedAction && (
        <div className="mt-3 rounded border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[13px] text-emerald-200">
          <span className="mr-1">💡</span>
          {finding.recommendedAction}
        </div>
      )}

      <div className="mt-3 text-right">
        <button
          onClick={onOpen}
          disabled={!clause}
          className="text-[12px] text-sky-300 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          See clause text →
        </button>
      </div>
    </div>
  );
}

function pickFirstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  const first = match ? match[0] : text;
  return first.length > 220 ? first.slice(0, 217) + "…" : first;
}
