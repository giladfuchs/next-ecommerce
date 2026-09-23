import type { ComponentProps } from "react";

import appConfig from "@/lib/core/config";
import { formatPrice } from "@/lib/core/util";
import { createJsonLdByModel, type JsonLdView } from "@/lib/seo/jsonld";

export const JsonLd = ({ data }: { data: unknown }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026"),
    }}
  />
);

export const JsonLdViewScript = (view: JsonLdView) => (
  <JsonLd data={createJsonLdByModel(view)} />
);

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
        {appConfig.LOCAL.isRtl
          ? `${formatPrice(highestAmount)} - ${formatPrice(lowestAmount)}`
          : `${formatPrice(lowestAmount)} - ${formatPrice(highestAmount)}`}
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
