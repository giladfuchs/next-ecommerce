import type { CardModel } from "@/components/shared/model-card";
import type {
  ArchiveBlock as ArchiveBlockProps,
  Category,
  Page,
  Product,
} from "@/payload-types";

import GridOrAutoScroll from "@/components/shared/grid-or-auto-scroll";
import { RichText } from "@/components/ui";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";
import { cn } from "@/lib/core/util";

const relationIds = <T extends { id: number }>(
  values?: Array<number | T> | null,
) => values?.map((value) => (typeof value === "object" ? value.id : value));

export default async function ArchiveBlock({
  categories,
  contentType = "products",
  displayMode = "grid",
  introAlignment = "center",
  introContent,
  limit,
  populateBy,
  selectedCategories,
  selectedDocs,
  selectedPages,
  currentPageId,
}: ArchiveBlockProps & { currentPageId: number }) {
  let models: CardModel[] = [];
  const route =
    contentType === "pages"
      ? RoutePath.page
      : contentType === "categories"
        ? RoutePath.category
        : RoutePath.product;

  if (contentType === "pages") {
    const pages = await DAL.queryArchivePages(
      populateBy === "selection"
        ? {
            ids: relationIds<Page>(selectedPages),
            excludeId: currentPageId,
            limit: selectedPages?.length ?? 0,
          }
        : {
            excludeId: currentPageId,
            limit: limit ?? 10,
          },
    );
    models = pages;
  } else if (contentType === "categories") {
    const archiveCategories = await DAL.queryArchiveCategories(
      populateBy === "selection"
        ? {
            ids: relationIds<Category>(selectedCategories),
            limit: selectedCategories?.length ?? 0,
          }
        : { limit: limit ?? 10 },
    );
    models = archiveCategories;
  } else {
    const products = await DAL.queryArchiveProducts(
      populateBy === "selection"
        ? {
            productIds: relationIds<Product>(selectedDocs),
            limit: selectedDocs?.length ?? 0,
          }
        : {
            categoryIds: relationIds<Category>(categories),
            limit: limit ?? 10,
          },
    );
    models = products;
  }

  return (
    <section className="min-w-0">
      {introContent ? (
        <RichText
          data={introContent}
          disableIndent
          enableGutter={false}
          className={cn(
            "mb-8",
            introAlignment === "center"
              ? "mx-auto max-w-3xl text-center"
              : "max-w-none",
          )}
        />
      ) : null}

      <GridOrAutoScroll
        models={models}
        route={route}
        displayMode={displayMode}
      />
    </section>
  );
}
