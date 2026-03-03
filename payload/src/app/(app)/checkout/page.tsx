import { getTranslations } from "next-intl/server";

import type { Metadata } from "next";

import { Checkout } from "@/components/shared/wrappers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout.page");
  return {
    title: t("title"),
  };
}

export default async function CheckoutPage() {
  const t = await getTranslations("checkout.page");

  return (
    <div className="container min-h-[90vh] flex flex-col">
      <h1 className="text-4xl font-semibold text-center">{t("title")}</h1>

      <Checkout />
    </div>
  );
}
