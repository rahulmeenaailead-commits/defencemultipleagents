# Defense Contract Reviewer (DCR)

> Upload a defense contract PDF → see risky clauses with severity, plain‑language actions, redline suggestions, and **mechanical proof** that every finding is grounded in the document and a real regulation.

**Live demo:** https://defencemultipleagents.vercel.app
*(Click "Try sample contract →" — no upload needed.)*

---

## Why this exists

LLMs hallucinate clauses, citations, and severities. For defense contracts that's not a UX bug — it's a compliance failure. DCR's headline guarantee is a **mechanical verifier** that runs after every LLM call and rejects findings the model can't prove:

1. **Span must be a literal substring** of the clause text — no paraphrase, no summary.
2. **Citation must come from a closed regulatory corpus** (FAR / DFARS / ITAR / CMMC) — no invented reg numbers.
3. **Concept must be one of 15 taxonomy categories** — no open‑ended labels.
4. **Schema must validate** (Zod) — no shape drift.
5. **Audit trail attached** — `promptHash`, `modelId`, `extractedAt`, `passType` per finding.

Rejected findings aren't hidden — they're surfaced in a drawer with a plain‑English summary of *why* the verifier dropped them. Trust = visible failure cases.

## What you see in the UI

- **Summary tab** — contractor‑friendly view: top risks, suggested redlines, plain‑language explanations.
- **All clauses tab** — every clause, with risk badges and per‑finding proof panel.
- **Technical tab** — 3‑column expert view: clauses, findings, full provenance & raw model output.
- **Rejected drawer** — findings the verifier dropped, with reason.

## Three‑pass pipeline

| Pass | What it does | Why |
|---|---|---|
| 1. Per‑clause extraction | Each clause analyzed independently for risks | Parallelizable, bounded prompt size |
| 2. Cross‑reference | Pairs of related clauses analyzed together | Catches contradictions between clauses |
| 3. Hidden findings | Whole‑document scan (batched) | Catches risks that only appear at document scope |

Every pass goes through the mechanical verifier before findings surface.

## Stack

- **Next.js 15** (App Router, Node runtime for the API route)
- **TypeScript + Zod** for end‑to‑end schema enforcement
- **DeepSeek** via a `ModelProvider` abstraction — swap to any provider without touching pipeline code (stub provider auto‑selected if no API key)
- **Tailwind v4** (config‑in‑CSS)
- `pdf-parse` for PDF text extraction
- In‑memory job storage (hackathon scope; sessionStorage handoff for the deployed demo)

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

`DEEPSEEK_API_KEY` is **optional**. Without it the app uses a deterministic stub provider and the UI works end‑to‑end against the built‑in sample. To analyze real PDFs, copy `.env.local.example` to `.env.local` and add a key from https://platform.deepseek.com.

```bash
npm test             # vitest
npm run typecheck
npm run lint
npm run build
```

## Architecture (one line per file)

```
src/
├── app/
│   ├── api/analyze/route.ts          POST → runs full pipeline, returns result
│   ├── page.tsx                      Landing + dropzone + "Try sample"
│   ├── analysis/[jobId]/page.tsx     Results page (sessionStorage handoff on serverless)
│   └── layout.tsx, globals.css
├── lib/
│   ├── providers/                    ModelProvider abstraction (stub / DeepSeek)
│   ├── pdf/parse.ts                  pdf-parse w/ Next.js workaround + hyphen de-wrap
│   ├── clauses/segment.ts            Regex-split on numbered headings
│   ├── pipeline/
│   │   ├── extractor.ts              Pass 1: per-clause findings
│   │   ├── verifier.ts               Mechanical: span ⊂ text, citation ∈ corpus, schema ✓
│   │   ├── cross_ref.ts              Pass 2: clause pairs
│   │   └── hidden.ts                 Pass 3: batched whole-doc scan
│   ├── taxonomy.ts                   15-category closed Zod enum
│   ├── regCorpus.ts                  FAR/DFARS/ITAR/CMMC citation corpus
│   └── schema.ts                     RiskFinding, RejectedFinding, AnalysisResult
└── components/                       Upload, Results, ClauseList, ProofPanel, RejectedDrawer
```

## Binding constraints (non-negotiable for this codebase)

- **No provider SDK import outside `src/lib/providers/`** — enables cloud→local model swap.
- **Every LLM call uses `temperature=0`** — determinism for audit.
- **Every persisted finding carries its audit trail** — missing = unshippable.
- **Mechanical verifier is the headline guarantee** — the 5 hallucination guards above are non-negotiable.

## Scope (what this demo is and isn't)

- ✅ Procurement contracts with numbered headings (FAR/DFARS‑style)
- ✅ Sample contract bundled — works without an API key
- ⚠️ In‑memory job storage — analysis URLs are not shareable across browsers (sessionStorage handoff on Vercel)
- ❌ Not OCR — scanned/image‑only PDFs won't extract
- ❌ Not OTA, BAA, or grant agreements — taxonomy targets procurement risk specifically

## Built for [hackathon name] · 48h

Single‑developer build. Design doc: [docs/superpowers/specs/2026-05-17-hackathon-demo-design.md](docs/superpowers/specs/2026-05-17-hackathon-demo-design.md).
