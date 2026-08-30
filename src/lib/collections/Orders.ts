import { addDataAndFileToRequest } from "payload";

import type { Variant } from "@/lib/core/types/payload-types";
import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
} from "payload";

import {
  adminOnlyAccess,
  isAdmin,
  stripAdminFieldComponent,
} from "@/lib/collections/base-fields";
import { getOrderDashboard } from "@/lib/collections/order-dashboard";
import appConfig from "@/lib/core/config";
import { OrderNotifier } from "@/lib/core/OrderNotifier";
import {
  type CartItem,
  CollectionName,
  OrderStatus,
} from "@/lib/core/types/types";
import { isValidOrderStatusTransition } from "@/lib/core/util";

export const Orders: CollectionOverride = ({ defaultCollection }) => {
  return {
    ...defaultCollection,

    admin: {
      ...(defaultCollection.admin || {}),
      useAsTitle: "name",
      defaultColumns: ["name", "phone", "email", "createdAt"],
    },

    access: {
      ...adminOnlyAccess,
      create: () => true,
    },

    fields: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((defaultCollection.fields || []) as any[])
        .filter(
          (f) =>
            f?.type !== "tabs" &&
            (!f?.name || !["customerEmail", "transactions"].includes(f.name)),
        )
        .map((f) => {
          if (f?.name === "customer")
            return {
              ...f,
              required: false,
              admin: {
                ...(f.admin || {}),
                position: "sidebar",
                hidden: true,
                condition: () => false,
                readOnly: true,
                disabled: true,
              },
            };

          if (f?.name === "status")
            return {
              ...f,
              defaultValue: OrderStatus.NEW,
              options: Object.values(OrderStatus),
              admin: {
                ...(f.admin || {}),
                position: "sidebar",
                hidden: true,
                readOnly: true,
                disabled: true,
              },
            };

          if (f.type !== "row" || !Array.isArray(f.fields)) return f;

          const amountField = f.fields[0];
          const fixedAmount = {
            ...amountField,
            admin: stripAdminFieldComponent(amountField.admin),
          };

          return { ...f, fields: [fixedAmount] };
        }),

      { name: "name", type: "text", required: true },
      { name: "phone", type: "text", required: true },
      { name: "email", type: "email", required: true },
      {
        name: "OrderView",
        type: "ui",
        admin: {
          position: "sidebar",
          components: {
            Field: "@/components/admin/order-view#OrderView",
          },
        },
      },

      {
        name: "items",
        type: "array",
        required: true,
        fields: [
          {
            name: "product",
            type: "relationship",
            relationTo: CollectionName.products,
            required: true,
          },

          { name: "title", type: "text", required: true },
          { name: "quantity", type: "number", required: true },
          { name: "unitPrice", type: "number", required: true },
          { name: "lineTotal", type: "number", required: true },
        ],
      },
    ],

    endpoints: [
      ...(defaultCollection.endpoints || []),
      {
        path: "/dashboard",
        method: "get",
        handler: getOrderDashboard,
      },
      {
        path: "/:id/status",
        method: "post",
        handler: async (req) => {
          if (!isAdmin({ req })) {
            return Response.json({ message: "Forbidden" }, { status: 403 });
          }

          await addDataAndFileToRequest(req);
          const id = req.routeParams?.id;
          const nextStatus = req.data?.status;
          if (!id || typeof nextStatus !== "string") {
            return Response.json(
              { message: "status is required" },
              { status: 400 },
            );
          }

          const order = await req.payload.findByID({
            collection: "orders",
            id: String(id),
          });

          if (
            !isValidOrderStatusTransition(
              order.status as unknown as OrderStatus,
              nextStatus,
            )
          ) {
            return Response.json(
              { message: "Invalid status transition" },
              { status: 400 },
            );
          }

          const updated = await req.payload.update({
            collection: "orders",
            id: String(id),
            data: { status: nextStatus },
            req,
          });

          return Response.json(updated);
        },
      },
    ],

    hooks: {
      ...(defaultCollection.hooks || {}),

      afterChange: [
        ...((defaultCollection.hooks?.afterChange ||
          []) as CollectionAfterChangeHook[]),

        async (args) => {
          const { operation, doc, req } = args;
          if (
            operation !== "create" ||
            req.context?.skipOrderNotification ||
            !appConfig.SEND_EMAIL_WHATSAPP
          )
            return doc;

          await new OrderNotifier(req.payload).send(doc);

          return doc;
        },
      ],
      beforeValidate: [
        ...((defaultCollection.hooks
          ?.beforeValidate as CollectionBeforeValidateHook[]) || []),
        async ({ data, req, operation }) => {
          if (!data) return data;

          if (operation === "create") data.status = OrderStatus.NEW;

          const rawCart = data.cart;
          const cartId = typeof rawCart === "object" ? rawCart?.id : rawCart;
          if (!cartId) return data;

          const cart = await req.payload.findByID({
            collection: "carts",
            id: cartId,
            depth: 3,
          });

          const items: CartItem[] = Array.isArray(cart?.items)
            ? cart.items
            : [];

          const snapshot = items
            .map((it) => {
              const quantity = Number(it?.quantity ?? 0);
              if (!quantity) return null;

              const product =
                typeof it.product === "object" && it.product
                  ? it.product
                  : undefined;

              const variant =
                typeof it.variant === "object" && it.variant
                  ? (it.variant as Variant)
                  : undefined;

              const productId =
                typeof it.product === "object" ? it.product?.id : it.product;

              if (!productId || !product) return null;

              const optionLabels = (variant?.options ?? [])
                .map((option) =>
                  typeof option === "object" ? option.label : null,
                )
                .filter((label): label is string => Boolean(label));

              const title = optionLabels.length
                ? `${product.title} – ${optionLabels.join(" / ")}`
                : (product.title ?? "");

              const unitPrice =
                variant?.priceInUSDEnabled && variant.priceInUSD != null
                  ? Number(variant.priceInUSD)
                  : Number(product.priceInUSD ?? 0);

              return {
                product: productId,
                title,
                quantity,
                unitPrice,
                lineTotal: unitPrice * quantity,
              };
            })
            .filter(
              (
                x,
              ): x is {
                product: number;
                title: string;
                quantity: number;
                unitPrice: number;
                lineTotal: number;
              } => Boolean(x),
            );

          data.items = snapshot;
          data.amount = cart.subtotal;

          return data;
        },
      ],
    },
  };
};
