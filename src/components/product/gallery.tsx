import { getTranslations } from "next-intl/server";

import type { Media, Product } from "@/lib/core/types/payload-types";

import ImageVideo from "@/components/shared/image-video";
import { cn } from "@/lib/core/util";

export default async function Gallery({
  gallery,
}: {
  gallery: NonNullable<Product["gallery"]>;
}) {
  const t = await getTranslations("product.gallery");
  const items = gallery.filter(
    (item): item is typeof item & { image: Media } =>
      typeof item.image === "object",
  );
  const canNavigate = items.length > 1;

  return (
    <div>
      <div className="gallery-main flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, i) => (
          <div
            key={`${item.image.id}-main-${i}`}
            id={`gallery-slide-${i}`}
            className="w-full shrink-0 snap-center"
          >
            <ImageVideo
              resource={item.image}
              className="w-full"
              imgClassName="w-full rounded-lg"
            />
          </div>
        ))}
      </div>

      {canNavigate ? (
        <div className="mt-4 flex justify-center gap-5 sm:hidden">
          {items.map((item, i) => (
            <a
              key={`${item.image.id}-dot-${i}`}
              href={`#gallery-slide-${i}`}
              aria-label={`${t("select_image")} ${i + 1}`}
              className="h-3.5 w-3.5 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700"
            />
          ))}
        </div>
      ) : null}

      {canNavigate ? (
        <div className="gallery-thumbs mt-4 hidden w-full sm:block">
          <div className="-ms-4 flex flex-wrap">
            {items.map((item, i) => (
              <div
                key={`${item.image.id}-${i}`}
                className="basis-1/5 ps-4 pt-4"
              >
                <a
                  href={`#gallery-slide-${i}`}
                  aria-label={t("select_image")}
                  className="block w-full"
                >
                  <div
                    className={cn(
                      "flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white dark:bg-black border-neutral-200 dark:border-neutral-800",
                    )}
                  >
                    <ImageVideo
                      className="relative h-full w-full object-cover transition duration-300 ease-in-out hover:scale-105"
                      height={80}
                      width={80}
                      imgClassName="h-full w-full object-cover"
                      resource={item.image}
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
