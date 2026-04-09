import { getTranslations } from "next-intl/server";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import type { Media, Product } from "@/lib/core/types/payload-types";

import ImageVideo from "@/components/shared/image-video";
import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/util";

export default async function Gallery({
  gallery,
}: {
  gallery: NonNullable<Product["gallery"]>;
}) {
  const t = await getTranslations("product.gallery");
  const canNavigate = gallery.length > 1;

  return (
    <div>
      <style>{`
        .gallery-radio {
          position: fixed;
          opacity: 0;
          pointer-events: none;
        }

        .gallery-main-item,
        .gallery-prev-label,
        .gallery-next-label {
          display: none;
        }

        ${gallery
          .map(
            (_, i) => `
              #gallery-radio-${i}:checked ~ .gallery-main .gallery-main-item-${i} {
                display: block;
              }

              #gallery-radio-${i}:checked ~ .gallery-thumbs .gallery-thumb-${i} {
                border-width: 2px;
                border-color: rgb(37 99 235);
              }
            `,
          )
          .join("\n")}

        ${
          canNavigate
            ? gallery
                .map((_, i) => {
                  const prevIndex = i - 1 < 0 ? gallery.length - 1 : i - 1;
                  const nextIndex = i + 1 > gallery.length - 1 ? 0 : i + 1;

                  return `
                    #gallery-radio-${i}:checked ~ .gallery-main .gallery-prev-${appConfig.LOCAL.isRtl ? nextIndex : prevIndex} {
                      display: inline-flex;
                    }

                    #gallery-radio-${i}:checked ~ .gallery-main .gallery-next-${appConfig.LOCAL.isRtl ? prevIndex : nextIndex} {
                      display: inline-flex;
                    }
                  `;
                })
                .join("\n")
            : ""
        }
      `}</style>

      {gallery.map((item, i) => {
        if (typeof item.image !== "object") return null;

        return (
          <input
            key={`${item.image.id}-radio-${i}`}
            id={`gallery-radio-${i}`}
            name="gallery"
            type="radio"
            defaultChecked={i === 0}
            className="gallery-radio"
          />
        );
      })}

      <div className="gallery-main relative mb-6 w-full overflow-hidden">
        {gallery.map((item, i) => {
          if (typeof item.image !== "object") return null;

          return (
            <div
              key={`${item.image.id}-main-${i}`}
              className={`gallery-main-item gallery-main-item-${i}`}
            >
              <ImageVideo
                resource={item.image as Media}
                className="w-full"
                imgClassName="w-full rounded-lg"
              />
            </div>
          );
        })}

        {canNavigate ? (
          <div
            dir="ltr"
            className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-4">
              {gallery.map((item, i) => {
                if (typeof item.image !== "object") return null;

                return (
                  <label
                    key={`${item.image.id}-prev-${i}`}
                    htmlFor={`gallery-radio-${i}`}
                    className={`gallery-prev-label gallery-prev-${i} inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/10 backdrop-blur text-neutral-700 hover:text-blue-500`}
                    aria-label={t("previous")}
                  >
                    <HiChevronLeft className="h-5 w-5" />
                  </label>
                );
              })}

              {gallery.map((item, i) => {
                if (typeof item.image !== "object") return null;

                return (
                  <label
                    key={`${item.image.id}-next-${i}`}
                    htmlFor={`gallery-radio-${i}`}
                    className={`gallery-next-label gallery-next-${i} inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/10 backdrop-blur text-neutral-700 hover:text-blue-500`}
                    aria-label={t("next")}
                  >
                    <HiChevronRight className="h-5 w-5" />
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="gallery-thumbs w-full">
        <div className="-ml-4 flex flex-wrap">
          {gallery.map((item, i) => {
            if (typeof item.image !== "object") return null;

            return (
              <div
                key={`${item.image.id}-${i}`}
                className="pl-4 pt-4 basis-1/5 max-[900px]:basis-1/4 max-[640px]:basis-1/3 max-[420px]:basis-1/2"
              >
                <label
                  htmlFor={`gallery-radio-${i}`}
                  aria-label={t("select_image")}
                  className="block w-full cursor-pointer"
                >
                  <div
                    className={cn(
                      `gallery-thumb-${i}`,
                      "group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white dark:bg-black border-neutral-200 dark:border-neutral-800",
                    )}
                  >
                    <ImageVideo
                      className="relative h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
                      height={80}
                      width={80}
                      imgClassName="h-full w-full object-cover"
                      resource={item.image}
                    />
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
