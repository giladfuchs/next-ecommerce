import { EcommerceProvider } from "@payloadcms/plugin-ecommerce/client/react";

import type { ReactNode } from "react";

import appConfig from "@/lib/core/config";
import { IntlProvider } from "@/lib/providers/intl";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <IntlProvider>
      <EcommerceProvider
        enableVariants={true}
        api={{
          serverURL: appConfig.SERVER_URL,
          cartsFetchQuery: {
            depth: 2,
            populate: {
              products: {
                slug: true,
                title: true,
                gallery: true,
                priceInUSD: true,
              },
              variants: {
                priceInUSD: true,
                options: true,
              },
            },
          },
        }}
      >
        {children}
      </EcommerceProvider>
    </IntlProvider>
  );
}
