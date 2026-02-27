import { notFound } from "next/navigation";

import type { PropsSlug } from "@/lib/core/types/types";
import type { Metadata } from "next";

import CategoryPageLayout from "@/components/category";
import { FaqSchema } from "@/components/shared/faq";
import DAL from "@/lib/core/dal";
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

  const category = await DAL.queryCategoryBySlug(slug);
  if (!category) return { robots: "noindex" };
  return generateMetadataCategory(category);
}

export default async function CategoryPage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);

  const category = await DAL.queryCategoryBySlug(slug);
  if (!category) return notFound();
  const products = await DAL.queryAllProducts();

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
      <FaqSchema faqs={category.faqs} title={category.title} />

      <CategoryPageLayout
        title={category.title}
        description={category.description}
        products={filtered}
        slug={slug}
        faqs={category.faqs}
      />
    </>
  );
}
