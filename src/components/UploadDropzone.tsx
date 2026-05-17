"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const sendFile = useCallback(
    async (file: File) => {
      setStatus("uploading");
      setError(null);
      const form = new FormData();
      form.append("file", file);
      try {
        const resp = await fetch("/api/analyze", { method: "POST", body: form });
        if (!resp.ok) {
          const j = (await resp.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error ?? `HTTP ${resp.status}`);
        }
        const j = (await resp.json()) as { jobId: string };
        sessionStorage.setItem(`dcr:${j.jobId}`, "ready");
        router.push(`/analysis/${j.jobId}`);
      } catch (e) {
        setStatus("error");
        setError((e as Error).message);
      }
    },
    [router],
  );

  const sendSample = useCallback(async () => {
    setStatus("uploading");
    setError(null);
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sample: true }),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${resp.status}`);
      }
      const j = (await resp.json()) as { jobId: string };
      sessionStorage.setItem(`dcr:${j.jobId}`, "ready");
      router.push(`/analysis/${j.jobId}`);
    } catch (e) {
      setStatus("error");
      setError((e as Error).message);
    }
  }, [router]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void sendFile(f);
        }}
        className={clsx(
          "group relative flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition",
          isDragging
            ? "border-sky-400/80 bg-sky-500/5"
            : "border-slate-700 bg-[var(--color-panel)] hover:border-slate-500",
          status === "uploading" && "pointer-events-none opacity-70",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void sendFile(f);
          }}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          {status === "uploading" ? (
            <>
              <div className="flex gap-1">
                <span className="dot-pulse h-2 w-2 rounded-full bg-sky-400" />
                <span
                  className="dot-pulse h-2 w-2 rounded-full bg-sky-400"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="dot-pulse h-2 w-2 rounded-full bg-sky-400"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <p className="text-sm text-slate-300">Analyzing contract…</p>
              <p className="text-xs text-slate-500">3-pass pipeline · ~10s on the sample</p>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-9 w-9 text-slate-400 group-hover:text-slate-300"
              >
                <path d="M12 15V3m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M3 15v3a3 3 0 003 3h12a3 3 0 003-3v-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-base font-medium text-slate-200">
                Drop a contract PDF, or{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    inputRef.current?.click();
                  }}
                  className="underline decoration-sky-400/60 underline-offset-2 hover:text-sky-300"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-slate-500">
                Text-based PDFs only. Stays in memory — never written to disk.
              </p>
            </>
          )}
        </div>
      </label>

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => void sendSample()}
          disabled={status === "uploading"}
          className="rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-sky-200 transition hover:bg-sky-500/20 disabled:opacity-40"
        >
          Try sample contract →
        </button>
        <span className="text-xs text-slate-500">
          No upload needed. Loads a 12-clause defense services contract excerpt.
        </span>
      </div>

      {error && (
        <div className="w-full rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
