import { Metadata } from "next";
import { getProducts } from "lib/api";
import ClientProduct from "components/product/ClientProduct";
import SidebarLayout from "components/layout/sidebar";
import {
  metadata_site_title,
  metadata_site_description,
  metadata_keywords,
} from "../lib/assets/i18n/seo_heb";
import { baseUrl, ICON_IMAGE_URL } from "../lib/config";

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

export default async function HomePage() {
  const products = await getProducts();

  return (
    <SidebarLayout>
      <h1 className="sr-only">{metadata_site_description}</h1>
      <ClientProduct products={products} />
    </SidebarLayout>
  );
}
