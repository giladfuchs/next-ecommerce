import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getProducts } from "lib/api/catalog";
import { ProductDescription } from "components/product/ProductDescription";
import { Image, Product } from "lib/types";
import { ProductGallery } from "../../../components/product/ProductGallery";

type Props = {
  params: Promise<{ handle: string }>;
};

async function getProductByHandle(
  handle: string,
): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.handle === handle);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
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

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
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

      <div
        className="mx-auto max-w-(--breakpoint-2xl) px-4"
        data-testid="product-detail"
      >
        <div className="flex flex-col gap-6 rounded-lg border border-theme bg-theme p-8 md:p-12 lg:flex-row lg:gap-8 ">
          <div className="basis-full lg:basis-2/6">
            <ProductDescription product={product} />
          </div>
          <div className="h-full w-full basis-full lg:basis-4/6">
            <ProductGallery
              images={product.images.slice(0, 5).map((image: Image) => ({
                src: image.url,
                altText: image.altText,
              }))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
