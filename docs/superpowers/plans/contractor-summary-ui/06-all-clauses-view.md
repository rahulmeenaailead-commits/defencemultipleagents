# Task 6 — AllClausesView component

**Files:** Create `src/components/AllClausesView.tsx`

Renders the "All clauses" tab — a single full-width column listing every `result.clauses` entry with its findings inline. Each finding card shows severity + category badges, the reasoning, and the recommended-action chip when present.

Findings are deduplicated by `findingId` across the three pass-type lists before grouping by `clauseId`.

Empty document state: render a small dashed callout when `result.clauses.length === 0`.

---

- [ ] **Step 1: Implement the component**

Create `src/components/AllClausesView.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import type { AnalysisResult, RiskFinding } from "@/lib/schema";
import { SeverityBadge } from "./SeverityBadge";
import { CategoryBadge } from "./CategoryBadge";

export function AllClausesView({ result }: { result: AnalysisResult }) {
  const findingsByClause = useMemo(() => {
    const map = new Map<string, RiskFinding[]>();
    const seen = new Set<string>();
    for (const list of [
      result.verifiedFindings,
      result.crossRefFindings,
      result.hiddenFindings,
    ]) {
      for (const f of list) {
        if (seen.has(f.findingId)) continue;
        seen.add(f.findingId);
        const arr = map.get(f.clauseId) ?? [];
        arr.push(f);
        map.set(f.clauseId, arr);
      }
    }
    return map;
  }, [result]);

  return (
    <div className="scroll-thin flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
        {result.clauses.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-800 p-6 text-center text-sm text-slate-400">
            No clauses were segmented from this document.
          </p>
        )}
        {result.clauses.map((clause) => {
          const findings = findingsByClause.get(clause.clauseId) ?? [];
          return (
            <section
              key={clause.clauseId}
              className="rounded-md border border-slate-800 bg-[var(--color-panel)] p-4"
            >
              <header className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-slate-500">{clause.clauseId}</span>
                <h3 className="text-base font-semibold text-slate-100">
                  {clause.heading ?? "Untitled clause"}
                </h3>
                {findings.length > 0 && (
                  <span className="ml-auto rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                    {findings.length} finding{findings.length > 1 ? "s" : ""}
                  </span>
                )}
              </header>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-300">
                {clause.text}
              </p>
              {findings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {findings.map((f) => (
                    <div
                      key={f.findingId}
                      className="rounded border border-slate-700 bg-slate-900/40 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge sev={f.severity} />
                        <CategoryBadge cat={f.category} />
                      </div>
                      <p className="mt-2 text-[13px] text-slate-200">{f.reasoning}</p>
                      {f.recommendedAction && (
                        <p className="mt-2 text-[12.5px] text-emerald-200">
                          <span className="mr-1">💡</span>
                          {f.recommendedAction}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

`npm run typecheck` — no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/AllClausesView.tsx
git commit -m "feat(ui): AllClausesView — full-width clause-by-clause list"
```
