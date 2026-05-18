"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { AnalysisResult, RiskFinding } from "@/lib/schema";
import { ClauseList } from "./ClauseList";
import { ClauseDetail } from "./ClauseDetail";
import { ProofPanel } from "./ProofPanel";
import { RejectedDrawer } from "./RejectedDrawer";

type PassTab = "PER_CLAUSE" | "CROSS_REF" | "HIDDEN";

const PASS_TABS: Array<{ id: PassTab; label: string }> = [
  { id: "PER_CLAUSE", label: "Per-clause" },
  { id: "CROSS_REF", label: "Cross-reference" },
  { id: "HIDDEN", label: "Hidden risks" },
];

export function ExpertView({ result }: { result: AnalysisResult }) {
  const [activeClauseId, setActiveClauseId] = useState<string | null>(
    result.clauses[0]?.clauseId ?? null,
  );
  const [activeFinding, setActiveFinding] = useState<RiskFinding | null>(null);
  const [passTab, setPassTab] = useState<PassTab>("PER_CLAUSE");
  const [rejectedOpen, setRejectedOpen] = useState(false);

  const activeClause = useMemo(
    () => result.clauses.find((c) => c.clauseId === activeClauseId) ?? null,
    [result.clauses, activeClauseId],
  );

  const counts = {
    PER_CLAUSE: result.verifiedFindings.length,
    CROSS_REF: result.crossRefFindings.length,
    HIDDEN: result.hiddenFindings.length,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-slate-800 bg-[var(--color-panel-2)] px-5 py-2">
        <span className="mr-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Pass
        </span>
        {PASS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setPassTab(t.id);
              setRejectedOpen(false);
            }}
            className={clsx(
              "rounded-md px-2.5 py-1 text-xs transition",
              passTab === t.id
                ? "bg-sky-500/15 text-sky-200"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
            )}
          >
            {t.label}
            <span className="ml-1.5 rounded bg-slate-900/70 px-1 font-mono text-[10px] text-slate-400">
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_360px]">
        <ClauseList
          result={result}
          activeClauseId={activeClauseId}
          onSelect={(id) => {
            setActiveClauseId(id);
            setActiveFinding(null);
            setRejectedOpen(false);
          }}
          onShowRejected={() => setRejectedOpen((v) => !v)}
          rejectedOpen={rejectedOpen}
        />
        {rejectedOpen ? (
          <RejectedDrawer rejected={result.rejectedFindings} />
        ) : activeClause ? (
          <ClauseDetail
            result={result}
            clause={activeClause}
            activeTab={passTab}
            activeFindingId={activeFinding?.findingId ?? null}
            onSelectFinding={setActiveFinding}
          />
        ) : (
          <div className="p-6 text-slate-500">Select a clause.</div>
        )}
        <ProofPanel finding={rejectedOpen ? null : activeFinding} />
      </div>
    </div>
  );
}
