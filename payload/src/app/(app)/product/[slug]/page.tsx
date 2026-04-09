import { notFound } from "next/navigation";

import type { PropsSlug } from "@/lib/core/types/types";
import type { Metadata } from "next";

import ProductPageLayout from "@/components/product";
import { JsonLd } from "@/components/shared/elements-ssr";
import DAL from "@/lib/core/dal";
import { getDecodedSlug } from "@/lib/core/util";
import {
  generateJsonLdBreadcrumbsProduct,
  generateJsonLdProduct,
} from "@/lib/seo/jsonld";
import { generateMetadataProduct } from "@/lib/seo/metadata";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);

  const product = await DAL.queryProductBySlug(slug);
  if (!product) {
    return { robots: "noindex" };
  }
  return generateMetadataProduct(product, slug);
}

export default async function ProductPage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);

  const product = await DAL.queryProductBySlug(slug);
  if (!product) return notFound();
  return (
    <>
      <JsonLd
        data={[
          generateJsonLdProduct(product, slug),
          generateJsonLdBreadcrumbsProduct(product, slug),
        ]}
      />
      <ProductPageLayout product={product} />
    </>
  );
}
