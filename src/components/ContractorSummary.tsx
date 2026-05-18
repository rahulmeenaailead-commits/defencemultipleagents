"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult, RiskFinding } from "@/lib/schema";
import { computeOverallRisk } from "@/lib/risk/score";
import { RiskVerdictHero } from "./RiskVerdictHero";
import { TopRiskCard } from "./TopRiskCard";
import { ClauseDetailDrawer } from "./ClauseDetailDrawer";

const INITIAL_VISIBLE = 5;

export function ContractorSummary({
  result,
  onOpenTechnical,
}: {
  result: AnalysisResult;
  onOpenTechnical: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [activeFinding, setActiveFinding] = useState<RiskFinding | null>(null);

  const summary = useMemo(() => computeOverallRisk(result), [result]);
  const clauseById = useMemo(
    () => new Map(result.clauses.map((c) => [c.clauseId, c])),
    [result.clauses],
  );

  const visible = showAll
    ? summary.allFindings
    : summary.allFindings.slice(0, INITIAL_VISIBLE);
  const hiddenCount = summary.allFindings.length - visible.length;

  const activeClause = activeFinding ? clauseById.get(activeFinding.clauseId) : undefined;

  return (
    <div className="scroll-thin flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        <RiskVerdictHero summary={summary} />

        {summary.total === 0 ? (
          <div className="rounded-md border border-dashed border-slate-800 p-6 text-center text-sm text-slate-400">
            Nothing flagged — but always read the full contract before signing.
          </div>
        ) : (
          <>
            <h2 className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Top risks
            </h2>
            <div className="space-y-3">
              {visible.map((f) => (
                <TopRiskCard
                  key={f.findingId}
                  finding={f}
                  clause={clauseById.get(f.clauseId)}
                  onOpen={() => setActiveFinding(f)}
                />
              ))}
            </div>
            {hiddenCount > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  + show {hiddenCount} more
                </button>
              </div>
            )}
          </>
        )}

        <div className="border-t border-slate-800 pt-4 text-center">
          <button
            onClick={onOpenTechnical}
            className="text-sm text-sky-300 underline-offset-2 hover:underline"
          >
            → Open technical detail
          </button>
        </div>
      </div>

      {activeFinding && activeClause && (
        <ClauseDetailDrawer
          clause={activeClause}
          finding={activeFinding}
          onClose={() => setActiveFinding(null)}
        />
      )}
    </div>
  );
}
