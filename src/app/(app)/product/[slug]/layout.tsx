import type { ReactNode } from "react";

import { SonnerProvider } from "@/lib/providers/sonner";

export default async function ProductsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SonnerProvider />
      {children}
    </>
  );
}
