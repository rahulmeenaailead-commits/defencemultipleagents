# Task 5 — ContractorSummary composition

**Files:** Create `src/components/ContractorSummary.tsx`

Composes the Summary tab: `RiskVerdictHero` at the top, then a sorted list of `TopRiskCard`s (initially top 5, with `+ show N more` button), and a footer link `→ Open technical detail` that switches tabs.

Opens `ClauseDetailDrawer` overlay when a card's "See clause text →" is clicked.

Empty state: when no findings, show a small dashed callout — no top-risks heading, no list.

---

- [ ] **Step 1: Implement the component**

Create `src/components/ContractorSummary.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult, RiskFinding } from "@/lib/schema";
import { computeOverallRisk } from "@/lib/risk/score";
import { RiskVerdictHero } from "./RiskVerdictHero";
import { TopRiskCard } from "./TopRiskCard";
import { ClauseDetailDrawer } from "./ClauseDetailDrawer";

const INITIAL_VISIBLE = 5;

export function ContractorSummary({
  result,
  onOpenTechnical,
}: {
  result: AnalysisResult;
  onOpenTechnical: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [activeFinding, setActiveFinding] = useState<RiskFinding | null>(null);

  const summary = useMemo(() => computeOverallRisk(result), [result]);
  const clauseById = useMemo(
    () => new Map(result.clauses.map((c) => [c.clauseId, c])),
    [result.clauses],
  );

  const visible = showAll
    ? summary.allFindings
    : summary.allFindings.slice(0, INITIAL_VISIBLE);
  const hiddenCount = summary.allFindings.length - visible.length;

  const activeClause = activeFinding ? clauseById.get(activeFinding.clauseId) : undefined;

  return (
    <div className="scroll-thin flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        <RiskVerdictHero summary={summary} />

        {summary.total === 0 ? (
          <div className="rounded-md border border-dashed border-slate-800 p-6 text-center text-sm text-slate-400">
            Nothing flagged — but always read the full contract before signing.
          </div>
        ) : (
          <>
            <h2 className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Top risks
            </h2>
            <div className="space-y-3">
              {visible.map((f) => (
                <TopRiskCard
                  key={f.findingId}
                  finding={f}
                  clause={clauseById.get(f.clauseId)}
                  onOpen={() => setActiveFinding(f)}
                />
              ))}
            </div>
            {hiddenCount > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  + show {hiddenCount} more
                </button>
              </div>
            )}
          </>
        )}

        <div className="border-t border-slate-800 pt-4 text-center">
          <button
            onClick={onOpenTechnical}
            className="text-sm text-sky-300 underline-offset-2 hover:underline"
          >
            → Open technical detail
          </button>
        </div>
      </div>

      {activeFinding && activeClause && (
        <ClauseDetailDrawer
          clause={activeClause}
          finding={activeFinding}
          onClose={() => setActiveFinding(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

`npm run typecheck` — no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ContractorSummary.tsx
git commit -m "feat(ui): ContractorSummary — hero + top-risks + show-more + drawer"
```
