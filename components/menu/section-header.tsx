"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  className?: string;
  variant?: "primary" | "accent";
}

export function SectionHeader({
  title,
  className,
  variant = "primary",
}: SectionHeaderProps) {
  return (
    <h2
      className={cn(
        "font-[family-name:var(--font-heading)] uppercase tracking-wider font-bold mb-[0.5vh] pb-[0.5vh] text-[2vw]",
        variant === "primary"
          ? "text-primary border-b-2 border-primary/30"
          : "text-accent",
        className
      )}
    >
      {title}
    </h2>
  );
}
