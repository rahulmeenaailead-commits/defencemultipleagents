# Contractor-Facing Summary View — Design Spec

**Date:** 2026-05-18
**Status:** Approved
**Supersedes (partially):** [2026-05-17-hackathon-demo-design.md](2026-05-17-hackathon-demo-design.md) — UI section only. Pipeline, schema, verifier remain unchanged.

## 1. Problem

The current `/analysis/[jobId]` results page is engineer-facing: a 3-column expert view with raw JSON in the rejected-drafts drawer, a monospace `findingId / passType / modelId / promptHash / extractedAt` audit trail in the proof panel, and a top bar that surfaces `documentChars / elapsedMs / providerId`. A contractor uploading a contract sees what looks like a developer dashboard, not a contract review.

Goal: a non-technical contractor (contracting officer, program manager, small-business owner reviewing a defense subcontract) should understand the verdict and what to push back on in under 30 seconds, without ever seeing JSON.

## 2. Scope

In scope:
- Replace single results page with a tabbed view: **Summary** (default) · **All clauses** · **Technical**
- New contractor-facing Summary tab with risk verdict hero + top risks list
- New "All clauses" flat-list tab
- Cleanup of JSON-y surfaces in the Technical tab (rejected drawer raw JSON, proof panel audit trail) — collapsed behind `<details>`

Out of scope:
- No new LLM calls (no "executive summary" generation; keeps audit-trail story + latency intact)
- No export / share / PDF
- No filter / search UI on Summary tab
- No changes to API, pipeline, schema, or verifier
- Provider abstraction, regulatory corpus, taxonomy — untouched

## 3. Information architecture

