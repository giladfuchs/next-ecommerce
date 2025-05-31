import React from "react";
import SidebarLayout from "../../components/layout/sidebar";
export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
