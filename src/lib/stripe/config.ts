import { loadStripe } from "@stripe/stripe-js";

/**
 * All Stripe env access lives here so the rest of this directory — and the
 * app — never touches `process.env.STRIPE_*` directly. Deleting this whole
 * `src/lib/stripe/` directory (plus its handful of call sites) fully removes
 * Stripe from the app.
 */
export const stripeConfig = {
  /**
   * Master on/off switch. When false: checkout skips straight to placing the
   * order (no card step), and Orders skips payment verification entirely —
   * see the `stripeConfig.ENABLED` checks in checkout-form.tsx and Orders.ts.
   */
  ENABLED: process.env.NEXT_PUBLIC_ENABLE_STRIPE === "true",
  SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
};

export default stripeConfig;

/**
 * Client-side Stripe.js singleton, used by CheckoutPayment.tsx to mount
 * <Elements>. `loadStripe` is SSR-safe (no-ops to a resolved null outside
 * the browser), so importing this from server code is harmless.
 */
export const stripePromise = loadStripe(stripeConfig.PUBLISHABLE_KEY, {
  developerTools: {
    assistant: { enabled: false },
  },
});
