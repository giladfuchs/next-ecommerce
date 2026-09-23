import { notFound } from "next/navigation";
import CategoryPage from "src/components/shop/category";

import type { PropsSlug } from "@/lib/core/types/types";
import type { Metadata } from "next";

import { JsonLdViewScript } from "@/components/shared/elements-ssr";
import DAL from "@/lib/core/dal";
import { CollectionName } from "@/lib/core/types/types";
import { getDecodedSlug } from "@/lib/core/util";
import { buildMetadataByModel } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);

  const category = await DAL.queryCategoryBySlug(slug);
  if (!category) return { robots: "noindex" };
  return buildMetadataByModel(CollectionName.category, category, slug);
}

export default async function PageCategory({ params }: PropsSlug) {
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

  return (
    <>
      <JsonLdViewScript
        collection={CollectionName.category}
        entity={category}
        products={filtered}
        slug={slug}
      />

      <CategoryPage
        title={category.title}
        description={category.description}
        products={filtered}
        faqs={category.faqs}
      />
    </>
  );
}
