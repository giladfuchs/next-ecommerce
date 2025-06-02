"use client";
import { CSSProperties } from "react";
import { useIntl } from "react-intl";
import {
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { OrderStatus } from "lib/types";

type Props = {
  status: OrderStatus;
  size?: "small" | "large";
  clickable?: boolean;
  style?: CSSProperties; // allow parent to inject custom hover
};

export const OrderDisplay = ({
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

export const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  isCategory,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isCategory: boolean;
}) => {
  const intl = useIntl();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {intl.formatMessage({ id: "delete.title" }, { title })}
      </DialogTitle>
      <DialogContent>
        {intl.formatMessage({ id: "delete.description" })}
        {isCategory && (
          <div style={{ marginTop: 8, color: "red", fontWeight: 500 }}>
            {intl.formatMessage({ id: "delete.cascadeWarning" })}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {intl.formatMessage({ id: "delete.cancel" })}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          data-testid="confirm-delete-button"
        >
          {intl.formatMessage({ id: "delete.confirm" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
