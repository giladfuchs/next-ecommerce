import React from "react";

import CategoryPageLayout from "@/components/category";
import { FaqSchema } from "@/components/shared/faq";
import DAL from "@/lib/core/dal";
import { generateJsonLdHome } from "@/lib/seo/jsonld";

export const dynamic = "force-static";
export const revalidate = false;
export default async function MainPage() {
  const products = await DAL.queryAllProducts();
  const settings = await DAL.querySiteSettings();
  const jsonLd = generateJsonLdHome(settings);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <FaqSchema faqs={settings.home.faqs} title={settings.home.title} />

      <CategoryPageLayout
        title={settings.home.title}
        slug="/"
        description={settings.home.description}
        products={products}
        faqs={settings.home.faqs}
      />
    </>
  );
}
