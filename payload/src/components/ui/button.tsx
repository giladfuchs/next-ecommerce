import type { ButtonHTMLAttributes, MouseEvent } from "react";

import { trackPixelEvent } from "@/components/layout/analytics";
import { cn } from "@/lib/core/util";

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "nav"
  | "select";
type ButtonSize = "default" | "icon" | "clear";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  selected?: boolean;
  eventName?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer " +
  "disabled:pointer-events-none disabled:opacity-50 outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[var(--btn-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--btn-ring-offset)]";

const sizeClass: Record<ButtonSize, string> = {
  clear: "",
  default: "h-9 px-4 py-2",
  icon: "h-9 w-9",
};

const variantClass: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--btn-default-bg)] text-[var(--btn-default-text)] hover:bg-[var(--btn-default-bg-hover)] active:bg-[var(--btn-default-bg-active)]",
  outline:
    "border border-[var(--btn-outline-border)] bg-[var(--btn-outline-bg)] text-[var(--btn-outline-text)] hover:bg-[var(--btn-outline-bg-hover)] active:bg-[var(--btn-outline-bg-active)]",
  secondary:
    "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-bg-hover)] active:bg-[var(--btn-secondary-bg-active)]",
  ghost:
    "border border-[var(--btn-ghost-border)] bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-text)] hover:bg-[var(--btn-ghost-bg-hover)] hover:border-[var(--btn-ghost-border-hover)]",
  nav: "p-0 pt-2 pb-6 uppercase font-mono tracking-widest text-xs bg-transparent text-[var(--btn-ghost-text)]",
  select:
    "rounded-lg px-3 py-3 border border-[var(--btn-select-border)] bg-[var(--btn-select-bg)] text-[var(--btn-select-text)] hover:bg-[var(--btn-select-bg-hover)]",
};

export default function Button({
  className,
  variant = "default",
  size = "default",
  selected = false,
  type = "button",
  eventName,
  ...props
}: ButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (eventName) trackPixelEvent(eventName);
    props.onClick?.(e);
  };

  return (
    <button
      data-slot="button"
      type={type}
      onClick={typeof window !== "undefined" ? handleClick : undefined}
      className={cn(
        base,
        sizeClass[size],
        variantClass[variant],
        selected &&
          "bg-[var(--btn-selected-bg)] text-[var(--btn-selected-text)] border-[var(--btn-selected-border)] hover:bg-[var(--btn-selected-bg)]",
        className,
      )}
      {...props}
    />
  );
}
