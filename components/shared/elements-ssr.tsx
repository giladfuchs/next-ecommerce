import { ComponentProps } from "react";
import { localeCache } from "lib/api";

export const Price = ({
  amount,
  className,
}: {
  amount: number;
  className?: string;
  currencyCodeClassName?: string;
} & ComponentProps<"p">) => {
  const locale = "he-IL";
  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: localeCache.isRtl() ? "ILS" : "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  return (
    <span suppressHydrationWarning className={className}>
      {new Intl.NumberFormat(locale, formatOptions).format(amount)}
    </span>
  );
};
