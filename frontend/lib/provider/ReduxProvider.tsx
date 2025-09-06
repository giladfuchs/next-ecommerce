"use client";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
