import { notFound } from "next/navigation";

import type { PropsSlug } from "@/lib/core/types/types";
import type { Metadata } from "next";

import CategoryPageLayout from "@/components/category";
import Queries from "@/lib/core/queries";
import { getDecodedSlug } from "@/lib/core/util";
import {
  generateJsonLdBreadcrumbsCategory,
  generateJsonLdItemListCategory,
} from "@/lib/seo/jsonld";
import { generateMetadataCategory } from "@/lib/seo/metadata";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);

  const category = await Queries.queryCategoryBySlug(slug);
  if (!category) return { robots: "noindex" };
  return generateMetadataCategory(category);
}

export default async function CategoryPage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);

  const category = await Queries.queryCategoryBySlug(slug);
  if (!category) return notFound();
  const products = await Queries.queryAllProducts();

  const filtered = products.filter((p) => {
    const cats = p.categories || [];
    return cats.some(
      (c) => String(typeof c === "object" ? c.id : c) === String(category.id),
    );
  });

  const jsonLdItemList = generateJsonLdItemListCategory(category, filtered);
  const jsonLdBreadcrumbs = generateJsonLdBreadcrumbsCategory(category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />

      <CategoryPageLayout
        title={category.title}
        description={category.description}
        products={filtered}
        slug={slug}
      />
    </>
  );
}
