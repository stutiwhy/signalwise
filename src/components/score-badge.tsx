// src/components/score-badge.tsx

import { cn } from "@/lib/utils";

type Props = {
  score: number | null;
  size?: "sm" | "md";
};

export function ScoreBadge({ score, size = "md" }: Props) {
  const s = score ?? 0;

  const color =
    s >= 70
      ? "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800"
      : s >= 40
      ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
      : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium tabular-nums transition-colors",
        color,
        size === "md"
          ? "h-11 min-w-11 px-3 text-base"
          : "h-8 min-w-8 px-2 text-sm"
      )}
    >
      {s}
    </span>
  );
}