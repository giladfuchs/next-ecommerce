"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { type ComponentProps, useMemo } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { HiXMark } from "react-icons/hi2";
import { RiShoppingBagLine } from "react-icons/ri";

import type { Cart } from "@/lib/core/types/payload-types";

import Button from "@/components/ui/button";
import { cn } from "@/lib/core/util";

type CartItem = NonNullable<Cart["items"]>[number];

export const OpenCartButton = ({
  quantity,
  ...rest
}: {
  quantity?: number;
} & ComponentProps<typeof Button>) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className=" relative flex items-center justify-center  border-0 mb-1 border border-neutral-300 bg-white shadow-sm transition hover:bg-neutral-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      {...rest}
    >
      <RiShoppingBagLine className="size-7" />

      {quantity && quantity > 0 && (
        <span
          className="
            absolute -top-1 -right-2
            flex h-5 min-w-[1.25rem] items-center justify-center
            rounded-full bg-indigo-600 px-1
            text-[10px] font-semibold text-white
          "
        >
          {quantity}
        </span>
      )}
    </Button>
  );
};

export const EditItemQuantityButton = ({
  type,
  item,
}: {
  item: CartItem;
  type: "minus" | "plus";
}) => {
  const { decrementItem, incrementItem, isLoading } = useCart();

  const disabled = useMemo(() => {
    if (!item?.id) return true;

    const target =
      item.variant && typeof item.variant === "object"
        ? item.variant
        : item.product && typeof item.product === "object"
          ? item.product
          : null;

    if (
      target &&
      typeof target === "object" &&
      target.inventory !== undefined &&
      target.inventory !== null
    ) {
      if (
        type === "plus" &&
        item.quantity !== undefined &&
        item.quantity !== null
      ) {
        return item.quantity >= target.inventory;
      }
    }

    return false;
  }, [item, type]);

  return (
    <button
      disabled={disabled || isLoading}
      aria-label={
        type === "plus" ? "Increase item quantity" : "Reduce item quantity"
      }
      className={cn(
        "ease hover:cursor-pointer flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
        {
          "cursor-not-allowed": disabled || isLoading,
          "ml-auto": type === "minus",
        },
      )}
      onClick={(e) => {
        e.preventDefault();
        if (!item?.id) return;
        if (type === "plus") incrementItem(item.id);
        else decrementItem(item.id);
      }}
      type="button"
    >
      {type === "plus" ? (
        <FaPlus className="h-4 w-4 text-neutral-600 dark:text-neutral-400 hover:text-blue-500" />
      ) : (
        <FaMinus className="h-4 w-4 text-neutral-600 dark:text-neutral-400 hover:text-blue-500" />
      )}
    </button>
  );
};

export const DeleteItemButton = ({ item }: { item: CartItem }) => {
  const { isLoading, removeItem } = useCart();
  const itemId = item?.id;

  return (
    <button
      aria-label="Remove cart item"
      className={cn(
        "ease hover:cursor-pointer flex h-[17px] w-[17px] items-center justify-center rounded-full bg-neutral-500 transition-all duration-200",
        {
          "cursor-not-allowed px-0": !itemId || isLoading,
        },
      )}
      disabled={!itemId || isLoading}
      onClick={(e) => {
        e.preventDefault();
        if (itemId) removeItem(itemId);
      }}
      type="button"
    >
      <HiXMark className="mx-px h-4 w-4 text-white dark:text-black" />
    </button>
  );
};
