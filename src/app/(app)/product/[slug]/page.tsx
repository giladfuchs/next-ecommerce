import { notFound } from "next/navigation";
import ProductPage from "src/components/shop/product";

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

  const product = await DAL.queryProductBySlug(slug);
  if (!product) {
    return { robots: "noindex" };
  }
  return buildMetadataByModel(CollectionName.products, product, slug);
}

export default async function PageProduct({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);

  const product = await DAL.queryProductBySlug(slug);
  if (!product) return notFound();
  return (
    <>
      <JsonLdViewScript
        collection={CollectionName.products}
        entity={product}
        slug={slug}
      />
      <ProductPage product={product} />
    </>
  );
}
