import type { ReactNode } from "react";

import { SonnerProvider } from "@/lib/providers/sonner";

export default async function CheckoutLayout({
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
