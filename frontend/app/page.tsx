import { Metadata } from "next";
import dynamic from "next/dynamic";
const Products = dynamic(() => import("frontend/components/products"), { ssr: false });
import SidebarLayout from "frontend/components/layout/sidebar";
import {
  metadata_site_title,
  metadata_site_description,
  metadata_keywords,
} from "frontend/lib/assets/i18n/localizedMetadata";
import { baseUrl, ICON_IMAGE_URL } from "frontend/lib/config/config";
import { getProducts } from "frontend/lib/api";

export const metadata: Metadata = {
  title: metadata_site_title,
  description: metadata_site_description,
  keywords: metadata_keywords,
  openGraph: {
    title: metadata_site_title,
    description: metadata_site_description,
    images: [ICON_IMAGE_URL as string],
    url: baseUrl,
    type: "website",
  },
  alternates: {
    canonical: baseUrl,
  },
};
export const revalidate = 60;
export default async function HomePage() {
  const products = await getProducts();

  return (
    <SidebarLayout>
      <h1 className="sr-only">{metadata_site_description}</h1>
      <Products products={products} />
    </SidebarLayout>
  );
}
