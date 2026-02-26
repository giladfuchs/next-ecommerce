import { EcommerceProvider } from "@payloadcms/plugin-ecommerce/client/react";

import type { ReactNode } from "react";

import { IntlProvider } from "@/lib/providers/intl";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <IntlProvider>
      <EcommerceProvider
        enableVariants={true}
        api={{
          cartsFetchQuery: {
            depth: 2,
            populate: {
              products: {
                slug: true,
                title: true,
                gallery: true,
                inventory: true,
                priceInUSD: true,
              },
              variants: {
                title: true,
                inventory: true,
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
