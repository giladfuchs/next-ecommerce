import Link from "next/link";

import type { CallToActionBlock } from "@/payload-types";
import type { ReactNode } from "react";

import appConfig from "@/lib/core/config";
import { RoutePath } from "@/lib/core/types/types";
import { cn } from "@/lib/core/util";
import { buttonClassName } from "@/lib/styles/button-styles";

type LinkData = NonNullable<
  NonNullable<CallToActionBlock["links"]>[number]["link"]
>;

const resolveHref = (link: LinkData): string | null => {
  if (link.type === "custom") {
    return link.url?.trim() || null;
  }

  const reference = link.reference;
  if (!reference || typeof reference.value !== "object") return null;

  const slug = reference.value.slug;
  if (typeof slug !== "string" || !slug) return null;

  if (reference.relationTo === "pages") {
    return `/${slug === appConfig.HOME_SLUG ? "" : slug}`;
  }
  if (reference.relationTo === "products") {
    return `/${RoutePath.product}/${slug}`;
  }

  return `/${RoutePath.category}/${slug}`;
};

export default function CmsLink({
  link,
  className,
  appearance,
  children,
}: {
  link: LinkData;
  className?: string;
  appearance?: "link";
  children?: ReactNode;
}) {
  const href = resolveHref(link);
  if (!href) return null;

  const newTabProps = link.newTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  const classNames =
    appearance === "link"
      ? cn("inline-flex items-center text-sm hover:underline", className)
      : buttonClassName({
          variant: link.appearance === "outline" ? "outline" : "default",
          className,
        });

  if (!href.startsWith("/")) {
    return (
      <a
        href={href}
        className={classNames}
        aria-label={children ? link.label : undefined}
        {...newTabProps}
      >
        {children ?? link.label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={classNames}
      aria-label={children ? link.label : undefined}
      {...newTabProps}
    >
      {children ?? link.label}
    </Link>
  );
}
