import React from "react";

import CategoryPageLayout from "@/components/category";
import Queries from "@/lib/core/queries";
import { generateJsonLdHome } from "@/lib/seo/jsonld";

export const dynamic = "force-static";
export const revalidate = false;
export default async function MainPage() {
  const products = await Queries.queryAllProducts();
  const settings = await Queries.querySiteSettings();
  const jsonLd = generateJsonLdHome(settings);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <CategoryPageLayout
        title={settings.home.title}
        slug="/"
        description={settings.home.description}
        products={products}
      />
    </>
  );
}
