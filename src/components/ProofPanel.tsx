"use client";

import type { RiskFinding } from "@/lib/schema";
import { SeverityBadge } from "./SeverityBadge";
import { CategoryBadge } from "./CategoryBadge";

export function ProofPanel({ finding }: { finding: RiskFinding | null }) {
  if (!finding) {
    return (
      <aside className="flex h-full flex-col border-l border-slate-800 bg-[var(--color-panel-2)] p-5 text-sm text-slate-500">
        <h2 className="mb-2 text-xs font-mono uppercase tracking-wider text-slate-500">Proof</h2>
        <p>Select a finding to see the verifier proof: quoted span, cited regulation, audit trail.</p>
      </aside>
    );
  }
  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto border-l border-slate-800 bg-[var(--color-panel-2)] p-5">
      <header>
        <div className="flex items-center gap-2">
          <SeverityBadge sev={finding.severity} />
          <CategoryBadge cat={finding.category} />
        </div>
        <h2 className="mt-2 text-sm font-semibold text-slate-100">Verifier proof</h2>
        <p className="text-[11px] text-slate-500">
          Every persisted finding passes three mechanical checks. Here&apos;s the evidence.
        </p>
      </header>

      <ProofRow
        label="Quoted span ⊂ clause text"
        ok
        body={
          <blockquote className="rounded border-l-2 border-sky-500/60 bg-slate-900/60 px-3 py-2 text-[13px] italic text-slate-200">
            &ldquo;{finding.textSpan.quote}&rdquo;
          </blockquote>
        }
        meta={`char ${finding.textSpan.charStart}–${finding.textSpan.charEnd}`}
      />

      <ProofRow
        label="Citation ∈ closed corpus"
        ok={!!finding.regulatoryCitation}
        body={
          finding.regulatoryCitation ? (
            <div>
              <p className="font-mono text-xs text-sky-300">{finding.regulatoryCitation.citationId}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-slate-300">
                {finding.regulatoryCitation.citationText}
              </p>
            </div>
          ) : (
            <p className="text-[12px] italic text-slate-500">
              No citation asserted. Finding stands on the clause text alone.
            </p>
          )
        }
      />

      <ProofRow
        label="Schema valid (Zod)"
        ok
        body={
          <p className="text-[12px] text-slate-400">
            All required fields present; category ∈ closed taxonomy; severity ∈ enum.
          </p>
        }
      />

      <section>
        <h3 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Audit trail
        </h3>
        <dl className="mt-2 space-y-1 rounded border border-slate-800 bg-slate-900/40 p-3 font-mono text-[11px] text-slate-300">
          <Row k="findingId" v={finding.findingId} />
          <Row k="passType" v={finding.provenance.passType} />
          <Row k="modelId" v={finding.provenance.modelId} />
          <Row k="promptHash" v={finding.provenance.promptHash} />
          <Row k="extractedAt" v={finding.provenance.extractedAt} />
          {finding.provenance.relatedClauseIds.length > 0 && (
            <Row k="relatedClauseIds" v={finding.provenance.relatedClauseIds.join(", ")} />
          )}
        </dl>
      </section>
    </aside>
  );
}

function ProofRow({
  label,
  ok,
  body,
  meta,
}: {
  label: string;
  ok: boolean;
  body: React.ReactNode;
  meta?: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span
          className={
            ok
              ? "inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-300"
              : "inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[10px] text-slate-400"
          }
        >
          {ok ? "✓" : "—"}
        </span>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">{label}</h3>
        {meta && <span className="ml-auto font-mono text-[10px] text-slate-500">{meta}</span>}
      </div>
      <div className="mt-2 pl-6">{body}</div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-32 shrink-0 text-slate-500">{k}</span>
      <span className="break-all text-slate-200">{v}</span>
    </div>
  );
}
