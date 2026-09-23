import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
  GalleryMedia,
  Media,
  Review,
  SeoMedia,
} from "@/lib/core/types/payload-types";
import type { ReadonlyURLSearchParams } from "next/navigation";

import appConfig from "@/lib/core/config";
import { OrderStatus, RoutePath } from "@/lib/core/types/types";

export type MediaVariant = "og" | "card" | "gallery";
export type UploadMedia = Media | SeoMedia | GalleryMedia;

type SizedVariant = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
};

export const getSizedVariant = (
  media: UploadMedia,
  variant?: MediaVariant,
): SizedVariant | undefined => {
  if (!media || !variant || !("sizes" in media)) return undefined;

  return (
    (media.sizes as Partial<Record<MediaVariant, SizedVariant | null>>)?.[
      variant
    ] ?? undefined
  );
};

export const resolveMediaUrl = (media: UploadMedia, variant?: MediaVariant) => {
  if (!media) return "";
  const url = getSizedVariant(media, variant)?.url || media.url!;
  return url.startsWith("http") ? url : `${appConfig.SERVER_URL}${url}`;
};

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
  return safeDecodeSlug(slug ?? appConfig.HOME_SLUG);
};

export const getRevalidateTag = (input: string) => {
  const encoded = encodeURIComponent(input).replace(/,/g, "%2C");
  return encoded.length > 250 ? encoded.slice(0, 250) : encoded;
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
    path:
      collection === RoutePath.page
        ? `/${slug === appConfig.HOME_SLUG ? "" : slug}`
        : `/${collection}/${slug}`,
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

type RichTextNode = {
  text?: unknown;
  children?: unknown;
};

export const extractRichTextText = (description: unknown): string => {
  if (!description || typeof description !== "object") return "";

  const root = (description as { root?: { children?: unknown } }).root;
  if (!Array.isArray(root?.children)) return "";

  const collect = (nodes: RichTextNode[]): string => {
    let result = "";

    for (const node of nodes) {
      if (typeof node.text === "string") {
        result += node.text + " ";
      }

      if (Array.isArray(node.children)) {
        result += collect(node.children as RichTextNode[]);
      }
    }

    return result;
  };

  return collect(root.children as RichTextNode[]).trim();
};

export const calculateAverageRating = (reviews: Review[]) =>
  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat(appConfig.LOCAL.locale, {
    style: "currency",
    currency: appConfig.LOCAL.currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(appConfig.LOCAL.locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const isRtl = (text: string): boolean => /[\u0590-\u05FF]/.test(text);

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [
    OrderStatus.READY,
    OrderStatus.DONE,
    OrderStatus.CANCELED,
  ],
  [OrderStatus.READY]: [OrderStatus.DONE, OrderStatus.CANCELED],
  [OrderStatus.DONE]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELED]: [OrderStatus.NEW],
  [OrderStatus.REFUNDED]: [OrderStatus.NEW],
};

export const isValidOrderStatusTransition = (
  current: OrderStatus,
  next: string,
): next is OrderStatus => {
  return (ORDER_STATUS_FLOW[current] || []).includes(next as OrderStatus);
};
