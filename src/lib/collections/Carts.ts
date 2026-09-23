import { randomBytes } from "node:crypto";

import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { CollectionBeforeChangeHook } from "payload";

type CartItemData = {
  product?: number | string | { id: number | string };
  variant?: number | string | { id: number | string };
  quantity?: number;
};

const relationID = (
  relation: CartItemData["product"] | CartItemData["variant"],
) => (relation && typeof relation === "object" ? relation.id : relation);

const beforeChangeCart: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === "create" && !data.customer && !data.secret) {
    data.secret = randomBytes(20).toString("hex");
    req.context ??= {};
    req.context.newCartSecret = data.secret;
  }

  if (!Array.isArray(data.items)) {
    data.subtotal = 0;
    return data;
  }

  let subtotal = 0;

  for (const item of data.items as CartItemData[]) {
    const productID = relationID(item.product);
    const variantID = relationID(item.variant);
    const quantity = Number(item.quantity ?? 0);

    if (!productID || quantity <= 0) continue;

    const product = await req.payload.findByID({
      collection: "products",
      id: productID,
      depth: 0,
      select: { priceInUSD: true },
    });

    let price = product.priceInUSD;

    if (variantID) {
      const variant = await req.payload.findByID({
        collection: "variants",
        id: variantID,
        depth: 0,
        select: {
          product: true,
          priceInUSD: true,
          priceInUSDEnabled: true,
        },
      });

      if (String(relationID(variant.product)) !== String(productID)) {
        throw new Error("Cart variant does not belong to its product.");
      }

      if (variant.priceInUSDEnabled && typeof variant.priceInUSD === "number") {
        price = variant.priceInUSD;
      }
    }

    subtotal += Number(price ?? 0) * quantity;
  }

  data.subtotal = subtotal;
  return data;
};

export const Carts: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  hooks: {
    ...(defaultCollection.hooks ?? {}),
    beforeChange: [beforeChangeCart],
  },
});
