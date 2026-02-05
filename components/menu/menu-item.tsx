"use client";

import { cn } from "@/lib/utils";

interface MenuItemProps {
  name: string;
  price: string;
  description?: string;
  highlight?: boolean;
}

export function MenuItem({
  name,
  price,
  description,
  highlight = false,
}: MenuItemProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-baseline gap-[1vw] py-[0.4vh]",
        highlight && "text-primary"
      )}
    >
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "font-medium text-[1.2vw]",
            highlight && "font-bold"
          )}
        >
          {name}
        </span>
        {description && (
          <p className="text-muted-foreground mt-[0.2vh] text-[0.9vw]">
            {description}
          </p>
        )}
      </div>
      <span className="font-bold text-primary tabular-nums whitespace-nowrap text-[1.2vw]">
        ${price}
      </span>
    </div>
  );
}
