import type { ContentBlock as ContentBlockProps } from "@/payload-types";

import CmsLink from "@/components/shared/cms-link";
import { RichText } from "@/components/ui";
import { cn } from "@/lib/core/util";

const columnClasses: Record<
  NonNullable<ContentBlockProps["columns"]>[number]["size"],
  string
> = {
  full: "col-span-12",
  half: "col-span-12 md:col-span-6",
  oneThird: "col-span-12 md:col-span-4",
  twoThirds: "col-span-12 md:col-span-8",
};

export default function ContentBlock({ columns }: ContentBlockProps) {
  if (!columns?.length) return null;

  return (
    <section className="grid min-w-0 grid-cols-12 gap-6 md:gap-8">
      {columns.map((column, index) => (
        <div
          key={column.id ?? index}
          className={cn(
            "min-w-0 flex flex-col gap-5",
            columnClasses[column.size],
          )}
        >
          {column.richText ? (
            <RichText
              data={column.richText}
              disableIndent
              enableGutter={false}
              className="max-w-none"
            />
          ) : null}

          {column.enableLink && column.link ? (
            <div className="min-w-0">
              <CmsLink
                link={column.link}
                className="h-auto max-w-full whitespace-normal break-words py-2 text-center"
              />
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
