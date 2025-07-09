import { Metadata } from "next";

import SidebarLayout from "components/layout/sidebar";
import {
  metadata_site_title,
  metadata_site_description,
  metadata_keywords,
} from "lib/assets/i18n/localizedMetadata";
import { baseUrl, ICON_IMAGE_URL } from "lib/config/config";
import {getCategories, getProducts} from "lib/api";
import { Products } from "../components/shared/wrappers";

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
  const categories = (await getCategories()) ?? [];
  return (
      <SidebarLayout categories={categories}>
      <h1 className="sr-only">{metadata_site_description}</h1>
      <Products products={products} />
    </SidebarLayout>
  );
}
