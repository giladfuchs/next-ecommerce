import { getRequestConfig } from "next-intl/server";

import en from "./en.json";
import he from "./he.json";

import appConfig from "@/lib/core/config";

type Messages = typeof en;

export const messages: Messages = appConfig.LOCAL.lang === "he" ? he : en;

export default getRequestConfig(() => ({
  locale: appConfig.LOCAL.lang,
  messages,
}));
