"use client";

import clsx from "clsx";
import type { AnalysisResult, Clause, RiskFinding } from "@/lib/schema";
import { SeverityBadge } from "./SeverityBadge";
import { CategoryBadge } from "./CategoryBadge";

export function ClauseDetail({
  result,
  clause,
  activeTab,
  activeFindingId,
  onSelectFinding,
}: {
  result: AnalysisResult;
  clause: Clause;
  activeTab: "PER_CLAUSE" | "CROSS_REF" | "HIDDEN";
  activeFindingId: string | null;
  onSelectFinding: (f: RiskFinding) => void;
}) {
  const pool =
    activeTab === "PER_CLAUSE"
      ? result.verifiedFindings
      : activeTab === "CROSS_REF"
        ? result.crossRefFindings
        : result.hiddenFindings;
  const findings = pool.filter((f) => f.clauseId === clause.clauseId);

  return (
    <section className="flex h-full flex-col overflow-hidden bg-[var(--color-bg)]">
      <header className="border-b border-slate-800 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-500">{clause.clauseId}</span>
          <h2 className="text-base font-semibold text-slate-100">
            {clause.heading ?? "Untitled clause"}
          </h2>
        </div>
      </header>

      <div className="scroll-thin flex-1 overflow-y-auto">
        <article className="px-5 py-4">
          <div className="rounded-md border border-slate-800 bg-[var(--color-panel)] p-4 text-[13.5px] leading-relaxed text-slate-200">
            <HighlightedClauseText
              clauseText={clause.text}
              findings={findings}
              activeFindingId={activeFindingId}
            />
          </div>
        </article>

        <div className="space-y-3 px-5 pb-6">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Findings on this clause · {findings.length}
          </h3>
          {findings.length === 0 && (
            <p className="rounded-md border border-dashed border-slate-800 px-3 py-4 text-sm text-slate-500">
              No verified findings on this clause for the <b className="text-slate-300">{activeTab}</b> pass.
            </p>
          )}
          {findings.map((f) => (
            <FindingCard
              key={f.findingId}
              f={f}
              active={f.findingId === activeFindingId}
              onClick={() => onSelectFinding(f)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightedClauseText({
  clauseText,
  findings,
  activeFindingId,
}: {
  clauseText: string;
  findings: RiskFinding[];
  activeFindingId: string | null;
}) {
  // Compute non-overlapping highlights using clause-local offsets.
  // Each finding's textSpan.charStart is doc-absolute; we need clause-local.
  // We re-find the quote inside clauseText for safety.
  const segments: Array<{ start: number; end: number; findingId: string }> = [];
  for (const f of findings) {
    const idx = clauseText.indexOf(f.textSpan.quote);
    if (idx === -1) continue;
    segments.push({ start: idx, end: idx + f.textSpan.quote.length, findingId: f.findingId });
  }
  segments.sort((a, b) => a.start - b.start);
  const merged: typeof segments = [];
  for (const s of segments) {
    const prev = merged[merged.length - 1];
    if (prev && s.start < prev.end) continue; // skip overlap
    merged.push(s);
  }
  const out: React.ReactNode[] = [];
  let cursor = 0;
  merged.forEach((s, i) => {
    if (s.start > cursor) out.push(<span key={`t-${i}`}>{clauseText.slice(cursor, s.start)}</span>);
    out.push(
      <mark
        key={`m-${i}`}
        className={clsx("dcr-mark", s.findingId === activeFindingId && "dcr-mark-active")}
      >
        {clauseText.slice(s.start, s.end)}
      </mark>,
    );
    cursor = s.end;
  });
  if (cursor < clauseText.length) out.push(<span key="t-final">{clauseText.slice(cursor)}</span>);
  return <p className="whitespace-pre-wrap">{out}</p>;
}

function FindingCard({
  f,
  active,
  onClick,
}: {
  f: RiskFinding;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "block w-full rounded-md border bg-[var(--color-panel)] p-3 text-left transition",
        active
          ? "border-sky-500/60 ring-1 ring-sky-500/40"
          : "border-slate-800 hover:border-slate-700",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge sev={f.severity} />
        <CategoryBadge cat={f.category} />
        <span className="ml-auto font-mono text-[11px] text-slate-400">
          score <b className="text-slate-200">{f.riskScore}</b> · conf {(f.confidence * 100).toFixed(0)}%
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-200">{f.reasoning}</p>
      <div className="mt-3 rounded border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[13px] text-emerald-200">
        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80">
          Recommended action
        </span>
        <p className="mt-0.5 text-slate-200">{f.recommendedAction}</p>
      </div>
      {f.redlineSuggestion && (
        <details className="mt-2 group">
          <summary className="cursor-pointer text-[11px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-200">
            Redline suggestion
          </summary>
          <p className="mt-1 rounded border border-slate-700 bg-slate-900/60 p-2 text-[13px] text-slate-300">
            {f.redlineSuggestion}
          </p>
        </details>
      )}
      <div className="mt-2 text-right">
        <span className="text-[11px] text-sky-300 underline-offset-2 hover:underline">
          See proof →
        </span>
      </div>
    </button>
  );
}
