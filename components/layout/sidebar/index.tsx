import { Fragment, ReactNode } from "react";
import { getCategories } from "../../../lib/api";
import Categories from "./Categories";

export default async function SidebarLayout({
  children,
}: {
  children: ReactNode;
}) {
  const list = await getCategories();
  return (
    <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
      <div
        className="order-first w-full flex-none md:max-w-[125px]"
        data-testid="category-nav"
      >
        <Categories list={list ?? []} />
      </div>
      <div className="order-last min-h-screen w-full md:order-none">
        <Fragment key={"searchParams.get('q')"}>{children}</Fragment>
      </div>
    </div>
  );
}
