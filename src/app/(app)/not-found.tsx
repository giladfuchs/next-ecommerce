import Link from "next/link";
import { getTranslations } from "next-intl/server";

import Button from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("general");

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center py-24">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground text-lg">{t("pageNotFound")}</p>
      </div>

      <div className="mt-8">
        <Button>
          <Link href="/">{t("goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
