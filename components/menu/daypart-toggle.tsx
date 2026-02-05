"use client";

import { cn } from "@/lib/utils";
import type { DaypartOverride } from "@/hooks/use-daypart";

type DaypartToggleProps = {
  value: DaypartOverride;
  onChange: (value: DaypartOverride) => void;
  className?: string;
};

const options: { label: string; value: DaypartOverride }[] = [
  { label: "Auto", value: null },
  { label: "Breakfast", value: "breakfast" },
  { label: "Regular", value: "regular" },
];

export function DaypartToggle({ value, onChange, className }: DaypartToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-[0.4vh] rounded-[0.6vh] border border-border bg-card/80 p-[0.4vh] shadow-sm",
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
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
