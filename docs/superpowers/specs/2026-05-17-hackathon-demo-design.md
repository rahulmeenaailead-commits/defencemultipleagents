# Hackathon Demo Design — DCR

**Date:** 2026-05-17 · **Status:** Approved · **Deadline:** ~48h · **Format:** plain markdown (not RTF)

A scope-cut of the full sub-project C spec into one deployable Next.js app. Judge can upload a PDF, see risky clauses + scores + plain-language actions, and click any finding for the **proof panel** (quoted span, cited reg, verifier badges, audit trail).

## In / Out

**In (48h):** PDF upload · clause segmentation · in-memory concept cache · 3-pass pipeline (per-clause → cross-ref → hidden) · mechanical verifier · DeepSeek behind `ModelProvider` · 3-screen UI · Vercel deploy · 1 sample PDF preloaded.

**Out:** LLM verifier (pass 2 of full spec) · retrieval/versioned reg corpus · local model · persistent storage · auth · eval harness · queue/Postgres/scale.

## Architecture

Single Next.js 15 App Router TS app on Vercel. No separate backend.

```
src/
├── app/api/analyze/route.ts          # POST PDF → full result (~10s)
├── app/page.tsx, analysis/[jobId]/page.tsx
├── lib/
│   ├── providers/{base,deepseek}.ts  # ModelProvider abstraction
│   ├── pdf/parse.ts                  # pdf-parse
│   ├── clauses/segment.ts
│   ├── concepts/extract.ts
│   ├── pipeline/{extractor,verifier,cross_ref,hidden}.ts
│   ├── store/conceptCache.ts         # in-memory per-jobId Map
│   ├── taxonomy.ts                   # 15-cat enum
│   ├── regCorpus.ts                  # ~50 FAR/DFARS citations
│   ├── schema.ts                     # Zod RiskFinding
│   └── prompts/
└── components/{UploadDropzone,ProgressStages,ClauseList,ClauseDetail,ProofPanel,RejectedDrawer}.tsx
```

**Stack:** Next.js 15 · TS strict · Tailwind v4 · shadcn/ui · framer-motion · Zod · `openai` SDK→`api.deepseek.com` · `pdf-parse` · `p-limit` · vitest.

## Data flow

```
POST /api/analyze
  → parsePDF → segmentClauses → extractConcepts (||, ≤10)
  → PASS 1 extractor (||, ≤10) → mechanical verifier
       drops on: span not exact-substring | citation not in corpus | schema fail
  → PASS 2 cross_ref (regex finds pairs → LLM per pair → verifier)
  → PASS 3 hidden   (1 batched LLM call over surviving findings)
  → { jobId, clauses, verifiedFindings, rejectedFindings, crossRefFindings, hiddenFindings }
```

Target wall-clock: ~10s for a 20-clause PDF.

## Schema (Zod, condensed)

```ts
RiskCategory = enum(15)            // closed
Severity     = LOW|MEDIUM|HIGH|CRITICAL
RiskFinding  = {
  findingId, clauseId, category, severity, riskScore: 0–100, confidence: 0–1,
  textSpan:           {quote, charStart, charEnd},        // verifier ✓ exact-substring
  regulatoryCitation: {citationId, citationText} | null,  // verifier ✓ in regCorpus
  reasoning, recommendedAction, redlineSuggestion,
  provenance: {promptHash, modelId, extractedAt, passType, relatedClauseIds[]}
}
RejectedFinding = {findingId, clauseId, category,
                   reason: TEXT_SPAN_NOT_FOUND|CITATION_NOT_IN_CORPUS|SCHEMA_INVALID,
                   rawDraft}
```

## Anti-hallucination (Goal 1 headline)

| # | Guarantee | How |
|---|---|---|
| 1 | Closed taxonomy | Zod enum → invalid → drop |
| 2 | Closed reg list | `regCorpus.has(citationId)` → false → drop |
| 3 | Exact-substring evidence | `clauseText.includes(quote)` → false → drop |
| 4 | Abstention first-class | Prompt invites `[]`; we never penalize empty |
| 5 | Visible rejections | Rejected drafts shown in UI "Rejected (N)" drawer with reason |

Provenance (promptHash, modelId, extractedAt, passType) on every persisted finding.

