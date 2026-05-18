# Contractor-Facing Summary View — Implementation Plan (Index)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Each task file uses checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current expert-first `/analysis/[jobId]` page with a 3-tab view (Summary | All clauses | Technical), defaulting to a contractor-friendly Summary tab with a traffic-light risk verdict and plain-English top-risks cards. Clean up JSON-y surfaces in the Technical tab.

**Architecture:** Pure client-side render layer change. No API, schema, prompt, or pipeline modifications. A new deterministic risk-score utility computes a verdict from the existing persisted findings. New presentational components compose into the Summary and All-clauses tabs; the existing 3-column layout is extracted as-is into an `ExpertView` and shown under the Technical tab.

**Tech stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind v4 · Vitest · Zod (schema already in place).

**Reference spec:** [docs/superpowers/specs/2026-05-18-contractor-summary-ui-design.md](../specs/2026-05-18-contractor-summary-ui-design.md)

---

## File map

| Path | Status | Responsibility |
|---|---|---|
| `src/lib/risk/score.ts` | Create | Deterministic risk scoring + verdict derivation |
| `src/lib/risk/score.test.ts` | Create | Unit tests for `computeOverallRisk` |
| `src/components/RiskVerdictHero.tsx` | Create | Traffic-light hero block at the top of Summary |
| `src/components/TopRiskCard.tsx` | Create | One card in the top-risks list |
| `src/components/ClauseDetailDrawer.tsx` | Create | Right-side slide-in opened from a TopRiskCard |
| `src/components/ContractorSummary.tsx` | Create | Hero + top-risks list + drawer composition |
| `src/components/AllClausesView.tsx` | Create | Full-width clause-by-clause list |
| `src/components/ExpertView.tsx` | Create | Extracted 3-column body + inner pass-type filter |
| `src/components/ResultsView.tsx` | Modify | Becomes the top-level tab switcher |
| `src/components/RejectedDrawer.tsx` | Modify | Plain-English header; raw JSON behind `<details>` |
| `src/components/ProofPanel.tsx` | Modify | Provenance/audit trail behind `<details>` |

Existing components that remain untouched and are reused: `ClauseList`, `ClauseDetail`, `SeverityBadge`, `CategoryBadge`, `UploadDropzone`.

---

## Tasks

Each task lives in its own file under [`contractor-summary-ui/`](contractor-summary-ui/). Execute in order — Task 8 is the integration moment; after it, the new UI is live.

| # | Title | File |
|---|---|---|
| 1 | Risk score utility (TDD) | [01-risk-score.md](contractor-summary-ui/01-risk-score.md) |
| 2 | RiskVerdictHero component | [02-risk-verdict-hero.md](contractor-summary-ui/02-risk-verdict-hero.md) |
| 3 | ClauseDetailDrawer component | [03-clause-detail-drawer.md](contractor-summary-ui/03-clause-detail-drawer.md) |
| 4 | TopRiskCard component | [04-top-risk-card.md](contractor-summary-ui/04-top-risk-card.md) |
| 5 | ContractorSummary composition | [05-contractor-summary.md](contractor-summary-ui/05-contractor-summary.md) |
| 6 | AllClausesView component | [06-all-clauses-view.md](contractor-summary-ui/06-all-clauses-view.md) |
| 7 | Extract ExpertView from ResultsView | [07-expert-view.md](contractor-summary-ui/07-expert-view.md) |
| 8 | ResultsView becomes tab switcher | [08-results-view-tabs.md](contractor-summary-ui/08-results-view-tabs.md) |
| 9 | RejectedDrawer — collapse raw JSON | [09-rejected-drawer.md](contractor-summary-ui/09-rejected-drawer.md) |
| 10 | ProofPanel — collapse audit trail | [10-proof-panel.md](contractor-summary-ui/10-proof-panel.md) |
| 11 | End-to-end smoke test | [11-smoke-test.md](contractor-summary-ui/11-smoke-test.md) |

---

## Done criteria

- `npm test` passes with the new `score.test.ts` suite included.
- `npm run typecheck` and `npm run lint` pass clean.
- Uploading the sample contract lands on the Summary tab and shows the traffic-light hero + top-risks cards.
- Clicking "See clause text →" opens a drawer with the clause text and highlighted quote.
- Technical tab still shows today's 3-column layout with the original pass-type filter.
- Rejected drafts drawer no longer dumps raw JSON by default.
- Proof panel no longer shows the `findingId / passType / modelId / promptHash / extractedAt` table by default.

---

## House rules (applies to every task file)

- Each `.md` file in this plan (including this index) is ≤200 lines. If a task grows during execution, split it further; never let a plan file exceed the limit.
- Determinism stays binding: no new LLM calls; risk score is pure client-side compute.
- Audit-trail invariants stay binding: every existing finding still carries `{promptHash, modelId, extractedAt, passType}`; nothing is hidden from the engineer, only repackaged for the contractor.
- Verifier guarantees are unchanged: every finding shown on Summary has already passed `quote ⊂ clauseText`, `citation ∈ regCorpus`, and Zod schema validation.
