import Link from "next/link";

import type { DisplayMode } from "@/components/shared/grid-or-auto-scroll";
import type { Category, Page, Product, SeoMedia } from "@/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";
import { getProductPricing } from "@/lib/core/adapter";
import appConfig from "@/lib/core/config";
import { RoutePath } from "@/lib/core/types/types";
import { cn, isRtl } from "@/lib/core/util";

export type CardModel = Product | Page | Category;

const resolveMedia = (media: number | SeoMedia): SeoMedia | null =>
  typeof media === "object" ? media : null;

const resolveModel = (model: CardModel, route: RoutePath) => {
  if (route === RoutePath.page) {
    const page = model as Page;
    return {
      href: `/${page.slug === appConfig.HOME_SLUG ? "" : page.slug}`,
      image: resolveMedia(page.meta.image),
      description: page.meta.description,
      product: null,
    };
  }

  if (route === RoutePath.product) {
    const product = model as Product;
    return {
      href: `/${route}/${product.slug}`,
      image: resolveMedia(product.meta.image),
      description: null,
      product,
    };
  }

  const category = model as Category;
  return {
    href: `/${route}/${category.slug}`,
    image: category.meta?.image ? resolveMedia(category.meta.image) : null,
    description: null,
    product: null,
  };
};

export default function ModelCard({
  model,
  route,
  displayMode = "grid",
  tabIndex,
}: {
  model: CardModel;
  route: RoutePath;
  displayMode?: DisplayMode;
  tabIndex?: number;
}) {
  const { description, href, image, product } = resolveModel(model, route);
  const pricing = product ? getProductPricing(product) : null;
  const price = pricing?.price;
  const originalPrice = pricing?.originalPrice;
  const hasDiscount = originalPrice !== undefined;
  const discountPercent = pricing?.discountPercent ?? null;
  const rtl = isRtl(model.title);

  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      className="group flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm transition-shadow duration-300 hover:shadow-md sm:rounded-3xl dark:border-neutral-800 dark:bg-black lg:p-3"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-neutral-900",
          displayMode === "grid"
            ? "aspect-[3/4] sm:aspect-[4/5] lg:aspect-square"
            : "aspect-[3/4] sm:aspect-[4/5]",
        )}
      >
        {image ? (
          <ImageVideo
            resource={image}
            variant="card"
            fill
            imgClassName="object-cover transition duration-300 ease-in-out group-hover:scale-105"
            videoClassName="h-full w-full object-cover"
          />
        ) : null}

        {discountPercent !== null ? (
          <span className="absolute top-3 end-2 rounded-full bg-gray-500 px-2.5 py-1 text-xs font-semibold text-white shadow dark:bg-gray-600">
            {discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 px-1 pb-2 pt-3 text-start sm:pt-4">
        <h3
          dir={rtl ? "rtl" : "ltr"}
          className={cn(
            "line-clamp-2 break-words text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100",
            rtl ? "text-right" : "text-left",
          )}
        >
          {model.title}
        </h3>

        {description ? (
          <p className="line-clamp-3 break-words text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {description}
          </p>
        ) : null}

        {typeof price === "number" ? (
          <div className="mt-auto flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
            {hasDiscount ? (
              <span className="text-gray-400 line-through dark:text-gray-500">
                <Price amount={originalPrice} />
              </span>
            ) : null}
            <span
              className={
                hasDiscount
                  ? "font-semibold text-red-600 dark:text-red-400"
                  : "text-gray-900 dark:text-gray-100"
              }
            >
              <Price amount={price} />
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
