"use client";
import { Provider } from "react-redux";

import { store } from "@/lib/store";

import type { ReactNode } from "react";

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
