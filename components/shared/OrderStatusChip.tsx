import { Chip } from "@mui/material";
import { CSSProperties } from "react";
import { useIntl } from "react-intl";
import { OrderStatus } from "lib/types";

type Props = {
  status: OrderStatus;
  size?: "small" | "large";
  clickable?: boolean;
  style?: CSSProperties; // allow parent to inject custom hover
};

export function OrderStatusChip({
  status,
  size = "small",
  clickable = false,
  style = {},
}: Props) {
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
}
