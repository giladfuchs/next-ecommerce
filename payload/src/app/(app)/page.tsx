import React from "react";

import CategoryPageLayout from "@/components/category";
import { JsonLd } from "@/components/shared/elements-ssr";
import DAL from "@/lib/core/dal";
import { generateJsonLdHome } from "@/lib/seo/jsonld";

const jsonLdTemplate = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Payload CMS E-commerce Starter",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Node.js",
  softwareVersion: "1.0",
  url: "https://payload.url-link.org",
  description:
    "Free open-source e-commerce template built with Payload CMS 3 and Next.js 16. Includes categories, products, cart, checkout flow, admin dashboard, SEO features, analytics tracking, and order notifications.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Payload CMS",
  },
};

export const dynamic = "force-static";
export const revalidate = false;

export default async function MainPage() {
  const products = await DAL.queryAllProducts();
  const settings = await DAL.querySiteSettings();

  return (
    <>
      <JsonLd data={generateJsonLdHome(settings)} />

      {/* This JSON-LD schema is included for SEO demonstration. When using this template for your own store, remove this block.*/}
      <JsonLd data={jsonLdTemplate} />

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
