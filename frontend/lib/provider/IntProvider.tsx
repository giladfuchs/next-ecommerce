"use client";

import { IntlProvider } from "react-intl";
import { ReactNode } from "react";
import translations from "@/lib/assets/i18n/translations.json";
import { localeCache } from "../api";

export default function IntProvider({ children }: { children: ReactNode }) {
  return (
    <IntlProvider
      locale={localeCache.get()}
      messages={translations[localeCache.get()]}
    >
      {children}
    </IntlProvider>
  );
}
