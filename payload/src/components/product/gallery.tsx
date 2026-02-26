"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import type { Product, Media as MediaT } from "@/lib/core/types/payload-types";

import { GridTileImage } from "@/components/product/grid/tile";
import Media from "@/components/shared/media";
import Button from "@/components/ui/button";
import { cn } from "@/lib/core/util";

type Props = {
  gallery: NonNullable<Product["gallery"]>;
};
type CarouselApi = {
  scrollTo: (index: number, jump?: boolean) => void;
  selectedScrollSnap: () => number;
  on: (event: "select", cb: () => void) => void;
  off: (event: "select", cb: () => void) => void;
};

export default function GalleryClient({ gallery }: Props) {
  const t = useTranslations("product.gallery");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [api, _setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  const maxIndex = useMemo(
    () => Math.max(0, gallery.length - 1),
    [gallery.length],
  );

  const goTo = (idx: number) => {
    const nextIdx = Math.min(Math.max(idx, 0), maxIndex);
    setCurrent(nextIdx);
    api?.scrollTo(nextIdx, true);
  };

  const next = () => goTo(current + 1 > maxIndex ? 0 : current + 1);
  const prev = () => goTo(current - 1 < 0 ? maxIndex : current - 1);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const idx = api.selectedScrollSnap();
      setCurrent(idx);
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const canNavigate = gallery.length > 1;

  return (
    <div>
      <div className="relative w-full overflow-hidden mb-6">
        <Media
          resource={gallery[current]?.image as MediaT}
          className="w-full"
          imgClassName="w-full rounded-lg"
        />

        {canNavigate ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <div className={cn("pointer-events-auto flex items-center gap-4")}>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                aria-label={t("previous")}
                onClick={prev}
              >
                <HiChevronLeft className="h-5 w-5 text-neutral-600 hover:text-blue-500" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                aria-label={t("next")}
                onClick={next}
              >
                <HiChevronRight className="h-5 w-5 text-neutral-600 hover:text-blue-500" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="w-full">
        <div className="-ml-4 flex flex-wrap">
          {gallery.map((item, i) => {
            if (typeof item.image !== "object") return null;

            return (
              <div
                key={`${item.image.id}-${i}`}
                className="pl-4 pt-4 basis-1/5 max-[900px]:basis-1/4 max-[640px]:basis-1/3 max-[420px]:basis-1/2"
              >
                <button
                  type="button"
                  className="w-full cursor-pointer"
                  aria-label="Select image"
                  onClick={() => goTo(i)}
                >
                  <GridTileImage active={i === current} media={item.image} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
