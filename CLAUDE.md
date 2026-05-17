# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Main entry. Other `.md` files are references — load on demand by filename, don't preload.**

## What this is

Defense Contract Reviewer (DCR) — hackathon demo (48h). Next.js 15 App Router TS app. Upload a defense contract PDF → see risky clauses with severity, plain-language actions, redline suggestions, and a **proof panel** showing the quoted span + cited reg + verifier badges + audit trail.

Active design: [docs/superpowers/specs/2026-05-17-hackathon-demo-design.md](docs/superpowers/specs/2026-05-17-hackathon-demo-design.md). Modular version: [docs/superpowers/specs/hackathon/00-index.md](docs/superpowers/specs/hackathon/00-index.md).

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start
npm test             # vitest
npm test -- path/to.test.ts
npm run lint
npm run typecheck
```

`DEEPSEEK_API_KEY` is **optional**. Without it, `/api/analyze` uses a stub provider that returns deterministic fake findings — the UI works end-to-end immediately. Set the key in `.env.local` to switch to real DeepSeek.

## Architecture (one-line per file)

```
src/
├── app/
│   ├── api/analyze/route.ts          POST → runs full pipeline, returns jobId + result
│   ├── page.tsx                      Screen 1: landing + dropzone + "Try sample"
│   ├── analysis/[jobId]/page.tsx     Screens 2 + 3: progress, then 3-col results
│   └── layout.tsx, globals.css
├── lib/
│   ├── providers/{base,stub,deepseek,index}.ts   ModelProvider abstraction (full-spec Goal 2)
│   ├── pdf/parse.ts                              pdf-parse via /lib path (avoids Next bug)
│   ├── clauses/segment.ts                        regex-split on "1.", "§N.N", etc.
│   ├── concepts/extract.ts                       per-clause concept tagging (regex)
│   ├── pipeline/
│   │   ├── extractor.ts                          Pass 1: per-clause findings
│   │   ├── verifier.ts                           mechanical: span ⊂ text, citation ∈ corpus, schema ✓
│   │   ├── cross_ref.ts                          Pass 2: clause pairs (regex → LLM)
│   │   └── hidden.ts                             Pass 3: batched whole-doc LLM call
│   ├── store/{conceptCache,jobs}.ts              in-memory per-jobId Maps
│   ├── taxonomy.ts                               15-category Zod enum (closed)
│   ├── regCorpus.ts                              FAR/DFARS/ITAR/CMMC citations (closed)
│   ├── schema.ts                                 Zod RiskFinding, RejectedFinding
│   ├── prompts/                                  string prompts per pass
│   └── sample.ts                                 hardcoded sample contract text
└── components/                                   Upload, Progress, ClauseList, ClauseDetail, ProofPanel, RejectedDrawer
```

## Binding constraints

- **No provider SDK import outside `src/lib/providers/`.** Enables the cloud→local swap (full-spec Goal 2).
- **Determinism:** every LLM call uses `temperature=0`.
- **Audit trail:** every persisted finding carries `{promptHash, modelId, extractedAt, passType}`. Missing → unshippable.
- **Mechanical verifier is the headline guarantee.** The 5 hallucination guards in the design doc §"Anti-hallucination" are non-negotiable.

## Reference docs (load by filename, not directory scan)

Most likely needed:
- [docs/superpowers/specs/2026-05-17-hackathon-demo-design.md](docs/superpowers/specs/2026-05-17-hackathon-demo-design.md) — canonical single-file plain-markdown design
- [docs/superpowers/specs/hackathon/](docs/superpowers/specs/hackathon/) — same design split into 10 files (`00-index`, `01-scope`, `02-architecture`, `03-data-flow`, `04-schema`, `05-hallucination`, `06-pipeline`, `07-ui`, `08-errors`, `09-testing`, `10-timeline`)

Full Python design (hackathon-paused, **RTF-wrapped** — real content is between `\f0\fs24 \cf0` and the trailing `}`):
- [docs/superpowers/specs/](docs/superpowers/specs/) `01`…`23` — filenames are self-describing (`03-taxonomy.md`, `04-schema.md`, `12-c7-provider-abstraction.md`, `23-cross-cutting-constraints.md`)
- [docs/superpowers/plans/](docs/superpowers/plans/) `01`…`16` — Python M1 plan, paused

**Don't "fix" the RTF wrapping** of the Python design files.

## Gotchas

- `pdf-parse` triggers `ENOENT ./test/data/...` if imported via the package root in Next.js. Import from `pdf-parse/lib/pdf-parse.js` instead.
- Without `DEEPSEEK_API_KEY`, the stub provider is auto-selected by the factory in `src/lib/providers/index.ts` — don't add fallback shims elsewhere.
- Tailwind v4 uses config-in-CSS (`@theme` block in `globals.css`); there is no `tailwind.config.ts`.
- API route uses Node runtime (`export const runtime = "nodejs"`) because `pdf-parse` requires Node, not Edge.
