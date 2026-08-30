import { FaStar } from "react-icons/fa";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/core/util";

type RatingProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value: number;
  max?: number;
  getAriaLabel: (value: number) => string;
  onChange: (value: number) => void;
};

export default function Rating({
  value,
  max = 5,
  getAriaLabel,
  onChange,
  className,
  ...props
}: RatingProps) {
  return (
    <div
      role="radiogroup"
      className={cn("mt-2 flex items-center gap-3", className)}
      {...props}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) => {
          const option = index + 1;
          const active = option <= value;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={option === value}
              aria-label={getAriaLabel(option)}
              onClick={() => onChange(option)}
              className="transition"
            >
              <FaStar
                className={cn(
                  "h-6 w-6 transition",
                  active
                    ? "text-yellow-500"
                    : "text-foreground/30 hover:text-foreground/60",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="text-foreground/70 text-sm">
        {value}/{max}
      </div>
    </div>
  );
}
