# Task 3 — ClauseDetailDrawer component

**Files:** Create `src/components/ClauseDetailDrawer.tsx`

Right-side slide-in opened from a TopRiskCard. Shows the clause heading, the full clause text with the finding's `textSpan.quote` highlighted, the recommended action, and the cited regulation if present. **No** audit trail, **no** finding IDs, **no** model IDs — this is the contractor view.

Closes on backdrop click or Escape key.

---

- [ ] **Step 1: Implement the component**

Create `src/components/ClauseDetailDrawer.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import type { Clause, RiskFinding } from "@/lib/schema";
import { SeverityBadge } from "./SeverityBadge";
import { CategoryBadge } from "./CategoryBadge";

export function ClauseDetailDrawer({
  clause,
  finding,
  onClose,
}: {
  clause: Clause;
  finding: RiskFinding;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const quote = finding.textSpan.quote;
  const idx = clause.text.indexOf(quote);
  const before = idx >= 0 ? clause.text.slice(0, idx) : clause.text;
  const highlight = idx >= 0 ? quote : "";
  const after = idx >= 0 ? clause.text.slice(idx + quote.length) : "";

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="flex-1 bg-black/60" onClick={onClose} aria-hidden />
      <aside className="flex w-full max-w-2xl flex-col overflow-hidden border-l border-slate-800 bg-[var(--color-panel-2)]">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-800 px-5 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SeverityBadge sev={finding.severity} />
              <CategoryBadge cat={finding.category} />
            </div>
            <div className="mt-2 font-mono text-xs text-slate-500">{clause.clauseId}</div>
            <h2 className="truncate text-base font-semibold text-slate-100">
              {clause.heading ?? "Untitled clause"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto p-5">
          <article className="rounded-md border border-slate-800 bg-[var(--color-panel)] p-4 text-[13.5px] leading-relaxed text-slate-200">
            <p className="whitespace-pre-wrap">
              {before}
              {highlight && <mark className="dcr-mark dcr-mark-active">{highlight}</mark>}
              {after}
            </p>
          </article>

          {finding.recommendedAction && (
            <section className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-[13px] text-emerald-200">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80">
                Recommended action
              </h3>
              <p className="mt-1 text-slate-100">{finding.recommendedAction}</p>
            </section>
          )}

          {finding.regulatoryCitation && (
            <section className="mt-4 rounded-md border border-sky-500/30 bg-sky-500/5 p-3">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-sky-400">
                Cited regulation
              </h3>
              <p className="mt-1 font-mono text-xs text-sky-300">
                {finding.regulatoryCitation.citationId}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-slate-300">
                {finding.regulatoryCitation.citationText}
              </p>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

`npm run typecheck` — no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ClauseDetailDrawer.tsx
git commit -m "feat(ui): ClauseDetailDrawer — right-side slide-in with clause + highlight"
```
