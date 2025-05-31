"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  }, []);

  if (!isAllowed) return null;

  return <>{children}</>;
}
