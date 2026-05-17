import { CATEGORY_LABELS, type RiskCategory } from "@/lib/taxonomy";

export function CategoryBadge({ cat }: { cat: RiskCategory | string }) {
  const label = (CATEGORY_LABELS as Record<string, string>)[cat] ?? cat;
  return (
    <span className="inline-flex items-center rounded border border-slate-600/60 bg-slate-700/30 px-1.5 py-0.5 text-[10px] font-medium text-slate-200">
      {label}
    </span>
  );
}
