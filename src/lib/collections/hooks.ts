import { revalidateTag } from "next/cache";

import type { Product } from "@/lib/core/types/payload-types";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

import { AppConst, CollectionName } from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/util";

export const normalizeFaqs = <T extends { faqs?: unknown }>(
  data: T | undefined | null,
) => {
  if (!data) return data;
  const faqs = data.faqs as Product["faqs"];

  if (Array.isArray(faqs)) {
    const filteredFaqs = faqs.filter((item) => {
      if (!item) return false;
      return Boolean(item.question) || Boolean(item.answer);
    });

    data.faqs = filteredFaqs.length ? filteredFaqs : undefined;
  }

  return data;
};

export const revalidate = (tag: string) =>
  revalidateTag(getRevalidateTag(tag), "max");

export function makeRevalidateHooks(collection: CollectionName): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  return {
    afterChange: [
      async ({
        doc,
        previousDoc,
      }: Parameters<CollectionAfterChangeHook>[0]) => {
        try {
          const newSlug = doc?.slug ? String(doc.slug) : "";
          const prevSlug = previousDoc?.slug ? String(previousDoc.slug) : "";

          if (prevSlug && prevSlug !== newSlug) {
            revalidate(`${collection}-${prevSlug}`);
          }

          if (newSlug) {
            revalidate(`${collection}-${newSlug}`);
          }

          if (
            collection === CollectionName.products ||
            collection === CollectionName.category ||
            collection === CollectionName.pages
          ) {
            revalidate(AppConst.CACHE_TAG_BOOTSTRAP);
          }

          revalidate(AppConst.CACHE_TAG_SITEMAP);
        } catch {}

        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }: Parameters<CollectionAfterDeleteHook>[0]) => {
        try {
          const slug = doc?.slug ? String(doc.slug) : "";

          if (slug) {
            revalidate(`${collection}-${slug}`);
          }

          if (
            collection === CollectionName.products ||
            collection === CollectionName.category ||
            collection === CollectionName.pages
          ) {
            revalidate(AppConst.CACHE_TAG_BOOTSTRAP);
          }

          revalidate(AppConst.CACHE_TAG_SITEMAP);
        } catch {}

        return doc;
      },
    ],
  };
}
