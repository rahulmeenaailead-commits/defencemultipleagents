"use client";

import type { RejectedFinding } from "@/lib/schema";
import { CATEGORY_LABELS } from "@/lib/taxonomy";
import { CategoryBadge } from "./CategoryBadge";

const REASON_LABELS: Record<
  RejectedFinding["reason"],
  { label: string; tone: string; why: string }
> = {
  TEXT_SPAN_NOT_FOUND: {
    label: "Quote not in clause",
    tone: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    why: "The model quoted text that doesn't appear in this clause.",
  },
  CITATION_NOT_IN_CORPUS: {
    label: "Citation not in corpus",
    tone: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    why: "The cited regulation isn't in our FAR/DFARS/ITAR/CMMC database.",
  },
  SCHEMA_INVALID: {
    label: "Schema invalid",
    tone: "bg-red-500/15 text-red-300 border-red-500/40",
    why: "The model output didn't match the required finding shape.",
  },
};

function extractClaimedQuote(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as { textSpan?: { quote?: unknown } };
  const quote = obj.textSpan?.quote;
  return typeof quote === "string" ? quote : null;
}

export function RejectedDrawer({ rejected }: { rejected: RejectedFinding[] }) {
  return (
    <section className="flex h-full flex-col overflow-hidden bg-[var(--color-bg)]">
      <header className="border-b border-slate-800 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-100">
          Rejected drafts{" "}
          <span className="font-mono text-sm text-slate-500">· {rejected.length}</span>
        </h2>
        <p className="text-[12px] text-slate-500">
          Drafts the mechanical verifier dropped. Visible by design: hallucination guard is binding,
          and silent failures hide bugs.
        </p>
      </header>
      <div className="scroll-thin flex-1 overflow-y-auto p-5">
        {rejected.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-800 px-3 py-4 text-sm text-slate-500">
            No rejected drafts. Either the model produced only clean output, or it abstained.
          </p>
        ) : (
          <ul className="space-y-3">
            {rejected.map((r) => {
              const tag = REASON_LABELS[r.reason];
              const claimedQuote = extractClaimedQuote(r.rawDraft);
              return (
                <li
                  key={r.findingId}
                  className="rounded-md border border-slate-800 bg-[var(--color-panel)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tag.tone}`}
                    >
                      {tag.label}
                    </span>
                    <CategoryBadge cat={r.category} />
                    <span className="font-mono text-[11px] text-slate-500">{r.clauseId}</span>
                  </div>

                  <dl className="mt-3 space-y-2 text-[12.5px]">
                    <div>
                      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Category
                      </dt>
                      <dd className="text-slate-200">
                        {CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] ?? r.category}
                      </dd>
                    </div>
                    {claimedQuote && (
                      <div>
                        <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          Quote the model claimed
                        </dt>
                        <dd>
                          <blockquote className="mt-0.5 rounded border-l-2 border-orange-500/60 bg-slate-900/60 px-2 py-1 italic text-slate-300">
                            &ldquo;{claimedQuote}&rdquo;
                          </blockquote>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Why dropped
                      </dt>
                      <dd className="text-slate-300">{tag.why}</dd>
                    </div>
                  </dl>

                  <details className="mt-3 group">
                    <summary className="cursor-pointer text-[11px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-300">
                      Show raw model output
                    </summary>
                    <pre className="scroll-thin mt-2 max-h-64 overflow-auto rounded bg-slate-950/70 p-2 text-[11px] leading-snug text-slate-400">
                      {JSON.stringify(r.rawDraft, null, 2)}
                    </pre>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
