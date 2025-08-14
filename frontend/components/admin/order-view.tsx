"use client";
import { useIntl, FormattedMessage } from "react-intl";
import { toast } from "sonner";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { OrderStatusDisplay } from "@/components/shared/elements-client";
import { Price } from "@/components/shared/elements-ssr";
import { localeCache, updateOrderStatus } from "@/lib/api";
import { Order, OrderItem, OrderStatus } from "@/lib/types";
import { getOrderInfoSections, OrderInfoItem } from "@/lib/config/ui";
import { statusOptions } from "@/lib/config/mappings";
export const OrderInfoList = ({ order }: { order: Order }) => {
  const { left, right } = getOrderInfoSections(order);

  const renderSection = (items: OrderInfoItem[]) => (
    <List component="nav" disablePadding>
      {items.map(({ icon, label, value, extra, iconSx }, i) => (
        <ListItem key={label + i} disableGutters>
          <ListItemIcon sx={{ minWidth: 40, ...(iconSx ?? {}) }}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={<FormattedMessage id={label} />}
            secondary={value}
            sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
          />
          {extra}
        </ListItem>
      ))}
    </List>
  );
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, sm: 6 }}>{renderSection(left)}</Grid>
        <Grid size={{ xs: 12, sm: 6 }}>{renderSection(right)}</Grid>
      </Grid>
    </Box>
  );
};

export const OrderItemsList = ({ items }: { items: OrderItem[] }) => {
  return (
    <>
      {items.map((product) => (
        <Grid
          key={product.id}
          sx={{
            mx: "auto",
            maxWidth: "30rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            bgcolor: "var(--color-bg)",
            borderRadius: 2,
            p: 2,
            gap: 2,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            direction: localeCache.dir(),
            mb: 2,
          }}
        >
          <Box
            component="img"
            src={product.imageUrl}
            alt={product.imageAlt}
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <Grid sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              fontWeight="bold"
              textAlign={localeCache.isRtl() ? "right" : "left"}
            >
              {product.title}
            </Typography>
            <Typography
              variant="body2"
              textAlign={localeCache.isRtl() ? "right" : "left"}
            >
              <FormattedMessage id="order.item" />: {product.quantity} ×{" "}
              <Price amount={product.unitAmount} />
            </Typography>
          </Grid>
          <Typography
            fontWeight="bold"
            sx={{ minWidth: 80 }}
            textAlign={localeCache.isRtl() ? "right" : "left"}
          >
            <Price amount={product.totalAmount} />
          </Typography>
        </Grid>
      ))}
    </>
  );
};
export const OrderStatusActions = ({
  order,
  setOrder,
}: {
  order: Order;
  setOrder: (order: Order) => void;
}) => {
  const intl = useIntl();
  const nextOptions = statusOptions[order.status];
  if (nextOptions.length === 0) return null;

  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h6" gutterBottom>
        <FormattedMessage id="order.statusUpdate" />
      </Typography>
      <Grid container justifyContent="center" spacing={2}>
        {nextOptions.map((nextStatus) => (
          <Grid key={nextStatus}>
            <div
              onClick={async () => {
                try {
                  const updated = await updateOrderStatus(order.id, nextStatus);
                  toast.success(
                    "✅ " +
                      intl.formatMessage({ id: "order.statusUpdate.success" }),
                    {
                      description: intl.formatMessage({
                        id: `order.status.${nextStatus}`,
                      }),
                    },
                  );
                  setOrder(updated);
                } catch (err: any) {
                  toast.error(
                    "❌ " +
                      intl.formatMessage({ id: "order.statusUpdate.error" }),
                    {
                      description:
                        err?.message ||
                        intl.formatMessage({ id: "order.statusUpdate.retry" }),
                    },
                  );
                }
              }}
              onMouseEnter={(e) => {
                const chip = e.currentTarget.querySelector(
                  ".MuiChip-root",
                ) as HTMLElement | null;
                if (chip) chip.style.filter = "brightness(0.9)";
              }}
              onMouseLeave={(e) => {
                const chip = e.currentTarget.querySelector(
                  ".MuiChip-root",
                ) as HTMLElement | null;
                if (chip) chip.style.filter = "";
              }}
              style={{ display: "inline-block", cursor: "pointer" }}
            >
              <OrderStatusDisplay status={nextStatus} size="large" clickable />
            </div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
export const OrderStatusHeader = ({ status }: { status: OrderStatus }) => {
  return (
    <Box
      className="order-status-vars"
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
      mb={3}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textTransform: "uppercase",
          color: `var(--color-status-${status})`,
          textAlign: "center",
        }}
      >
        <FormattedMessage id="order.status" />:
      </h2>
      <OrderStatusDisplay status={status} size="large" />
    </Box>
  );
};
