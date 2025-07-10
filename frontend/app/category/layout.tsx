import { ReactNode } from "react";
import SidebarLayout from "components/layout/sidebar";
import { getCategories } from "lib/api";

export default async function CategoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const categories = (await getCategories()) ?? [];
  return <SidebarLayout categories={categories}>{children}</SidebarLayout>;
}
