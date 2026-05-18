# Task 8 — ResultsView becomes a tab switcher

**Files:** Modify `src/components/ResultsView.tsx`

Integration moment. After this task, uploading a contract lands on the new Summary tab by default. The current `ResultsView` has three inline subcomponents — `TopBar`, `ErrorBanner`, `StubBanner`. Only `TopBar` and the root component body change; **`ErrorBanner` and `StubBanner` must be kept byte-for-byte identical** (lines 81–176 of the existing file).

The current pass-type filter (`PER_CLAUSE / CROSS_REF / HIDDEN`) is removed from `TopBar` here — it lives inside `ExpertView` from Task 7. The new `TopBar` instead renders three audience tabs: `Summary | All clauses | Technical`.

The compact metadata strip drops `documentChars` and `providerId` from the contractor surface — it now reads `N clauses · reviewed in X.Ys`.

---

- [ ] **Step 1: Rewrite the imports + root component + TopBar in `ResultsView.tsx`**

Open `src/components/ResultsView.tsx`. Keep `ErrorBanner` and `StubBanner` exactly as they are today. Replace the top of the file (imports + `TABS` constant + `ResultsView` + `TopBar`) with the block below. The result is a single file with this order: imports → `TopBar` → `ResultsView` → `ErrorBanner` (unchanged) → `StubBanner` (unchanged).

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { AnalysisResult } from "@/lib/schema";
import { ContractorSummary } from "./ContractorSummary";
import { AllClausesView } from "./AllClausesView";
import { ExpertView } from "./ExpertView";

type TopTab = "SUMMARY" | "ALL" | "TECHNICAL";

const TABS: Array<{ id: TopTab; label: string }> = [
  { id: "SUMMARY", label: "Summary" },
  { id: "ALL", label: "All clauses" },
  { id: "TECHNICAL", label: "Technical" },
];

export function ResultsView({ result }: { result: AnalysisResult }) {
  const [tab, setTab] = useState<TopTab>("SUMMARY");

  const totalFindings =
    result.verifiedFindings.length +
    result.crossRefFindings.length +
    result.hiddenFindings.length;
  const isStub = result.providerId === "stub";
  const isSampleDoc = result.documentTitle.toLowerCase().includes("sample");
  const showStubBanner = isStub && (totalFindings === 0 || !isSampleDoc);
  const hasErrors = result.errors && result.errors.length > 0;
  const docNotSegmented = result.errors?.some((e) => e.code === "DOC_NOT_SEGMENTED");

  return (
    <div className="flex h-screen w-full flex-col">
      <TopBar result={result} tab={tab} onTab={setTab} />
      {hasErrors && <ErrorBanner errors={result.errors} docNotSegmented={!!docNotSegmented} />}
      {showStubBanner && <StubBanner totalFindings={totalFindings} />}
      <div className="flex min-h-0 flex-1 flex-col">
        {tab === "SUMMARY" && (
          <ContractorSummary result={result} onOpenTechnical={() => setTab("TECHNICAL")} />
        )}
        {tab === "ALL" && <AllClausesView result={result} />}
        {tab === "TECHNICAL" && <ExpertView result={result} />}
      </div>
    </div>
  );
}

function TopBar({
  result,
  tab,
  onTab,
}: {
  result: AnalysisResult;
  tab: TopTab;
  onTab: (t: TopTab) => void;
}) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-slate-800 bg-[var(--color-panel-2)] px-5 py-2.5">
      <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white">
        <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
        <span className="text-sm font-medium">DCR</span>
      </Link>
      <span className="text-slate-700">·</span>
      <div className="min-w-0 flex-1 truncate text-sm text-slate-300">
        {result.documentTitle}
        <span className="ml-2 font-mono text-[11px] text-slate-500">
          {result.clauses.length} clauses · reviewed in {(result.elapsedMs / 1000).toFixed(1)}s
        </span>
      </div>
      <nav className="flex items-center gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={clsx(
              "rounded-md px-2.5 py-1 text-xs transition",
              tab === t.id
                ? "bg-sky-500/15 text-sky-200"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Confirm `ErrorBanner` and `StubBanner` are unchanged**

The `ErrorBanner` and `StubBanner` functions defined later in the file must remain exactly as they were before this task. They are already imported `useState` from React — keep them as-is so the existing imports at the new top of the file (`useState` from `"react"`) cover them.

- [ ] **Step 3: Remove the old `Tab` type and `PER_CLAUSE`-based `TABS`**

Make sure no remnant of the old `type Tab = "PER_CLAUSE" | "CROSS_REF" | "HIDDEN";` or the old `TABS` array (with the per-clause/cross-ref/hidden labels) survives. The pass-type filter now lives inside `ExpertView`.

- [ ] **Step 4: Run typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Both must pass with no new errors.

- [ ] **Step 5: Start the dev server and visually verify**

`npm run dev`. Open http://localhost:3000 and click **"Try sample contract"**. Verify:

- The page lands on the **Summary** tab by default.
- The traffic-light hero shows a score, a verdict word, and a tally (e.g. "6 risky clauses · 2 critical · …").
- Up to 5 top-risk cards render; if more, a `+ show N more` button appears.
- Clicking "See clause text →" opens a right-side drawer showing the clause text with the quote highlighted; Escape or backdrop closes it.
- **All clauses** tab renders every clause with inline findings.
- **Technical** tab restores today's 3-column layout (pass-type filter pills row at top, clause list left, clause detail middle, proof panel right).

- [ ] **Step 6: Commit**

```bash
git add src/components/ResultsView.tsx
git commit -m "feat(ui): tabbed results view — Summary default, All clauses, Technical"
```
