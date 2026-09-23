"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { HiXMark } from "react-icons/hi2";

import {
  DeleteItemButton,
  EditItemQuantityButton,
  OpenCartButton,
} from "./cart-controls";

import type { Cart } from "@/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";
import { Button } from "@/components/ui";
import { buildCartRows, getCartQuantity } from "@/lib/core/adapter";
import { RoutePath } from "@/lib/core/types/types";
import { cn } from "@/lib/core/util";

export const CART_OPEN_EVENT = "cart:open";

export const openCart = () => {
  window.dispatchEvent(new Event(CART_OPEN_EVENT));
};

export default function CartModal() {
  const t = useTranslations("cart");
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener(CART_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CART_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const totalQuantity = useMemo(
    () => getCartQuantity(cart as Cart | null | undefined),
    [cart],
  );
  const rows = useMemo(() => buildCartRows(cart), [cart]);

  return (
    <>
      <OpenCartButton
        quantity={totalQuantity}
        onClick={() => setIsOpen(true)}
      />

      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "cart-drawer fixed inset-y-0 right-0 z-50 flex w-5/6 flex-col gap-4 shadow-lg sm:max-w-sm",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t("title")}</span>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close cart"
              className="rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            >
              <HiXMark className="h-4 w-4 cursor-pointer text-current hover:text-red-400" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <p className="cart-muted text-sm">{t("description")}</p>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <div className="text-5xl leading-none">🛒</div>
            <p className="text-center text-2xl font-bold">{t("emptyTitle")}</p>
          </div>
        ) : (
          <div className="flex grow min-h-0 px-4">
            <div className="flex w-full min-h-0 flex-col">
              <ul className="grow overflow-y-auto py-4 min-h-0">
                {rows.map(({ item, data }, i) => {
                  const {
                    product,
                    variant,
                    isVariant,
                    price,
                    originalPrice,
                    discountPercent,
                  } = data;

                  return (
                    <li className="flex w-full flex-col" key={i}>
                      <div className="relative flex w-full flex-row justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <DeleteItemButton item={item} />
                        </div>

                        <Link
                          className="z-30 flex min-w-0 flex-1 flex-row gap-3"
                          href={`/${RoutePath.product}/${product.slug}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="relative h-24 w-18 shrink-0 cursor-pointer">
                            <div className="cart-subtle relative h-full w-full overflow-hidden rounded-md">
                              {typeof product.meta?.image === "object" && (
                                <ImageVideo
                                  fill
                                  className="relative h-full w-full"
                                  imgClassName="object-cover"
                                  videoClassName="h-full w-full object-cover"
                                  resource={product.meta.image}
                                  variant="card"
                                  size="64px"
                                />
                              )}
                            </div>
                            {discountPercent !== null ? (
                              <span className="cart-discount-badge absolute -end-1 -top-2 rounded-full bg-gray-600 px-1 py-0.5 text-[1rem] font-semibold shadow">
                                {discountPercent}%
                              </span>
                            ) : null}
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col text-base">
                            <span className="line-clamp-2 break-words leading-tight">
                              {product.title}
                            </span>

                            {isVariant && variant ? (
                              <p className="cart-muted mt-1 text-sm capitalize">
                                {Array.isArray(variant.options)
                                  ? variant.options
                                      .map((o) =>
                                        typeof o === "object" &&
                                        o &&
                                        "label" in o
                                          ? (o as { label: string }).label
                                          : null,
                                      )
                                      .filter((x): x is string => Boolean(x))
                                      .join(", ")
                                  : ""}
                              </p>
                            ) : null}
                          </div>
                        </Link>

                        <div className="flex min-h-24 shrink-0 flex-col items-end justify-between gap-2">
                          {typeof price === "number" ? (
                            <div className="flex flex-col items-end gap-0.5 text-sm">
                              {originalPrice !== undefined ? (
                                <Price
                                  amount={originalPrice}
                                  as="span"
                                  className="cart-muted line-through"
                                />
                              ) : null}
                              <Price
                                amount={price}
                                as="span"
                                className={cn(
                                  "font-semibold",
                                  originalPrice !== undefined &&
                                    "cart-sale-price",
                                )}
                              />
                            </div>
                          ) : null}

                          <div className="ml-auto flex h-9 flex-row items-center rounded-lg border border-[var(--cart-border)]">
                            <EditItemQuantityButton item={item} type="minus" />
                            <p className="w-6 text-center">
                              <span className="w-full text-sm">
                                {item.quantity}
                              </span>
                            </p>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="px-4 py-4">
                {typeof cart?.subtotal === "number" ? (
                  <div className="mb-3 flex items-center justify-between border-b border-[var(--cart-border)] pb-2">
                    <p className="cart-muted text-sm">{t("total")}</p>
                    <Price
                      amount={cart.subtotal}
                      className="text-right text-base"
                    />
                  </div>
                ) : null}

                <Button
                  eventName="begin_checkout"
                  variant="secondary"
                  className="w-full"
                >
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    {t("checkout")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
