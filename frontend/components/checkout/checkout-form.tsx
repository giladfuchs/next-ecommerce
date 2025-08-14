"use client";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import Link from "next/link";
import { Formik } from "formik";
import { toast } from "sonner";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import {
  formikHelperTextSx,
  formikTextFieldSx,
} from "@/lib/assets/styles/style";
import { RootState } from "@/lib/store";
import {
  Cart,
  CheckoutFormValues,
  NewOrderPayload,
  Order,
  checkout_fields,
  getCheckoutValidationSchema,
} from "@/lib/types";
import { submitOrder } from "@/lib/api";
import { clearCart } from "@/lib/store/cartSlice";
import { localeCache } from "@/lib/api";

const CheckoutActions = ({ isSubmitting }: { isSubmitting: boolean }) => {
  return (
    <>
      <Grid>
        <Typography
          variant="h3"
          component="h3"
          fontSize="0.9rem"
          color="text.secondary"
          textAlign={localeCache.isRtl() ? "right" : "left"}
        >
          <FormattedMessage id="checkout.pickupNotice" />
        </Typography>
      </Grid>

      <Grid>
        <Button
          data-testid="checkout-submit"
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          <FormattedMessage id="checkout.submit" />
        </Button>
      </Grid>
    </>
  );
};

const CheckoutFormFields = ({
  onSubmit,
}: {
  onSubmit: (values: CheckoutFormValues) => void;
}) => {
  const intl = useIntl();

  return (
    <Formik<CheckoutFormValues>
      initialValues={{ email: "", phone: "", name: "", agreed: false }}
      validationSchema={getCheckoutValidationSchema(intl)}
      onSubmit={async (values, helpers) => {
        await onSubmit(values);
        helpers.setSubmitting(false);
      }}
    >
      {({
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        values,
      }) => (
        <form noValidate onSubmit={handleSubmit} dir={localeCache.dir()}>
          <Box sx={{ p: 2 }}>
            <Grid container direction="column" spacing={2}>
              {checkout_fields.map((field) => (
                <Grid key={field.name}>
                  <FormControl
                    fullWidth
                    error={
                      touched[field.name as keyof typeof touched] &&
                      Boolean(errors[field.name as keyof typeof errors])
                    }
                    sx={formikTextFieldSx}
                  >
                    <InputLabel
                      htmlFor={`outlined-${field.name}`}
                      shrink
                      sx={{
                        position: "absolute",
                        right: localeCache.isRtl() ? 14 : "unset",
                        left: localeCache.isRtl() ? "unset" : 14,
                        transformOrigin: localeCache.isRtl()
                          ? "top right"
                          : "top left",
                        transform: "translate(0, -1.5px) scale(0.75)",
                        fontSize: "inherit",
                        color: "#9e9e9e",
                      }}
                    >
                      <FormattedMessage id={`checkout.${field.name}`} />
                    </InputLabel>

                    <OutlinedInput
                      id={`outlined-${field.name}`}
                      name={field.name}
                      type={field.type}
                      value={values[field.name as keyof typeof values]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      inputProps={{
                        autoComplete:
                          field.name === "phone" ? "tel" : field.name,
                        dir: localeCache.dir(),
                        "data-testid": `checkout-input-${field.name}`,
                      }}
                      sx={{
                        direction: localeCache.dir(),
                        fontSize: "inherit",
                        "& input": {
                          textAlign: localeCache.isRtl() ? "right" : "left",
                          fontSize: "inherit",
                        },
                      }}
                    />

                    {touched[field.name as keyof typeof touched] &&
                      errors[field.name as keyof typeof errors] && (
                        <FormHelperText
                          data-testid={`checkout-error-${field.name}`}
                          sx={formikHelperTextSx}
                        >
                          {String(errors[field.name as keyof typeof errors])}
                        </FormHelperText>
                      )}
                  </FormControl>
                </Grid>
              ))}

              <FormControl
                required
                error={Boolean(touched.agreed && errors.agreed)}
              >
                <Box textAlign={localeCache.isRtl() ? "right" : "left"}>
                  <FormControlLabel
                    labelPlacement="start"
                    control={
                      <Checkbox
                        checked={values.agreed}
                        onChange={handleChange}
                        name="agreed"
                        color="primary"
                        data-testid="checkout-agree"
                      />
                    }
                    label={
                      <FormattedMessage
                        id="checkout.agreeToTerms"
                        values={{
                          link: (
                            <Link
                              href="/legal/terms"
                              target="_blank"
                              style={{ textDecoration: "underline" }}
                            >
                              <FormattedMessage id="checkout.termsLinkText" />
                            </Link>
                          ),
                        }}
                      />
                    }
                  />
                </Box>

                {touched.agreed && errors.agreed && (
                  <FormHelperText
                    data-testid="checkout-error-agreed"
                    sx={formikHelperTextSx}
                  >
                    {String(errors.agreed)}
                  </FormHelperText>
                )}
              </FormControl>

              <Divider />
              <CheckoutActions isSubmitting={isSubmitting} />
            </Grid>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default function CheckoutForm({
  onSuccess,
  onError,
}: {
  onSuccess: (orderId: number) => void;
  onError: () => void;
}) {
  const cart: Cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const handleSubmit = async (values: CheckoutFormValues) => {
    const order: NewOrderPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: "0" + values.phone.trim().replace(/^0+/, ""),
      cart,
    };

    try {
      const saved: Order = await submitOrder(order);
      onSuccess(saved.id);
      toast.success(<FormattedMessage id="checkout.success" />, {
        description: (
          <FormattedMessage id="checkout.orderId" values={{ id: saved.id }} />
        ),
      });
      dispatch(clearCart());
    } catch (err) {
      console.error("❌ Order failed:", err);
      toast.error(<FormattedMessage id="checkout.error" />);
      onError();
    }
  };

  return (
    <Box
      data-testid="checkout-page"
      sx={{
        width: "100%",
        mx: "auto",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        fontSize: "inherit",
      }}
    >
      <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
        <FormattedMessage id="checkout.contactDetails" />
      </Typography>
      <CheckoutFormFields onSubmit={handleSubmit} />
    </Box>
  );
}
