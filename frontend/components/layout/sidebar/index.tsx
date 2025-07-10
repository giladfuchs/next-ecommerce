import { ReactNode } from "react";
import Categories from "./categories";
import { Category } from "lib/types";

export default function SidebarLayout({
  children,
  categories,
}: {
  children: ReactNode;
  categories: Category[];
}) {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
      <div
        className="order-first w-full flex-none md:max-w-[125px]"
        data-testid="category-nav"
      >
        <Categories categories={categories} />
      </div>
      <div className="order-last min-h-screen w-full md:order-none">
        {children}
      </div>
    </div>
  );
}