Three tabs, audience-segmented (replacing today's pass-type tabs which pivoted on PER_CLAUSE / CROSS_REF / HIDDEN — that segmentation moves inside the Technical tab):

| Tab | Default | Audience | Layout |
|---|---|---|---|
| **Summary** | ✓ | Non-technical contractor | Single centered column, vertical scroll |
| **All clauses** |  | Contractor doing deeper read-through | Single full-width column, every clause + its findings inline |
| **Technical** |  | Engineer / auditor / verifier review | Today's 3-column expert view, near-unchanged |

The current `TopBar` keeps document title and a *compact* metadata strip; the tab switcher takes its right side.

## 4. Summary tab

Single column, max-width centered (`max-w-3xl` or similar), vertical scroll.

### 4.1 Risk verdict hero

A prominent block at top showing:
- Traffic-light dot — red / orange / yellow / green
- Verdict word: **HIGH RISK** · **REVIEW NEEDED** · **MOSTLY CLEAN** · **ALL CLEAR**
- Numeric score `N / 100`
- Tally chip: `6 risky clauses · 2 critical · 3 high · 1 medium`

### 4.2 Risk score (deterministic, no LLM)

Compute `score = clamp(0, 100, sum(weights))` where each finding contributes by severity:

| Severity | Points |
|---|---|
| CRITICAL | 25 |
| HIGH | 12 |
| MEDIUM | 5 |
| LOW | 1 |

Findings counted: `verifiedFindings ∪ crossRefFindings ∪ hiddenFindings` (deduplicated by `findingId`).

Verdict thresholds:

| Score | Verdict | Color |
|---|---|---|
| ≥ 60 | HIGH RISK | red |
| 25 – 59 | REVIEW NEEDED | orange/yellow |
| 1 – 24 | MOSTLY CLEAN | yellow-green |
| 0 | ALL CLEAR | green |

### 4.3 Top risks list

Below the hero:
- Heading: "TOP RISKS"
- Cards sorted by: `severity` (CRITICAL > HIGH > MEDIUM > LOW), then `riskScore` desc
- Default show top 5; "+ show N more" button expands to the full list

Each card:
- **Severity dot** (red / orange / yellow) + **clause number** (e.g. `§4`) + **severity label** (e.g. `CRITICAL`)
- **Headline** = category label from `CATEGORY_LABELS` (e.g. "Indemnification")
- **One-liner** = first sentence of `finding.reasoning` (truncate to ~140 chars)
- **💡 Recommended action chip** = `finding.recommendedAction` (truncate to one line, full text on hover or in drawer)
- **Button: "See clause text →"** opens a right-side drawer (slides in over the Summary tab, dismissable) containing:
  - Clause heading + number
  - Full clause text with the `textSpan.quote` highlighted
  - Regulatory citation if present (`citationId` + `citationText`)
  - NO audit trail, NO finding IDs, NO model IDs

Special badges on the card (in addition to clause number):
- Cross-ref finding: `Across §X and §Y` badge — derived from `provenance.relatedClauseIds`
- Hidden finding: `🔍 Hidden risk` badge — derived from `provenance.passType === "HIDDEN"`

### 4.4 Footer link

"→ Open technical detail" — switches to the Technical tab.

## 5. All clauses tab

Full-width single column. For each clause in `result.clauses`:
- Clause heading + number
- Full clause text
- Findings on that clause inline (reuse the existing `FindingCard` component, which already shows severity, category, reasoning, recommended action, redline)

No sidebar, no proof panel. This is the "I want to skim the whole contract with risks called out" view.

## 6. Technical tab

Today's 3-column `ResultsView` body, unchanged structurally:
- Left: `ClauseList`
- Middle: `ClauseDetail` (or `RejectedDrawer` when opened)
- Right: `ProofPanel`

Today's pass-type filter (`PER_CLAUSE / CROSS_REF / HIDDEN`) moves into this tab as an inner control (e.g. a row of pills above the clause list), since this view is now scoped to engineers / auditors who care about which pass produced a finding.

Two JSON-cleanup edits:

### 6.1 RejectedDrawer

Each rejected item currently renders the raw `rawDraft` via `JSON.stringify` in a `<pre>` block. New layout:
- Plain-English reason at top (e.g. "Citation not in corpus" — already exists via `REASON_LABELS`)
- Category label (already exists via `CategoryBadge`)
- The quoted phrase the model claimed (extract `rawDraft.textSpan?.quote` if present, otherwise show "—")
- Why dropped (one line of plain explanation, e.g. "That citation isn't in our FAR/DFARS database.")
- Collapsed `<details>` block: `Show raw model output` reveals the existing JSON `<pre>` for engineers

### 6.2 ProofPanel audit trail

The three verifier rows (quote ⊂ clause, citation ∈ corpus, schema valid) **stay visible** — they are the headline trust signals.

The provenance block (`findingId / passType / modelId / promptHash / extractedAt`) moves into a collapsed `<details>` labeled "Provenance & audit trail". The existing key-value table renders unchanged inside.

## 7. Components

### New
- `<ContractorSummary result={result} />` — renders the Summary tab body. Pure render of `AnalysisResult`.
- `<RiskVerdictHero score={number} verdict={Verdict} counts={{critical, high, medium, low}} />`
- `<TopRiskCard finding={f} clause={c} onOpen={(f) => void} />` — single card in the top-risks list
- `<ClauseDetailDrawer clause={c} finding={f} onClose={() => void} />` — right-side slide-in drawer opened from a top-risk card
- `<AllClausesView result={result} />` — flat clause list with inline findings
- `lib/risk/score.ts` — exports `computeOverallRisk(result): { score, verdict, counts, total }`

### Refactored
- `ResultsView.tsx` — pulls today's 3-column body (with its pass-type filter, clause selection, finding selection state) into a new `<ExpertView result={result} />` component. Top-level `ResultsView` becomes a tab switcher: `Summary | All clauses | Technical`, defaults to Summary.
- `RejectedDrawer.tsx` — adds plain-English header, hides raw JSON behind `<details>`
- `ProofPanel.tsx` — wraps audit trail dl in `<details>`

### Unchanged
- `ClauseList`, `ClauseDetail`, `FindingCard`, `SeverityBadge`, `CategoryBadge`, `UploadDropzone`, all of `lib/pipeline`, `lib/providers`, `lib/schema`, `lib/taxonomy`, `lib/regCorpus`.

## 8. Data flow

```
AnalysisResult (already produced by /api/analyze)
  ↓
ResultsView (chooses tab)
  ├─ Summary    → computeOverallRisk(result) → RiskVerdictHero
  │              → sort+slice findings       → TopRiskCard × N
  │                                          → ClauseDetailDrawer (on open)
  ├─ All clauses → result.clauses.map → clause + inline FindingCard
  └─ Technical  → existing ClauseList | ClauseDetail | ProofPanel
                  RejectedDrawer (raw JSON collapsed)
                  ProofPanel    (audit trail collapsed)
```

No new API endpoints. No new state in `lib/store/jobs.ts`. No new prompts. Risk score is computed on the client at render time.

## 9. Edge cases

- **0 findings**: hero shows green `ALL CLEAR`, score `0 / 100`, tally `No risks detected`. Top risks list shows an empty-state ("Nothing flagged — but always read the full contract.").
- **Stub provider**: `<StubBanner>` continues to render above the tabbed content (it's already there in `ResultsView`).
- **Pipeline errors / DOC_NOT_SEGMENTED**: `<ErrorBanner>` continues to render above the tabbed content unchanged.
- **Fewer than 5 findings**: don't render "+ show N more"; render all of them.
- **Cross-ref finding with empty `relatedClauseIds`**: omit the "Across §X and §Y" badge, fall back to single clause number.
- **`recommendedAction` empty/null**: omit the 💡 chip rather than show a blank.

## 10. Determinism & audit-trail invariants

- Risk score is a pure function of the persisted findings — same input ⇒ same score, no LLM involved. Reproducible.
- All existing audit-trail fields (`promptHash`, `modelId`, `extractedAt`, `passType`) remain on every finding and are still visible in the Technical tab. Nothing is hidden from the engineer — only repackaged for the contractor.
- The mechanical verifier guarantees still hold: every finding shown on the Summary tab has already passed `quote ⊂ clauseText`, `citation ∈ regCorpus`, and Zod schema validation.

## 11. Testing

- Unit: `computeOverallRisk` — thresholds, clamping, dedup by `findingId`, empty case.
- Render: `ContractorSummary` with 0 / 1 / 5 / 12 findings; verify "+ show N more" toggles.
- Render: `TopRiskCard` with cross-ref finding (badge appears), hidden finding (badge appears), missing `recommendedAction` (chip omitted).
- Render: `RejectedDrawer` with raw JSON collapsed by default.
- Render: `ProofPanel` with audit trail collapsed by default.
- E2E (manual hackathon-style): upload sample contract → land on Summary → top 5 risks shown → click "See clause text" → drawer with highlighted span → switch to Technical tab → existing expert view intact.

## 12. Open questions

None at design time. Threshold values (60 / 25 / 1) and severity weights (25 / 12 / 5 / 1) are gut-feel from hackathon scope; revisit after demo if they over- or under-trigger on real contracts.
