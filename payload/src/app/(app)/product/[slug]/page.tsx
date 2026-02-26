import { notFound } from "next/navigation";

import type { PropsSlug } from "@/lib/core/types/types";
import type { Metadata } from "next";

import ProductPageLayout from "@/components/product";
import Queries from "@/lib/core/queries";
import { getDecodedSlug } from "@/lib/core/util";
import { generateJsonLdProduct } from "@/lib/seo/jsonld";
import { generateMetadataProduct } from "@/lib/seo/metadata";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);

  const product = await Queries.queryProductBySlug(slug);
  if (!product) {
    return { robots: "noindex" };
  }
  return generateMetadataProduct(product, slug);
}

export default async function ProductPage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);

  const product = await Queries.queryProductBySlug(slug);
  if (!product) return notFound();
  const jsonLd = generateJsonLdProduct(product, slug);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <ProductPageLayout product={product} />
    </>
  );
}