## 3-pass pipeline (Goal 3)

| Pass | What | LLM calls / 20-clause PDF |
|---|---|---|
| 1 Per-clause | Clause+concepts → draft findings → verifier | ~20 (||, ≤10) |
| 2 Cross-ref | Regex finds `see clause N`/`§N.N` → LLM per pair | ~3–5 |
| 3 Hidden | 1 batched call over surviving findings | 1 |

## UI

Dark, professional (slate/zinc, severity reds/ambers, mono for IDs). Three screens:

1. **Landing**: H1 + dropzone + "Try sample" + 4 trust badges
2. **Analyzing**: 5-line staged progress (Parse → Concepts → Pass 1 (N/M) → Pass 2 → Pass 3)
3. **Results**: 3 columns — left clause list (severity-grouped, "Rejected (N)" drawer) · center clause text with `<mark>` spans + finding cards (category, score, reasoning, action, redline, "See proof") · **right proof panel** (verifier badges, cited reg in full, provenance). Tabs: Per-clause · Cross-ref · Hidden · Rejected.

## Error handling

| Failure | Behavior |
|---|---|
| PDF parse fail | 400 + toast "use text-based PDF or sample" |
| DeepSeek 5xx / rate limit | 1 retry (200ms, 800ms), then mark clause `analysisError`, rest renders |
| Invalid LLM JSON | Zod fails → `SCHEMA_INVALID` in rejectedFindings |
| Vercel timeout | Return partial + `timedOut: true` |

## Testing

Vitest: schema round-trip, verifier on good/bad fixtures, segmenter on sample. One integration test of `/api/analyze` with stub `ModelProvider`. Manual DeepSeek run before each deploy.

## 48h timeline

| Block | h | Deliverable |
|---|---|---|
| 0 Setup | 0–2 | next-app, Tailwind, shadcn, Vercel `/healthz`, env vars |
| 1 Backend skeleton | 2–8 | provider, schema, taxonomy, regCorpus, PDF parse, segment, cache, unit tests |
| 2 Pass 1 | 8–14 | extractor + verifier + e2e integration test |
| 3 UI screens 1–2 | 14–20 | Landing + staged progress, dark theme |
| 4 UI screen 3 | 20–30 | 3-col results with **proof panel** + rejected drawer |
| 5 Passes 2+3 | 30–36 | cross-ref + hidden + UI tabs |
| 6 Polish | 36–44 | animations, errors, sample PDF, README |
| 7 Buffer | 44–48 | bugs, deploy, **backup demo video** |

**Cut order if behind:** drop Pass 3 → drop Pass 2. **Never cut:** proof panel, verifier badges, rejected drawer.

## Relationship to full spec

Scope-reduction, not replacement. Disposition:

| Full spec | Hackathon |
|---|---|
| C1 Extractor | Implemented (single LLM call) |
| C2 Verifier | **Mechanical only** (LLM verifier deferred) |
| C3 Reg corpus | Closed JSON list, no retrieval/versioning |
| C4–C5 Rule/taxonomy library | Enum only, no library |
| C6 Orchestrator | Inline in `/api/analyze` |
| C7 Provider abstraction | **Implemented in full** (enables Goal 2 swap) |
| C8 Findings store | In-memory per-jobId |
| C9 Eval harness · C10 Review queue | Not built · "Rejected" drawer (no backend) |
| A (PDF) · B (concepts) · D (cross-ref) · E (interdep) · F (UI) | Implemented inline (B in-memory, D=Pass 2, E=Pass 3) |
| G (local model) · H (scale) | Not built (G is a config swap from provider abstraction) |

Python M1 plan in [docs/superpowers/plans/](../plans/) is **paused**. Post-demo: either resume Python or harden TS by porting.

## Open questions (accepted unanswered for 48h)

- Exact ~50 citations: I'll seed FAR 52.227-1, 52.228-7, 52.249-2, DFARS 252.204-7012, 252.227-7013, 252.225-7048, ITAR §120–130, CMMC L2. Editable post-demo.
- Severity vs. riskScore consistency: prompt asks both, verifier doesn't enforce.
- Image-only PDFs: out of scope; UI says "use text-based PDF".
