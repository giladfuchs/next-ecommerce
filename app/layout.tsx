import type { Viewport } from "next";
import Script from "next/script";
import { ReactNode, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

import { GeistSans } from "geist/font/sans";
import { Box } from "@mui/material";
import { Toaster } from "sonner";

import "../lib/assets/styles/globals.css";
import "../lib/assets/styles/theme.scss";
import {
  baseUrl,
  GOOGLE_ANALYTICS,
  GOOGLE_SITE_VERIFICATION,
  ICON_IMAGE_URL,
  SITE_NAME,
} from "lib/config/config";

import { ReduxProvider } from "../lib/provider/ReduxProvider";
import { ThemeProviderLayout } from "../lib/provider/ThemeProviderLayout";
import IntProvider from "../lib/provider/IntProvider";
import { LoadingProvider } from "lib/provider/LoadingProvider";

import LoadingGlobal from "components/shared/loading-global";
import { LoadingProductsList } from "components/shared/loading-skeleton";
import Header from "components/layout/header";
import Footer from "components/layout/footer";
import AccessibilityBar from "../components/layout/accessibility-bar";

import {
  metadata_site_description,
  metadata_site_title,
} from "lib/assets/i18n/localizedMetadata";
import { localeCache } from "../lib/api";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`,
  },
  description: metadata_site_description,
  robots: {
    follow: true,
    index: true,
  },
  openGraph: {
    title: SITE_NAME!,
    description: metadata_site_description,
    url: baseUrl,
    siteName: SITE_NAME!,
    images: [
      {
        url: ICON_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: metadata_site_title,
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
};

// noinspection JSUnusedGlobalSymbols
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang={localeCache.get()}
      dir={localeCache.dir()}
      className={GeistSans.variable}
    >
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GOOGLE_ANALYTICS}', {
        page_path: window.location.pathname,
      });
    `,
          }}
        />
        <ReduxProvider>
          <IntProvider>
            <ThemeProviderLayout>
              <LoadingProvider>
                <div
                  id="font-scale-wrapper"
                  className="bg-theme text-theme selection:bg-teal-300 dark:bg-theme-dark dark:text-theme dark:selection:bg-pink-500 dark:selection:text-white"
                >
                  <LoadingGlobal />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "100vh",
                      bgcolor: "var(--color-bg)",
                    }}
                  >
                    <Header />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                      <Suspense fallback={<LoadingProductsList />}>
                        {children}
                      </Suspense>
                    </Box>
                    <Footer />
                  </Box>

                  <Analytics />
                  <Toaster richColors closeButton position="bottom-center" />
                  <AccessibilityBar />
                </div>
              </LoadingProvider>
            </ThemeProviderLayout>
          </IntProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
