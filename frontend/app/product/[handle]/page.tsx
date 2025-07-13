import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDecodedHandle, getStaticHandleParams } from "@/lib/helper";
import { getProducts, getProductByHandle } from "@/lib/api/catalog";
import { generateMetadataProduct, generateJsonLdProduct } from "@/lib/config";
import { PropsHandle } from "@/lib/types";
import SingleProductLayout from "@/components/products/single";

export const revalidate = 60;
export const dynamic = "force-static";

export const generateStaticParams = async () => {
  const products = await getProducts();
  return getStaticHandleParams(products);
};

export const generateMetadata = async ({
  params,
}: PropsHandle): Promise<Metadata> => {
  const slug = await getDecodedHandle(params);
  const product = await getProductByHandle(slug);

  if (!product) {
    return { robots: "noindex" };
  }

  return generateMetadataProduct(product);
};

export default async function ProductPage({ params }: PropsHandle) {
  const slug = await getDecodedHandle(params);
  const product = await getProductByHandle(slug);
  if (!product) return notFound();

  const isRtl = /[\u0590-\u05FF]/.test(product.title);
  const jsonLd = generateJsonLdProduct(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SingleProductLayout product={product} isRtl={isRtl} />
    </>
  );
}
