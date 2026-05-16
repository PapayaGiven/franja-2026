"use client";

import { formatLongDate } from "@/lib/utils/time";

export type AgendaDay = "2026-07-09" | "2026-07-10";

const DAYS: { value: AgendaDay; short: string }[] = [
  { value: "2026-07-09", short: "Jue 9" },
  { value: "2026-07-10", short: "Vie 10" },
];

/**
 * Two-pill segmented control: Jue 9 / Vie 10. The active pill takes the
 * turquoise brand color, inactive sits on the standard glass card.
 */
export function DayToggle({
  value,
  onChange,
}: {
  value: AgendaDay;
  onChange: (next: AgendaDay) => void;
}) {
  return (
    <div className="space-y-1">
      <div
        role="tablist"
        aria-label="Día del evento"
        className="inline-flex rounded-full border border-franja-border bg-white/5 p-1"
      >
        {DAYS.map((d) => {
          const active = value === d.value;
          return (
            <button
              key={d.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(d.value)}
              className={`px-4 py-1.5 text-sm rounded-full transition font-medium ${
                active
                  ? "bg-franja-turquoise text-franja-bg"
                  : "text-franja-text-secondary hover:text-white"
              }`}
            >
              {d.short}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-franja-text-muted capitalize">
        {formatLongDate(value)}
      </p>
    </div>
  );
}
