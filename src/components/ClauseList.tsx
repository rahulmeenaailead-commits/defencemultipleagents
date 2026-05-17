"use client";

import clsx from "clsx";
import type { AnalysisResult, Clause } from "@/lib/schema";
import type { Severity } from "@/lib/taxonomy";
import { SeverityBadge } from "./SeverityBadge";

const SEV_RANK: Record<Severity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export function ClauseList({
  result,
  activeClauseId,
  onSelect,
  onShowRejected,
  rejectedOpen,
}: {
  result: AnalysisResult;
  activeClauseId: string | null;
  onSelect: (clauseId: string) => void;
  onShowRejected: () => void;
  rejectedOpen: boolean;
}) {
  const byClause = new Map<string, { topSev: Severity | null; count: number }>();
  for (const c of result.clauses) byClause.set(c.clauseId, { topSev: null, count: 0 });

  for (const f of [...result.verifiedFindings, ...result.crossRefFindings, ...result.hiddenFindings]) {
    const e = byClause.get(f.clauseId);
    if (!e) continue;
    e.count += 1;
    if (!e.topSev || SEV_RANK[f.severity] > SEV_RANK[e.topSev]) e.topSev = f.severity;
  }

  const sorted = [...result.clauses].sort((a, b) => {
    const ar = byClause.get(a.clauseId)?.topSev;
    const br = byClause.get(b.clauseId)?.topSev;
    const av = ar ? SEV_RANK[ar] : 0;
    const bv = br ? SEV_RANK[br] : 0;
    if (bv !== av) return bv - av;
    return a.index - b.index;
  });

  return (
    <aside className="flex h-full flex-col gap-3 border-r border-slate-800 bg-[var(--color-panel)] p-3">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500">Clauses</h2>
        <span className="text-[10px] text-slate-600">{result.clauses.length} found</span>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {sorted.map((c) => (
            <ClauseRow
              key={c.clauseId}
              clause={c}
              info={byClause.get(c.clauseId) ?? { topSev: null, count: 0 }}
              active={!rejectedOpen && c.clauseId === activeClauseId}
              onClick={() => onSelect(c.clauseId)}
            />
          ))}
        </ul>
      </div>

      <button
        onClick={onShowRejected}
        className={clsx(
          "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition",
          rejectedOpen
            ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
            : "border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-700/40",
        )}
      >
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
            <path d="M12 9v4m0 4h.01" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Rejected by verifier
        </span>
        <span className="rounded bg-slate-900/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
          {result.rejectedFindings.length}
        </span>
      </button>
    </aside>
  );
}

function ClauseRow({
  clause,
  info,
  active,
  onClick,
}: {
  clause: Clause;
  info: { topSev: Severity | null; count: number };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={clsx(
          "w-full rounded-md border px-2 py-2 text-left transition",
          active
            ? "border-sky-500/50 bg-sky-500/10"
            : "border-transparent hover:border-slate-700 hover:bg-slate-800/40",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-mono text-[11px] text-slate-500">{clause.clauseId}</span>
            <span className="truncate text-[13px] text-slate-200">
              {clause.heading ?? "(untitled clause)"}
            </span>
          </div>
          {info.topSev && <SeverityBadge sev={info.topSev} />}
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>{info.count > 0 ? `${info.count} finding${info.count > 1 ? "s" : ""}` : "no findings"}</span>
          <span className="font-mono">{clause.text.length} ch</span>
        </div>
      </button>
    </li>
  );
}
