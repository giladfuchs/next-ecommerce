import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getProducts } from "lib/api/catalog";
import { Product } from "lib/types";
import { safeDecodeURIComponent } from "lib/helper";
import SingleProductLayout from "components/products/single";

type Props = {
  params: { handle: string };
};

async function getProductByHandle(
  handle: string,
): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.handle === handle);
}

export async function generateMetadata({
  params: { handle },
}: Props): Promise<Metadata> {
  const decodedHandle = safeDecodeURIComponent(handle);
  const product: Product = (await getProductByHandle(decodedHandle)) as Product;

  if (!product) {
    return {
      title: "Product Not Found",
      description: "This product does not exist.",
      robots: "noindex",
    };
  }

  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: `https://yourdomain.com/product/${decodedHandle}`,
    },
    openGraph: {
      title: product.title,
      description: product.description,
      images: [
        {
          url: product.featuredImage.url,
          width: 1200,
          height: 630,
          alt: product.featuredImage.altText || product.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: [product.featuredImage.url],
    },
  };
}
export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((product) => ({
      handle: encodeURIComponent(product.handle),
    }));
  } catch (err) {
    return [];
  }
}
export const revalidate = 60;
export default async function ProductPage({ params: { handle } }: Props) {
  const decodedHandle = safeDecodeURIComponent(handle);
  const product: Product = (await getProductByHandle(decodedHandle)) as Product;

  if (!product) return notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage.url,
    offers: {
      "@type": "AggregateOffer",
      price: product.price,
      priceCurrency: "ILS",
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      offerCount: 1,
      highPrice: product.price,
      lowPrice: product.price,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <SingleProductLayout product={product} />
    </>
  );
}
