"use client";

import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/hooks/use-daypart";

type DayOverride = DayOfWeek | null;

type DayOfWeekToggleProps = {
  value: DayOverride;
  onChange: (value: DayOverride) => void;
  className?: string;
};

const options: { label: string; value: DayOverride }[] = [
  { label: "Auto", value: null },
  { label: "Mon", value: "monday" },
  { label: "Tue", value: "tuesday" },
  { label: "Wed", value: "wednesday" },
  { label: "Thu", value: "thursday" },
  { label: "Fri", value: "friday" },
  { label: "Sat", value: "saturday" },
  { label: "Sun", value: "sunday" },
];

export function DayOfWeekToggle({
  value,
  onChange,
  className,
}: DayOfWeekToggleProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-end gap-[0.4vh] rounded-[0.6vh] border border-border bg-card/80 p-[0.4vh] shadow-sm max-w-[30vh]",
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "px-[0.8vh] py-[0.3vh] text-[1.4vh] font-bold uppercase tracking-wide rounded-[0.4vh]",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
