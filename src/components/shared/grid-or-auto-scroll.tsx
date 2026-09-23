import { getTranslations } from "next-intl/server";

import type { CardModel } from "@/components/shared/model-card";

import ModelCard from "@/components/shared/model-card";
import { AutoScrollRow } from "@/components/shared/wrappers";
import { Message } from "@/components/ui";
import { RoutePath } from "@/lib/core/types/types";
import { cn } from "@/lib/core/util";

export type DisplayMode = "grid" | "autoScroll";

export default async function GridOrAutoScroll({
  models,
  route,
  displayMode = "grid",
  autoScrollClassName,
  autoScrollItemClassName,
  gridClassName,
  gridItemClassName,
}: {
  models: CardModel[];
  route: RoutePath;
  displayMode?: DisplayMode;
  autoScrollClassName?: string;
  autoScrollItemClassName?: string;
  gridClassName?: string;
  gridItemClassName?: string;
}) {
  if (!models.length) {
    const t = await getTranslations("archive");
    return (
      <Message className="max-w-xl mx-auto" warning={t(`notFound.${route}`)} />
    );
  }

  if (displayMode === "autoScroll") {
    return (
      <div className="min-w-0">
        <ul className="sr-only focus-within:not-sr-only focus-within:space-y-2">
          {models.map((model) => (
            <li key={model.id}>
              <ModelCard
                model={model}
                route={route}
                displayMode={displayMode}
              />
            </li>
          ))}
        </ul>
        <div aria-hidden="true">
          <AutoScrollRow
            className={cn("snap-x snap-proximity", autoScrollClassName)}
          >
            {models.map((model) => (
              <div
                key={model.id}
                className={cn(
                  "min-w-0 flex-[0_0_48%] max-w-[21rem] sm:flex-[0_0_48%] md:flex-[0_0_31%] lg:flex-[0_0_23%] lg:max-w-[20rem]",
                  autoScrollItemClassName,
                )}
              >
                <ModelCard
                  model={model}
                  route={route}
                  displayMode={displayMode}
                  tabIndex={-1}
                />
              </div>
            ))}
          </AutoScrollRow>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-flow-row auto-rows-fr grid-cols-2 items-stretch gap-2 lg:grid-cols-4 lg:gap-4",
        gridClassName,
      )}
    >
      {models.map((model) => (
        <div key={model.id} className={cn("h-full min-w-0", gridItemClassName)}>
          <ModelCard model={model} route={route} displayMode={displayMode} />
        </div>
      ))}
    </div>
  );
}
