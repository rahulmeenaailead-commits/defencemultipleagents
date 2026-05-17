import { UploadDropzone } from "@/components/UploadDropzone";

const TRUST_BADGES = [
  { label: "Closed taxonomy", detail: "15 categories" },
  { label: "Closed reg corpus", detail: "FAR · DFARS · ITAR · CMMC" },
  { label: "Exact-substring evidence", detail: "every quote verified" },
  { label: "Full audit trail", detail: "promptHash · modelId · pass" },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-10 px-6 pt-20 pb-24">
      <header className="flex w-full flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
          Defense Contract Reviewer
          <span className="text-slate-700">·</span>
          <span className="text-slate-600">hackathon demo</span>
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-100 md:text-5xl">
          Find the buried risks in a defense contract.
          <br />
          <span className="text-slate-400">With proof.</span>
        </h1>
        <p className="max-w-xl text-base text-slate-400">
          Upload a PDF. Get per-clause risk findings, regulatory citations, plain-language actions,
          and redline suggestions — every finding backed by a quoted span and a closed-list
          citation that the verifier mechanically checks.
        </p>
      </header>

      <section className="w-full">
        <UploadDropzone />
      </section>

      <section className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
        {TRUST_BADGES.map((b) => (
          <div
            key={b.label}
            className="rounded-md border border-slate-800 bg-[var(--color-panel)] px-3 py-2"
          >
            <p className="text-[11px] font-medium text-slate-200">{b.label}</p>
            <p className="text-[10px] text-slate-500">{b.detail}</p>
          </div>
        ))}
      </section>

      <footer className="mt-auto text-xs text-slate-600">
        Mechanical verifier · 3-pass pipeline · DeepSeek behind <code>ModelProvider</code>{" "}
        abstraction · in-memory only.
      </footer>
    </main>
  );
}
