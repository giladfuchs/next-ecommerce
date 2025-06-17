import { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
const Products = dynamic(() => import("components/products"), { ssr: false });
import { getCategory, getCategoryProducts } from "lib/api";
import { baseUrl, ICON_IMAGE_URL, SITE_NAME } from "lib/config/config";
import {
  getCategoryTitle,
  getCategoryDescription,
} from "lib/assets/i18n/localizedMetadata";
import { Product } from "lib/types";
import { safeDecodeURIComponent } from "lib/helper";

type Props = {
  params: { category: string };
};

export async function generateMetadata({
  params: { category },
}: Props): Promise<Metadata> {
  const decoded = safeDecodeURIComponent(category);
  const categoryData = await getCategory(decoded);
  if (!categoryData) return notFound();

  const title = getCategoryTitle(categoryData.title);
  const description = getCategoryDescription(categoryData.title);

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/category/${decoded}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/category/${decoded}`,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: ICON_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "he_IL",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ICON_IMAGE_URL],
    },
  };
}
export async function generateStaticParams() {
  try {
    const categories = await (await import("lib/api")).getCategories();
    return categories.map((category) => ({
      category: encodeURIComponent(category.title),
    }));
  } catch (err) {
    return [];
  }
}
export const revalidate = 60;
export default async function CategoryPage({ params: { category } }: Props) {
  const decoded_category = safeDecodeURIComponent(category);
  const products: Product[] = await getCategoryProducts({
    category: decoded_category,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/product/${product.handle}`,
      name: product.title,
    })),
  };

  return (
    <section>
      <h1 className="sr-only">{decoded_category}</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Products products={products} />
    </section>
  );
}
