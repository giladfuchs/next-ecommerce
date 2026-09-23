"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import GenericForm from "@/components/shared/generic-form";
import { Message } from "@/components/ui";
import {
  checkoutFormConfig,
  type CheckoutFormData,
} from "@/lib/core/types/form";
import { postJson } from "@/lib/core/util";
import stripeConfig, { stripePromise } from "@/lib/stripe/config";

export type CheckoutPaymentProps = {
  cartId: number | undefined;
  clearCart: undefined | (() => Promise<void> | void);
  onSuccess: (orderId: string) => void;
};

/**
 * Single-step checkout: contact fields + the Stripe card element in one
 * form, one submit button. The PaymentIntent is created as soon as the
 * cart is known (before the shopper fills anything in), so by the time
 * they hit submit, payment confirms immediately with no extra step.
 */
export default function CheckoutPayment({
  cartId,
  clearCart,
  onSuccess,
}: CheckoutPaymentProps) {
  const t = useTranslations("checkout.page");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cartId) return;
    let cancelled = false;

    postJson<{ clientSecret: string }>("stripe/create-payment-intent", {
      cartId,
    })
      .then((json) => {
        if (!cancelled) setClientSecret(json.clientSecret);
      })
      .catch((startError: unknown) => {
        if (!cancelled) {
          setError(
            startError instanceof Error
              ? startError.message
              : t("payment.failed"),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cartId, t]);

  if (error) return <Message error={error} />;

  if (!clientSecret) {
    return <p className="text-sm opacity-80">{t("payment.preparing")}</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm
        cartId={cartId as number}
        clientSecret={clientSecret}
        clearCart={clearCart}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

function StripeCheckoutForm({
  cartId,
  clientSecret,
  clearCart,
  onSuccess,
}: {
  cartId: number;
  clientSecret: string;
  clearCart: CheckoutPaymentProps["clearCart"];
  onSuccess: CheckoutPaymentProps["onSuccess"];
}) {
  const t = useTranslations("checkout.page");
  const stripe = useStripe();
  const elements = useElements();

  const submitOrder = async (contact: CheckoutFormData) => {
    if (!stripe || !elements) throw new Error(t("payment.failed"));

    // A prior attempt may have already charged the card and only failed on
    // the order-creation step below (network blip, etc). Re-confirming an
    // already-succeeded PaymentIntent errors out with Stripe, so check first
    // and skip straight to placing the order if that's what happened.
    const { paymentIntent: existingIntent } =
      await stripe.retrievePaymentIntent(clientSecret);

    let paymentIntentId = existingIntent?.id;

    if (existingIntent?.status !== "succeeded") {
      // Metadata is written here (rather than at creation) because the
      // PaymentIntent is created before this contact form is filled in —
      // the webhook fallback (which creates the order if the request below
      // never completes) needs name/phone/email to do that.
      await postJson("stripe/update-payment-intent", {
        paymentIntentId: clientSecret.split("_secret_")[0],
        ...contact,
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          redirect: "if_required",
        },
      );

      if (stripeError) {
        throw new Error(stripeError.message ?? t("payment.failed"));
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error(t("payment.failed"));
      }

      paymentIntentId = paymentIntent.id;
    }

    const json = await postJson<{ doc: { id: number } }>("orders?depth=0", {
      cart: cartId,
      ...contact,
      paymentIntentId,
    });

    return String(json.doc.id);
  };

  return (
    <GenericForm
      config={{
        ...checkoutFormConfig,
        submit: {
          ...checkoutFormConfig.submit,
          labelKey: "submit.pay",
          submittingLabelKey: "submit.paying",
        },
        successMessageKey: "submit.paid",
      }}
      onSubmit={submitOrder}
      onSuccess={async (orderId) => {
        onSuccess(orderId);
        await clearCart?.();
      }}
      disabled={!stripe || !elements}
    >
      {stripeConfig.PUBLISHABLE_KEY?.startsWith("pk_test") ? (
        <p dir="ltr" className="mt-2 text-xs opacity-70">
          Test mode — card 4242 4242 4242 4242, any future date, any CVC.
        </p>
      ) : null}
      <PaymentElement />
    </GenericForm>
  );
}
