import type { Media } from "@/lib/core/types/payload-types";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsLayout } from "@/components/layout/analytics";
import Footer from "@/components/layout/footer";
import { AccessibilityBar, Header } from "@/components/shared/wrappers";
import DAL from "@/lib/core/dal";
import Providers from "@/lib/providers";
import { themeLocalStorageKey } from "@/lib/providers/theme";
import { generateMetadataLayout } from "@/lib/seo/metadata";

import "@/lib/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await DAL.querySiteSettings();

  return generateMetadataLayout(settings);
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await DAL.querySiteSettings();
  const products = await DAL.queryAllProducts();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `(function(){function v(t){return t==='light'||t==='dark'}var t='light';try{var s=localStorage.getItem('${themeLocalStorageKey}');if(v(s))t=s}catch(e){}document.documentElement.setAttribute('data-theme',t)})();`,
          }}
        />
      </head>
      <body>
        <AnalyticsLayout />
        <Providers>
          <AccessibilityBar />
          <div className="min-h-screen flex flex-col">
            <div className="layout-container flex flex-col flex-1">
              <Header logo={settings.home.logo as Media} products={products} />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
