import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { User, Product } from "@/lib/core/types/payload-types";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { PayloadRequest } from "payload";

import appConfig from "@/lib/core/config";
import { RoutePath } from "@/lib/core/types/types";

export const postJson = async <TResponse>(
  url: string,
  body: Record<string, unknown>,
): Promise<TResponse> => {
  const preparedBody: Record<string, unknown> = Object.fromEntries(
    Object.entries(body).map(([key, value]) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return [key, trimmed === "" ? null : trimmed];
      }
      return [key, value];
    }),
  );

  const res = await fetch(`${appConfig.SERVER_URL}/api/${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preparedBody),
  });

  const json: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "message" in json &&
      typeof (json as { message: unknown }).message === "string"
        ? (json as { message: string }).message
        : "Request failed";

    throw new Error(message);
  }

  return json as TResponse;
};
export const safeDecodeSlug = (value: string): string => {
  if (!value) return value;
  if (!value.includes("%")) return value;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const getDecodedSlug = async (
  params: Promise<{ slug: string }>,
): Promise<string> => {
  const { slug } = await params;
  return safeDecodeSlug(slug);
};
export const generatePreviewPath = ({
  collection,
  slug,
}: {
  collection: RoutePath;
  slug: string;
}) => {
  if (!slug) {
    return null;
  }
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: `/${collection}/${slug}`,
    previewSecret: appConfig.PREVIEW_SECRET,
  });
  return `/preview?${encodedParams.toString()}`;
};

export const createUrl = (
  pathname: string,
  params: ReadonlyURLSearchParams | URLSearchParams,
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractRichTextText = (
  description: Product["description"],
): string => {
  if (!description?.root?.children) return "";

  const collect = (
    nodes: Product["description"]["root"]["children"],
  ): string => {
    let result = "";

    for (const node of nodes) {
      if (typeof node.text === "string") {
        result += node.text + " ";
      }

      if (Array.isArray(node.children)) {
        result += collect(node.children);
      }
    }

    return result;
  };

  return collect(description.root.children).trim();
};

const checkRole = (
  allRoles: User["roles"] = [],
  user?: User | null,
): boolean => {
  if (user && allRoles) {
    return allRoles.some((role) => {
      return user?.roles?.some((individualRole) => {
        return individualRole === role;
      });
    });
  }

  return false;
};

export const isAdmin = ({ req: { user } }: { req: PayloadRequest }) => {
  return user ? checkRole(["admin"], user) : false;
};

export const buildCategoryHref = (slug: string) =>
  slug === "/" ? "/" : `/${RoutePath.category}/${slug}`;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
