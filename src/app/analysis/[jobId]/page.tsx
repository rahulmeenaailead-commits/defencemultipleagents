"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ResultsView } from "@/components/ResultsView";
import type { AnalysisResult } from "@/lib/schema";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; result: AnalysisResult }
  | { kind: "notFound" };

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(`dcr:${jobId}`) : null;
    if (raw && raw !== "ready") {
      try {
        const parsed = JSON.parse(raw) as AnalysisResult;
        if (parsed && parsed.jobId === jobId) {
          setState({ kind: "ready", result: parsed });
          return;
        }
      } catch {
        // fall through to API
      }
    }
    let cancelled = false;
    fetch(`/api/analyze?jobId=${encodeURIComponent(jobId)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return (await r.json()) as AnalysisResult;
      })
      .then((data) => {
        if (cancelled) return;
        sessionStorage.setItem(`dcr:${jobId}`, JSON.stringify(data));
        setState({ kind: "ready", result: data });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "notFound" });
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (state.kind === "loading") return <Loading />;
  if (state.kind === "notFound") return <NotFoundView />;
  return <ResultsView result={state.result} />;
}

function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex gap-1">
        <span className="dot-pulse h-2 w-2 rounded-full bg-sky-400" />
        <span className="dot-pulse h-2 w-2 rounded-full bg-sky-400" style={{ animationDelay: "0.2s" }} />
        <span className="dot-pulse h-2 w-2 rounded-full bg-sky-400" style={{ animationDelay: "0.4s" }} />
      </div>
      <p className="text-sm text-slate-400">Loading analysis…</p>
    </main>
  );
}

function NotFoundView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-100">Job not found</h1>
      <p className="text-sm text-slate-400">
        This analysis is no longer available — sessions don&apos;t persist across browser tabs or
        page reloads. Re-run from the landing page.
      </p>
      <Link
        href="/"
        className="rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-sm text-sky-200 hover:bg-sky-500/20"
      >
        ← Back to upload
      </Link>
    </main>
  );
}
