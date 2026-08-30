import { NextIntlClientProvider } from "next-intl";

import type { ReactNode } from "react";

import appConfig from "@/lib/core/config";
import { messages } from "@/lib/intl/request";

export const IntlProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextIntlClientProvider locale={appConfig.LOCAL.lang} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};
