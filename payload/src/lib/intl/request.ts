import { getRequestConfig } from "next-intl/server";

import en from "./en.json";

export const messages = en;

export default getRequestConfig(() => ({
  locale: "en",
  messages,
}));
