# Task 11 — End-to-end smoke test

**Files:** (none)

Verifies the whole feature works together on a real run. No code changes unless smoke testing surfaces a defect.

---

- [ ] **Step 1: Ensure dev server is running**

`npm run dev` (skip if it's already up on http://localhost:3000).

- [ ] **Step 2: Sample contract path**

Open http://localhost:3000 in a fresh browser tab and click **"Try sample contract"**. Verify:

- Lands on **Summary** tab.
- Risk-verdict hero shows a score, a verdict word, and a tally.
- Top-risks cards render (or empty-state callout if the sample produces zero findings).
- Click any "See clause text →" → drawer slides in showing the clause text with the quote highlighted, plus the recommended-action box and (if present) the cited regulation.
- Press Escape → drawer closes. Click the backdrop → drawer closes.
- Click **All clauses** → flat full-width clause list, with inline findings under each clause that has any.
- Click **Technical** → today's 3-column expert view, with pass-type filter pills (`Per-clause / Cross-reference / Hidden risks`) at the top.
- In Technical, click "Rejected by verifier · N" in `ClauseList` → see plain-English rejection summaries; raw JSON is collapsed under "Show raw model output".
- Click a finding card in Technical → `ProofPanel` shows three verifier rows by default; "Provenance & audit trail" is collapsed.

- [ ] **Step 3: PDF upload path**

Return to http://localhost:3000, drag-and-drop a real defense contract PDF (or one of the test fixtures). Repeat the checks from Step 2. If the document doesn't segment, the existing `DOC_NOT_SEGMENTED` `ErrorBanner` should still render above the tab content.

- [ ] **Step 4: Run the full test + typecheck + lint suite**

```bash
npm test
npm run typecheck
npm run lint
```

Expected: all pass; no new failures vs. baseline.

- [ ] **Step 5: Final commit if anything was tweaked**

If smoke testing surfaced small fixes, commit them:

```bash
git add -A
git commit -m "fix(ui): smoke-test follow-ups"
```

If nothing was needed, skip.

---

## Done

If every checkbox in tasks 1–11 is ticked and the smoke test passes, the contractor-facing summary UI is shipped. The original spec's "Done criteria" in the [plan index](../2026-05-18-contractor-summary-ui.md) should now all hold.
