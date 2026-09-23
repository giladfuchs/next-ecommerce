import type { ResolvedArchiveBlock } from "@/lib/core/types/types";

import GridOrAutoScroll from "@/components/shared/grid-or-auto-scroll";
import { RichText } from "@/components/ui";
import { RoutePath } from "@/lib/core/types/types";
import { cn } from "@/lib/core/util";

type ArchiveBlockProps = Pick<ResolvedArchiveBlock, "items"> &
  Partial<
    Pick<
      ResolvedArchiveBlock,
      "contentType" | "displayMode" | "introAlignment" | "introContent"
    >
  > & {
    gridClassName?: string;
  };

export default function ArchiveBlock({
  contentType = "products",
  displayMode = "grid",
  gridClassName,
  introAlignment = "center",
  introContent,
  items,
}: ArchiveBlockProps) {
  const route =
    contentType === "pages"
      ? RoutePath.page
      : contentType === "categories"
        ? RoutePath.category
        : RoutePath.product;

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
        models={items}
        route={route}
        displayMode={displayMode}
        gridClassName={gridClassName}
      />
    </section>
  );
}
