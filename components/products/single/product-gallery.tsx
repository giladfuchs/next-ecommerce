"use client";

import { useState } from "react";
import Image from "next/image";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { GridTileImage } from "components/products/grid/tile";
import { ProductImage } from "lib/types";
import { localeCache } from "lib/api";

export default function ProductGallery({ images }: { images: ProductImage[] }) {
  const [imageIndex, setImageIndex] = useState(0);
  const next = () => setImageIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div>
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        <Image
          className="h-full w-full object-contain mx-auto"
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          alt={(images[imageIndex] as ProductImage).altText}
          src={(images[imageIndex] as ProductImage).url}
          priority
        />

        {images.length > 1 && (
          <div className="absolute bottom-[15%] flex w-full justify-center">
            <div
              dir="ltr"
              className="mx-auto flex h-11 items-center rounded-full border border-white bg-neutral-50/80 text-neutral-500 backdrop-blur-sm dark:border-black dark:bg-neutral-900/80"
            >
              <button
                onClick={localeCache.isRtl() ? next : prev}
                aria-label="Previous product image"
                className="h-full px-6 transition-all hover:scale-110 hover:text-black dark:hover:text-white flex items-center justify-center"
              >
                <ChevronLeftIcon fontSize="small" />
              </button>

              <div className="mx-1 h-6 w-px bg-neutral-500" />

              <button
                onClick={localeCache.isRtl() ? prev : next}
                aria-label="Next product image"
                className="h-full px-6 transition-all hover:scale-110 hover:text-black dark:hover:text-white flex items-center justify-center"
              >
                <ChevronRightIcon fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="my-12 flex flex-wrap items-center justify-center gap-2 overflow-auto py-1 lg:mb-0">
          {images.map((image, idx) => (
            <li key={image.url} className="h-20 w-20">
              <button
                onClick={() => setImageIndex(idx)}
                aria-label="Select product image"
                className="h-full w-full"
              >
                <GridTileImage
                  alt={image.altText}
                  src={image.url}
                  width={80}
                  height={80}
                  active={idx === imageIndex}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
