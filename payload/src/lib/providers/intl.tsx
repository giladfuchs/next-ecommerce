import { NextIntlClientProvider } from "next-intl";

import type { ReactNode } from "react";

import { messages } from "@/lib/intl/request";

export const IntlProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};
