import { addDataAndFileToRequest } from "payload";

import type { Endpoint } from "payload";

import { stripeConfig } from "@/lib/stripe/config";
import {
  STRIPE_CURRENCY,
  getStripeClient,
  toStripeAmount,
} from "@/lib/stripe/server";

type CreatePaymentIntentBody = {
  cartId?: number | string;
  name?: string;
  phone?: string;
  email?: string;
};

const createPaymentIntentEndpoint: Endpoint = {
  path: "/stripe/create-payment-intent",
  method: "post",
  handler: async (req) => {
    if (!stripeConfig.ENABLED) {
      return Response.json(
        { message: "Stripe checkout is disabled." },
        { status: 404 },
      );
    }

    await addDataAndFileToRequest(req);
    const data = req.data as CreatePaymentIntentBody | undefined;
    const cartId = data?.cartId;

    if (!cartId) {
      return Response.json({ message: "cartId is required." }, { status: 400 });
    }

    const cart = await req.payload.findByID({
      collection: "carts",
      id: cartId,
      depth: 0,
    });

    if (!cart || !cart.items?.length || !cart.subtotal) {
      return Response.json({ message: "Cart is empty." }, { status: 400 });
    }

    try {
      const paymentIntent = await getStripeClient().paymentIntents.create({
        amount: toStripeAmount(cart.subtotal),
        currency: STRIPE_CURRENCY,
        automatic_payment_methods: { enabled: true },
        receipt_email: data?.email || undefined,
        metadata: {
          cartId: String(cartId),
          name: data?.name ?? "",
          phone: data?.phone ?? "",
          email: data?.email ?? "",
        },
      });

      return Response.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      req.payload.logger.error(error, "Error creating Stripe payment intent.");
      return Response.json(
        { message: "Unable to start payment." },
        { status: 500 },
      );
    }
  },
};

type UpdatePaymentIntentBody = {
  paymentIntentId?: string;
  name?: string;
  phone?: string;
  email?: string;
};

/**
 * The PaymentIntent is created before the contact form is filled in (so the
 * card element can mount immediately), so its metadata starts without
 * name/phone/email. Called right before confirmPayment() so the webhook
 * fallback below has what it needs to place an order if the client never
 * gets to POST /api/orders itself.
 */
const updatePaymentIntentEndpoint: Endpoint = {
  path: "/stripe/update-payment-intent",
  method: "post",
  handler: async (req) => {
    if (!stripeConfig.ENABLED) {
      return Response.json(
        { message: "Stripe checkout is disabled." },
        { status: 404 },
      );
    }

    await addDataAndFileToRequest(req);
    const data = req.data as UpdatePaymentIntentBody | undefined;

    if (!data?.paymentIntentId) {
      return Response.json(
        { message: "paymentIntentId is required." },
        { status: 400 },
      );
    }

    try {
      await getStripeClient().paymentIntents.update(data.paymentIntentId, {
        receipt_email: data.email || undefined,
        metadata: {
          name: data.name ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
        },
      });

      return Response.json({ ok: true });
    } catch (error) {
      req.payload.logger.error(
        error,
        "Error updating Stripe payment intent metadata.",
      );
      return Response.json(
        { message: "Unable to update payment." },
        { status: 500 },
      );
    }
  },
};

const webhookEndpoint: Endpoint = {
  path: "/stripe/webhook",
  method: "post",
  handler: async (req) => {
    if (!stripeConfig.ENABLED) {
      return Response.json({ received: true });
    }

    const signature = req.headers.get("stripe-signature");

    if (!signature || !stripeConfig.WEBHOOK_SECRET) {
      return Response.json({ received: true });
    }

    const body = await req.text?.();

    if (!body) {
      return Response.json({ received: true });
    }

    let event;
    try {
      event = getStripeClient().webhooks.constructEvent(
        body,
        signature,
        stripeConfig.WEBHOOK_SECRET,
      );
    } catch (error) {
      req.payload.logger.error(error, "Invalid Stripe webhook signature.");
      return Response.json({ message: "Invalid signature." }, { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { cartId, name, phone, email } = paymentIntent.metadata;
      const numericCartId = Number(cartId);

      if (
        Number.isSafeInteger(numericCartId) &&
        numericCartId > 0 &&
        name &&
        phone &&
        email
      ) {
        const existing = await req.payload.find({
          collection: "orders",
          depth: 0,
          limit: 1,
          pagination: false,
          where: { paymentIntentId: { equals: paymentIntent.id } },
        });

        if (existing.totalDocs === 0) {
          try {
            await req.payload.create({
              collection: "orders",
              data: {
                cart: numericCartId,
                name,
                phone,
                email,
                items: [], // Orders.beforeValidate replaces this with the cart snapshot.
                paymentIntentId: paymentIntent.id,
              },
              req,
            });
          } catch (error) {
            req.payload.logger.error(
              error,
              "Error creating order from Stripe webhook.",
            );
          }
        }
      }
    }

    return Response.json({ received: true });
  },
};

/**
 * Mounted in `src/payload.config.ts` via `endpoints: stripeEndpoints`.
 * Remove that one line (and this import) to drop the Stripe HTTP surface.
 */
export const stripeEndpoints: Endpoint[] = [
  createPaymentIntentEndpoint,
  updatePaymentIntentEndpoint,
  webhookEndpoint,
];
