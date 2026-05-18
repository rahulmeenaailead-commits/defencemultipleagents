"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { AnalysisResult } from "@/lib/schema";
import { ContractorSummary } from "./ContractorSummary";
import { AllClausesView } from "./AllClausesView";
import { ExpertView } from "./ExpertView";

type TopTab = "SUMMARY" | "ALL" | "TECHNICAL";

const TABS: Array<{ id: TopTab; label: string }> = [
  { id: "SUMMARY", label: "Summary" },
  { id: "ALL", label: "All clauses" },
  { id: "TECHNICAL", label: "Technical" },
];

export function ResultsView({ result }: { result: AnalysisResult }) {
  const [tab, setTab] = useState<TopTab>("SUMMARY");

  const totalFindings =
    result.verifiedFindings.length +
    result.crossRefFindings.length +
    result.hiddenFindings.length;
  const isStub = result.providerId === "stub";
  const isSampleDoc = result.documentTitle.toLowerCase().includes("sample");
  const showStubBanner = isStub && (totalFindings === 0 || !isSampleDoc);
  const hasErrors = result.errors && result.errors.length > 0;
  const docNotSegmented = result.errors?.some((e) => e.code === "DOC_NOT_SEGMENTED");

  return (
    <div className="flex h-screen w-full flex-col">
      <TopBar result={result} tab={tab} onTab={setTab} />
      {hasErrors && <ErrorBanner errors={result.errors} docNotSegmented={!!docNotSegmented} />}
      {showStubBanner && <StubBanner totalFindings={totalFindings} />}
      <div className="flex min-h-0 flex-1 flex-col">
        {tab === "SUMMARY" && (
          <ContractorSummary result={result} onOpenTechnical={() => setTab("TECHNICAL")} />
        )}
        {tab === "ALL" && <AllClausesView result={result} />}
        {tab === "TECHNICAL" && <ExpertView result={result} />}
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
  onTab,
}: {
  result: AnalysisResult;
  tab: TopTab;
  onTab: (t: TopTab) => void;
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
          {result.clauses.length} clauses · reviewed in {(result.elapsedMs / 1000).toFixed(1)}s
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
          </button>
        ))}
      </nav>
    </header>
  );
}
