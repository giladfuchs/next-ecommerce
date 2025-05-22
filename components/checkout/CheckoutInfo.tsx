"use client";

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Typography,
  Checkbox,
} from "@mui/material";
import * as Yup from "yup";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import { Cart, NewOrderPayload, Order } from "lib/types";
import { localeCache, submitOrder } from "../../lib/api";
import { clearCart } from "../../lib/store/cartSlice";
import { toast } from "sonner";
import { FormattedMessage, useIntl } from "react-intl";
import Link from "next/link";

const customInput = {
  marginTop: 1,
  marginBottom: 1,
  fontSize: "inherit",
  "& > div > input": {
    padding: "30.5px 14px 11.5px !important",
    textAlign: localeCache.isRtl() ? "right" : "left",
    fontSize: "inherit",
  },
  "& legend": { display: "none" },
  "& fieldset": { top: 0 },
};

const fields = [
  { name: "name", type: "text" },
  { name: "email", type: "text" },
  { name: "phone", type: "tel" },
];

export default function CheckoutInfo({
  onSuccess,
  onError,
}: {
  onSuccess: (orderId: number) => void;
  onError: () => void;
}) {
  const cart: Cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const intl = useIntl();

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

      <Formik
        initialValues={{ email: "", phone: "", name: "", agreed: false }}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .min(2)
            .max(255)
            .required(intl.formatMessage({ id: "form.error.name" })),
          email: Yup.string()
            .email(intl.formatMessage({ id: "form.error.email" }))
            .max(255)
            .required(intl.formatMessage({ id: "form.error.email" })),
          phone: Yup.string()
            .matches(
              /^05\d{8}$/,
              intl.formatMessage({ id: "form.error.phone" }),
            )
            .required(intl.formatMessage({ id: "form.error.phone" })),
          agreed: Yup.boolean()
            .oneOf([true], intl.formatMessage({ id: "form.error.agree" }))
            .required(),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          const trimmedValues = {
            ...values,
            name: values.name.trim(),
            email: values.email.trim(),
            phone: "0" + values.phone.trim().replace(/^0+/, ""),
          };

          const order: NewOrderPayload = { ...trimmedValues, cart };

          try {
            const saved: Order = (await submitOrder(order)) as Order;
            onSuccess(saved.id);
            toast.success(intl.formatMessage({ id: "checkout.success" }), {
              description: intl.formatMessage(
                { id: "checkout.orderId" },
                { id: saved.id },
              ),
            });
            dispatch(clearCart());
          } catch (err) {
            console.error("❌ Order failed:", err);
            toast.error(intl.formatMessage({ id: "checkout.error" }));
            onError();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values,
        }) => (
          <form noValidate onSubmit={handleSubmit} dir={localeCache.dir()}>
            <Box sx={{ p: 2 }}>
              <Grid container direction="column" spacing={2}>
                {fields.map((field) => (
                  <Grid item key={field.name}>
                    <FormControl
                      fullWidth
                      error={
                        touched[field.name as keyof typeof touched] &&
                        Boolean(errors[field.name as keyof typeof errors])
                      }
                      sx={customInput}
                    >
                      <InputLabel
                        htmlFor={`outlined-${field.name}`}
                        shrink
                        sx={{
                          position: "absolute",
                          right: localeCache.isRtl() ? 14 : "auto",
                          left: localeCache.isRtl() ? "auto" : 14,
                          transformOrigin: localeCache.isRtl()
                            ? "top right"
                            : "top left",
                          transform: "translate(0, -1.5px) scale(0.75)",
                          fontSize: "inherit",
                          marginTop: "1rem",
                        }}
                      >
                        <FormattedMessage id={`checkout.${field.name}`} />
                      </InputLabel>
                      <OutlinedInput
                        id={`outlined-${field.name}`}
                        type={field.type}
                        value={values[field.name as keyof typeof values]}
                        name={field.name}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        inputProps={{
                          dir: localeCache.dir(),
                          autoComplete:
                            field.name === "phone" ? "tel" : field.name,
                          style: { fontSize: "inherit" },
                          "data-testid": `checkout-input-${field.name}`,
                        }}
                        sx={{
                          direction: localeCache.dir(),
                          fontSize: "inherit",
                          "& input": {
                            textAlign: localeCache.isRtl() ? "right" : "left",
                          },
                        }}
                      />
                      {touched[field.name as keyof typeof touched] &&
                        errors[field.name as keyof typeof errors] && (
                          <FormHelperText
                            data-testid={`checkout-error-${field.name}`}
                            sx={{
                              textAlign: localeCache.isRtl() ? "right" : "left",
                            }}
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
                  sx={{ direction: localeCache.dir() }}
                >
                  <FormControlLabel
                    sx={{
                      justifyContent: localeCache.isRtl()
                        ? "flex-end"
                        : "flex-start",
                      ml: localeCache.isRtl() ? "auto" : 0,
                      mr: localeCache.isRtl() ? 0 : "auto",
                    }}
                    control={
                      <Checkbox
                        checked={values.agreed}
                        onChange={handleChange}
                        name="agreed"
                        color="primary"
                        sx={{
                          ml: localeCache.isRtl() ? 1 : 0,
                          mr: localeCache.isRtl() ? 0 : 1,
                        }}
                        data-testid="checkout-agree"
                      />
                    }
                    label={
                      <Typography
                        fontSize="0.9rem"
                        textAlign={localeCache.isRtl() ? "right" : "left"}
                      >
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
                      </Typography>
                    }
                  />
                  {touched.agreed && errors.agreed && (
                    <FormHelperText
                      data-testid="checkout-error-agreed"
                      sx={{
                        textAlign: localeCache.isRtl() ? "right" : "left",
                      }}
                    >
                      {String(errors.agreed)}
                    </FormHelperText>
                  )}
                </FormControl>

                <Divider />

                <Grid item>
                  <Typography
                    variant="h3"
                    component="h3"
                    fontWeight="normal"
                    fontSize="0.9rem"
                    color="text.secondary"
                    textAlign={localeCache.isRtl() ? "right" : "left"}
                    maxWidth={280}
                    sx={{
                      width: "fit-content",
                      ml: localeCache.isRtl() ? "auto" : 0,
                      mr: localeCache.isRtl() ? 0 : "auto",
                    }}
                  >
                    <FormattedMessage id="checkout.pickupNotice" />
                  </Typography>
                </Grid>

                <Grid item>
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
              </Grid>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
}
