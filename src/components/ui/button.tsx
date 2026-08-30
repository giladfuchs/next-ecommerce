import type { ButtonHTMLAttributes, MouseEvent } from "react";

import { trackPixelEvent } from "@/components/layout/analytics";
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
} from "@/lib/styles/button-styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  selected?: boolean;
  eventName?: string;
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
      className={buttonClassName({ variant, size, selected, className })}
      {...props}
    />
  );
}
