# Hackathon Demo Spec — Index

**Date:** 2026-05-17 · **Status:** Approved · **Deadline:** ~48h

Goal: deployable Next.js 15 TS app on Vercel. Judge uploads a PDF → sees risky clauses + scores + plain-language actions → clicks any finding for the **proof panel** (quoted span, cited reg, verifier badges, audit trail). DeepSeek behind `ModelProvider` abstraction.

## Files (load on demand)

- [01-scope.md](01-scope.md) — In / out for the 48h window
- [02-architecture.md](02-architecture.md) — File tree + tech stack
- [03-data-flow.md](03-data-flow.md) — `/api/analyze` pipeline
- [04-schema.md](04-schema.md) — Zod `RiskFinding`, `RejectedFinding`
- [05-hallucination.md](05-hallucination.md) — **Goal 1.** 5 mechanical guarantees
- [06-pipeline.md](06-pipeline.md) — **Goal 3.** Per-clause / cross-ref / hidden passes
- [07-ui.md](07-ui.md) — 3 screens, dark aesthetic, proof panel
- [08-errors.md](08-errors.md) — Failure modes
- [09-testing.md](09-testing.md) — Vitest + 1 integration test
- [10-timeline.md](10-timeline.md) — 48h schedule + cut-list (**most useful during execution**)
- [11-mapping.md](11-mapping.md) — Disposition vs the full Python spec
- [12-open-questions.md](12-open-questions.md) — Accepted unanswered

## Quick links

Binding constraints → [../23-cross-cutting-constraints.md](../23-cross-cutting-constraints.md) (RTF). Headline UI moment = proof panel ([07-ui.md](07-ui.md) §Results). Never cut: proof panel, verifier badges, rejected drawer ([10-timeline.md](10-timeline.md)).
