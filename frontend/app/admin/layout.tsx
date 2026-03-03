"use client";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiresAt = Number(localStorage.getItem("token_expires_at"));
    const isExpired = !expiresAt || Date.now() > expiresAt;

    if (!token || isExpired) {
      localStorage.clear();
      router.replace("/login");
    } else {
      setIsAllowed(true);
    }
    document.body.classList.add("admin");

    return () => {
      document.body.classList.remove("admin");
    };
  }, [router]);

  if (!isAllowed) return null;

  return <>{children}</>;
}
