import { Metadata } from "next";
import SidebarLayout from "@/components/layout/sidebar";
import { ProductsSSR } from "@/components/shared/elements-ssr";
import { metadata_site_description } from "@/lib/assets/i18n/localizedMetadata";
import { getCategories, getProducts } from "@/lib/api";
import { generateMetadataHome, USE_MOCK_DATA } from "@/lib/config";

export const metadata: Metadata = generateMetadataHome();
export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const categories = (await getCategories()) ?? [];

  return (
    <SidebarLayout categories={categories}>
      <h1 className="sr-only">{metadata_site_description}</h1>
      {USE_MOCK_DATA && (
        <p
          style={{
            color: "red",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "1.25rem",
          }}
        >
          ⚠️ You are running in mock mode!
        </p>
      )}

      <ProductsSSR products={products} />
    </SidebarLayout>
  );
}
