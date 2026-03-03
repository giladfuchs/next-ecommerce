import type { ComponentProps } from "react";

import { formatPrice, cn } from "@/lib/core/util";

export const Grid = ({
  children,
  className,
  ...rest
}: ComponentProps<"div">) => {
  return (
    <div {...rest} className={cn("grid grid-flow-row gap-4", className)}>
      {children}
    </div>
  );
};
export const Price = ({
  amount,
  highestAmount,
  lowestAmount,
  className,
  as = "p",
  ...rest
}: {
  amount?: number;
  highestAmount?: number;
  lowestAmount?: number;
  className?: string;
  as?: "span" | "p";
} & ComponentProps<"p">) => {
  const Element = as;

  if (typeof amount === "number")
    return (
      <Element className={className} {...rest}>
        {formatPrice(amount)}
      </Element>
    );

  if (
    typeof highestAmount === "number" &&
    typeof lowestAmount === "number" &&
    highestAmount !== lowestAmount
  )
    return (
      <Element className={className} {...rest}>
        {formatPrice(lowestAmount)} - {formatPrice(highestAmount)}
      </Element>
    );

  if (typeof lowestAmount === "number")
    return (
      <Element className={className} {...rest}>
        {formatPrice(lowestAmount)}
      </Element>
    );

  return null;
};
