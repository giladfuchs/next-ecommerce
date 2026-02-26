import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Category } from "@/lib/core/types/payload-types";

import { CategoriesDropdown } from "@/components/shared/wrappers";
import Queries from "@/lib/core/queries";
import { buildCategoryHref } from "@/lib/core/util";

export async function Categories({ currentSlug }: { currentSlug: string }) {
  const t = await getTranslations("general");
  const categories = await Queries.queryCategoriesBasic();
  categories.unshift({
    id: 0,
    title: t("category_all"),
    slug: "/",
  } as unknown as Category);

  return (
    <nav className="text-left">
      <h3 className="text-lg mb-2 font-semibold tracking-tight">
        {t("categories")}
      </h3>

      <ul className="hidden md:block">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            currentSlug={currentSlug}
          />
        ))}
      </ul>

      <div className="md:hidden">
        <CategoriesDropdown categories={categories} currentSlug={currentSlug} />
      </div>
    </nav>
  );
}

const CategoryItem = ({
  category,
  currentSlug,
}: {
  category: Category;
  currentSlug: string;
}) => {
  const href = buildCategoryHref(category.slug);
  const active = currentSlug === category.slug;

  return (
    <li className="mt-2 flex   text-foreground">
      {active ? (
        <p className="w-full text-sm underline underline-offset-4">
          {category.title}
        </p>
      ) : (
        <Link
          href={href}
          className="w-full text-sm underline-offset-4 hover:underline"
        >
          {category.title}
        </Link>
      )}
    </li>
  );
};
