import Stripe from "stripe";

import type { Field, Payload } from "payload";

import { stripeConfig } from "@/lib/stripe/config";

let stripeClient: Stripe | undefined;

/**
 * Lazily constructed so the app can boot even before STRIPE_SECRET_KEY is set
 * (the Stripe SDK throws immediately if constructed with an empty key).
 */
export const getStripeClient = (): Stripe => {
  if (!stripeConfig.SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeConfig.SECRET_KEY);
  }

  return stripeClient;
};

export const STRIPE_CURRENCY = "usd";

export const toStripeAmount = (amount: number) => Math.round(amount * 100);

/**
 * The two things `src/lib/collections/Orders.ts` needs from Stripe:
 *
 * - `stripePaymentIntentField`: stores the verified PaymentIntent id on
 *   the order (dropped into Orders' `fields`).
 * - `verifyStripePaymentIntent`: confirms a client-supplied PaymentIntent
 *   actually succeeded, matches the cart it claims to pay for, matches the
 *   cart's current total, and hasn't already been used to place another
 *   order (called from Orders' `beforeValidate` hook).
 *
 * To remove Stripe: delete this directory, then in Orders.ts drop
 * `stripePaymentIntentField` from `fields` and the `verifyStripePaymentIntent(...)`
 * call from `beforeValidate`.
 */
export const stripePaymentIntentField: Field = {
  name: "paymentIntentId",
  type: "text",
  unique: true,
  admin: {
    position: "sidebar",
    readOnly: true,
    description: "Stripe PaymentIntent ID",
  },
};

export const verifyStripePaymentIntent = async ({
  paymentIntentId,
  cartId,
  expectedAmount,
  payload,
}: {
  paymentIntentId: unknown;
  cartId: number | string;
  expectedAmount: number;
  payload: Payload;
}) => {
  if (typeof paymentIntentId !== "string" || !paymentIntentId) {
    throw new Error("A completed payment is required to place an order.");
  }

  const paymentIntent =
    await getStripeClient().paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment has not been completed.");
  }

  if (paymentIntent.metadata.cartId !== String(cartId)) {
    throw new Error("Payment does not match this cart.");
  }

  if (paymentIntent.amount !== toStripeAmount(expectedAmount)) {
    throw new Error("Payment amount does not match the cart total.");
  }

  const existing = await payload.find({
    collection: "orders",
    depth: 0,
    limit: 1,
    pagination: false,
    where: { paymentIntentId: { equals: paymentIntentId } },
  });

  if (existing.totalDocs > 0) {
    throw new Error("This payment has already been used for an order.");
  }
};
