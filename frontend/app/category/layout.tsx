import { ReactNode } from "react";
import SidebarLayout from "@/components/layout/sidebar";
import { getCategories } from "@/lib/api";
import { PropsHandle } from "@/lib/types";
import { getDecodedHandle } from "@/lib/helper";

export default async function CategoryLayout({
  children,
  params,
}: PropsHandle & {
  children: ReactNode;
}) {
  const currentPath = await getDecodedHandle(params);
  const categories = (await getCategories()) ?? [];

  return (
    <SidebarLayout categories={categories} currentPath={currentPath}>
      {children}
    </SidebarLayout>
  );
}
