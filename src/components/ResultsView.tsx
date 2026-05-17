"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AnalysisResult, RiskFinding } from "@/lib/schema";
import { ClauseList } from "./ClauseList";
import { ClauseDetail } from "./ClauseDetail";
import { ProofPanel } from "./ProofPanel";
import { RejectedDrawer } from "./RejectedDrawer";
import clsx from "clsx";

type Tab = "PER_CLAUSE" | "CROSS_REF" | "HIDDEN";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "PER_CLAUSE", label: "Per-clause" },
  { id: "CROSS_REF", label: "Cross-reference" },
  { id: "HIDDEN", label: "Hidden risks" },
];

export function ResultsView({ result }: { result: AnalysisResult }) {
  const [activeClauseId, setActiveClauseId] = useState<string | null>(
    result.clauses[0]?.clauseId ?? null,
  );
  const [activeFinding, setActiveFinding] = useState<RiskFinding | null>(null);
  const [tab, setTab] = useState<Tab>("PER_CLAUSE");
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
  const totalFindings = counts.PER_CLAUSE + counts.CROSS_REF + counts.HIDDEN;
  const isStub = result.providerId === "stub";
  const isSampleDoc = result.documentTitle.toLowerCase().includes("sample");
  const showStubBanner = isStub && (totalFindings === 0 || !isSampleDoc);
  const hasErrors = result.errors && result.errors.length > 0;
  const docNotSegmented = result.errors?.some((e) => e.code === "DOC_NOT_SEGMENTED");

  return (
    <div className="flex h-screen w-full flex-col">
      <TopBar result={result} tab={tab} counts={counts} onTab={(t) => { setTab(t); setRejectedOpen(false); }} />
      {hasErrors && <ErrorBanner errors={result.errors} docNotSegmented={!!docNotSegmented} />}
      {showStubBanner && <StubBanner totalFindings={totalFindings} />}
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
            activeTab={tab}
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

function ErrorBanner({
  errors,
  docNotSegmented,
}: {
  errors: import("@/lib/schema").PipelineError[];
  docNotSegmented: boolean;
}) {
  const [expanded, setExpanded] = useState(docNotSegmented);
  return (
    <div className="shrink-0 border-b border-orange-500/30 bg-orange-500/10 px-5 py-2.5 text-[12.5px] text-orange-200">
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 h-4 w-4 shrink-0">
          <path d="M12 9v4m0 4h.01" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        <div className="flex-1 leading-snug">
          {docNotSegmented ? (
            <>
              <b className="text-orange-100">This document wasn&apos;t segmented into clauses.</b>{" "}
              DCR is built for <b>procurement contracts</b> with numbered headings (FAR/DFARS-style:
              &quot;1. SCOPE OF WORK&quot;, &quot;Section 4.1 …&quot;). The segmenter also recognizes
              SEC 10-K &quot;Item N&quot; format, but a 10-K is a financial disclosure — its content
              doesn&apos;t map to the 15-category procurement risk taxonomy, so even with perfect
              segmentation you&apos;d see few or no findings.
              <div className="mt-1 text-orange-300/90">
                Try: the built-in sample, a real FAR/DFARS contract PDF, or paste contract text via the API.
              </div>
            </>
          ) : (
            <>
              <b className="text-orange-100">
                {errors.length} pipeline error{errors.length > 1 ? "s" : ""}.
              </b>{" "}
              Some passes failed — see details.
            </>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 text-[11px] text-orange-300 underline-offset-2 hover:underline"
          >
            {expanded ? "hide details" : "show details"}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1 rounded border border-orange-500/20 bg-orange-900/20 p-2 font-mono text-[11px] text-orange-100/90">
              {errors.map((e, i) => (
                <li key={i}>
                  <span className="text-orange-300">{e.phase}</span>
                  {e.clauseId && <span className="text-orange-400/80"> · {e.clauseId}</span>}
                  <span className="text-orange-400/80"> · {e.code}</span>
                  <div className="ml-2 mt-0.5 break-words text-orange-100/80">{e.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StubBanner({ totalFindings }: { totalFindings: number }) {
  return (
    <div className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-[12.5px] text-amber-200">
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 h-4 w-4 shrink-0">
          <path d="M12 9v4m0 4h.01" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        <div className="leading-snug">
          <b className="text-amber-100">
            Running on the stub provider — no real LLM analysis.
          </b>{" "}
          {totalFindings === 0 ? (
            <>
              The stub only matches the built-in sample contract&apos;s exact phrases, so your
              uploaded PDF produced <b>0 findings</b>. This is expected.
            </>
          ) : (
            <>The findings shown below come from canned probes, not a real model.</>
          )}{" "}
          To analyze any contract, add a DeepSeek key:
          <code className="ml-1 rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] text-amber-100">
            echo &apos;DEEPSEEK_API_KEY=sk-...&apos; &gt;&gt; .env.local
          </code>{" "}
          then restart <code className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] text-amber-100">npm run dev</code>.
          Get a key at{" "}
          <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="underline hover:text-amber-100">
            platform.deepseek.com
          </a>
          . Or click <b>&quot;Try sample contract&quot;</b> on the landing page to see the
          full UI with findings.
        </div>
      </div>
    </div>
  );
}

function TopBar({
  result,
  tab,
  counts,
  onTab,
}: {
  result: AnalysisResult;
  tab: Tab;
  counts: Record<Tab, number>;
  onTab: (t: Tab) => void;
}) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-slate-800 bg-[var(--color-panel-2)] px-5 py-2.5">
      <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white">
        <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
        <span className="text-sm font-medium">DCR</span>
      </Link>
      <span className="text-slate-700">·</span>
      <div className="min-w-0 flex-1 truncate text-sm text-slate-300">
        {result.documentTitle}
        <span className="ml-2 font-mono text-[11px] text-slate-500">
          {result.documentChars.toLocaleString()} ch · {result.clauses.length} clauses ·{" "}
          {result.elapsedMs} ms · provider <b className="text-slate-300">{result.providerId}</b>
        </span>
      </div>
      <nav className="flex items-center gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={clsx(
              "rounded-md px-2.5 py-1 text-xs transition",
              tab === t.id
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
      </nav>
    </header>
  );
}
