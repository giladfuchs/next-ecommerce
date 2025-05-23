import { CSSProperties } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Chip, Typography } from "@mui/material";
import { OrderStatus } from "lib/types";

export const OrderSuccessMessage = ({ orderId }: { orderId: number }) => (
  <>
    <Typography
      data-testid="checkout-success"
      variant="h5"
      textAlign="center"
      fontWeight="bold"
      color="success.main"
      mb={1}
    >
      <FormattedMessage id="checkout.success" />
    </Typography>
    <Typography
      variant="h6"
      textAlign="center"
      fontWeight="bold"
      color="success.main"
    >
      <FormattedMessage id="checkout.orderId" values={{ id: orderId }} />
    </Typography>
    <Typography
      variant="subtitle1"
      textAlign="center"
      fontWeight="bold"
      color="success.main"
    >
      <FormattedMessage id="checkout.email_spam1" />
    </Typography>
    <Typography
      variant="subtitle1"
      textAlign="center"
      fontWeight="bold"
      color="success.main"
    >
      <FormattedMessage id="checkout.email_spam2" />
    </Typography>
  </>
);

export const OrderErrorMessage = () => (
  <Typography
    variant="h6"
    textAlign="center"
    fontWeight="bold"
    color="error"
    sx={{ py: 4 }}
  >
    <FormattedMessage id="checkout.error" />
  </Typography>
);

type Props = {
  status: OrderStatus;
  size?: "small" | "large";
  clickable?: boolean;
  style?: CSSProperties; // allow parent to inject custom hover
};

export const OrderStatusChip = ({
  status,
  size = "small",
  clickable = false,
  style = {},
}: Props) => {
  const intl = useIntl();

  const baseStyle: CSSProperties = {
    backgroundColor: `var(--color-status-${status})`,
    color: "var(--color-text-strong)",
    fontWeight: 600,
    fontSize: size === "large" ? "1rem" : "0.75rem",
    padding: size === "large" ? "10px 20px" : undefined,
    cursor: clickable ? "pointer" : "default",
    transition: "filter 0.2s ease",
    ...style,
  };

  return (
    <Chip
      label={intl.formatMessage({ id: `order.status.${status}` })}
      style={baseStyle}
      size={size === "large" ? "medium" : "small"}
    />
  );
};
