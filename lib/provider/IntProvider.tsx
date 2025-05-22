"use client";

import { IntlProvider } from "react-intl";
import { ReactNode } from "react";
import { messages } from "../assets/i18n/messages";
import { localeCache } from "../api";

export default function IntProvider({ children }: { children: ReactNode }) {
  return (
    <IntlProvider
      locale={localeCache.get()}
      messages={messages[localeCache.get()]}
    >
      {children}
    </IntlProvider>
  );
}
