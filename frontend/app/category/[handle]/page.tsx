import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDecodedHandle, getStaticHandleParams } from "@/lib/helper";
import { getCategories, getCategory, getCategoryProducts } from "@/lib/api";
import {
  generateMetadataCategory,
  generateJsonLdItemListCategory,
  generateJsonLdBreadcrumbsCategory,
} from "@/lib/config";
import { PropsHandle } from "@/lib/types";
import { ProductsSSR } from "@/components/shared/elements-ssr";

export const revalidate = 60;
export const dynamic = "force-static";

export const generateStaticParams = async () => {
  const categories = await getCategories();
  return getStaticHandleParams(categories);
};

export const generateMetadata = async ({
  params,
}: PropsHandle): Promise<Metadata> => {
  const slug = await getDecodedHandle(params);
  const category = await getCategory(slug);

  if (!category) {
    return {
      robots: "noindex",
    };
  }

  return generateMetadataCategory(category);
};

export default async function CategoryPage({ params }: PropsHandle) {
  const slug = await getDecodedHandle(params);
  const category = await getCategory(slug);
  if (!category) return notFound();

  const products = await getCategoryProducts({ category: slug });
  const jsonLdItemList = generateJsonLdItemListCategory(category, products);
  const jsonLdBreadcrumbs = generateJsonLdBreadcrumbsCategory(category);
  return (
    <section>
      <h1 className="sr-only">{category.title}</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <ProductsSSR products={products} />
    </section>
  );
}
