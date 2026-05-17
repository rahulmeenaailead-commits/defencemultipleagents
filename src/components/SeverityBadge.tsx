import type { Severity } from "@/lib/taxonomy";
import clsx from "clsx";

const COLORS: Record<Severity, string> = {
  LOW: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  MEDIUM: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  HIGH: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/50",
};

export function SeverityBadge({ sev, className }: { sev: Severity; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        COLORS[sev],
        className,
      )}
    >
      {sev}
    </span>
  );
}
