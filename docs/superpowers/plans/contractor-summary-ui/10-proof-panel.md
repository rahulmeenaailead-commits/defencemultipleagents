# Task 10 — ProofPanel: collapse audit trail behind `<details>`

**Files:** Modify `src/components/ProofPanel.tsx`

The three verifier rows (quote ⊂ clause text, citation ∈ closed corpus, schema valid) **stay visible** — they are the headline trust signals.

The provenance block (`findingId / passType / modelId / promptHash / extractedAt / relatedClauseIds`) is currently rendered in a `<section>` with an `<h3>` heading. Replace that wrapper with a `<details>` whose `<summary>` reads "Provenance & audit trail". The existing key-value `<dl>` and its `Row` rendering remain unchanged inside.

---

- [ ] **Step 1: Locate the audit-trail section**

Open `src/components/ProofPanel.tsx`. Find the `<section>` that currently wraps the `findingId / passType / modelId / promptHash / extractedAt / relatedClauseIds` rows (look for the `<h3>` reading "Audit trail" or similar — roughly around lines 69–83 in the current file).

- [ ] **Step 2: Replace with `<details>`**

Replace that `<section>` block with:

```tsx
      <details className="group">
        <summary className="cursor-pointer text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-300">
          Provenance &amp; audit trail
        </summary>
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
      </details>
```

The `<section>` wrapper and its `<h3>` heading are removed; `<summary>` provides the equivalent label. The `<dl>` and `Row` components inside are unchanged.

- [ ] **Step 3: Run typecheck**

`npm run typecheck` — no errors.

- [ ] **Step 4: Visually verify in dev server**

In the Technical tab, click any finding card to open its proof panel on the right. Confirm:

- The three verifier rows (`quote ⊂ clause text`, `citation ∈ closed corpus`, `schema valid`) remain visible by default.
- The provenance block is now collapsed under "Provenance & audit trail". Clicking expands the key-value list.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProofPanel.tsx
git commit -m "feat(ui): proof panel — collapse provenance/audit trail behind <details>"
```
