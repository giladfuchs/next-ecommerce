import { Suspense } from "react";

import type { Media } from "@/lib/core/types/payload-types";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsLayout } from "@/components/layout/analytics";
import Footer from "@/components/layout/footer";
import HeaderWrapper from "@/components/layout/header-wrapper";
import { AccessibilityBar } from "@/components/shared/wrappers";
import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";
import Providers from "@/lib/providers";
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

  return (
    <html
      lang={appConfig.LOCAL.lang}
      dir={appConfig.LOCAL.dir}
      suppressHydrationWarning
    >
      <head>
        {appConfig.BLOB_URL && (
          <>
            <link
              rel="preconnect"
              href={appConfig.BLOB_URL}
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href={appConfig.BLOB_URL} />
          </>
        )}
        <link
          rel="preconnect"
          href={appConfig.SERVER_URL}
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href={appConfig.SERVER_URL} />
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var k='payload-theme';var t=localStorage.getItem(k);var next=(t==='dark'||t==='light')?t:'light';document.documentElement.setAttribute('data-theme',next);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();",
          }}
        />
      </head>
      <body>
        <AnalyticsLayout />
        <Providers>
          <AccessibilityBar />
          <div className="min-h-screen flex flex-col">
            <div className="layout-container flex flex-col flex-1">
              <Suspense
                fallback={
                  <div className="relative z-20 border-b max-h-17 md:px-18" />
                }
              >
                <HeaderWrapper logo={settings.home.logo as Media} />
              </Suspense>

              <main className="flex-1">{children}</main>
              <Footer footer={settings.footer} />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
