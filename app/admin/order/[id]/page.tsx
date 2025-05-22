// no change here
"use client";

import { notFound } from "next/navigation";
import Price from "components/shared/Price";
import {
  getOrderById,
  localeCache,
  updateOrderStatus,
} from "../../../../lib/api";
import { green, red, blue, orange, purple, lime } from "@mui/material/colors";
import {
  PersonTwoTone,
  MailTwoTone,
  AccessTimeTwoTone,
  MonetizationOnTwoTone,
  ShoppingBagTwoTone,
  WhatsApp,
  PhonelinkRingTwoTone,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import * as React from "react";
import { Order, OrderStatus } from "../../../../lib/types";
import { toast } from "sonner";
import { useIntl, FormattedMessage } from "react-intl";
import { OrderStatusChip } from "../../../../components/shared/OrderStatusChip";

const statusOptions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [
    OrderStatus.READY,
    OrderStatus.DONE,
    OrderStatus.CANCELED,
  ],
  [OrderStatus.READY]: [OrderStatus.DONE, OrderStatus.CANCELED],
  [OrderStatus.DONE]: [],
  [OrderStatus.CANCELED]: [OrderStatus.NEW],
};

export default function OrderViewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [order, setOrder] = React.useState<Order | undefined | null>(undefined);
  const intl = useIntl();

  React.useEffect(() => {
    const init = async () => {
      const obj = await getOrderById(Number(id));
      setOrder(obj);
    };
    void init();
  }, [id]);

  if (order === null) return notFound();

  return (
    order && (
      <Box
        data-testid="admin-order-detail"
        sx={{ maxWidth: 800, mx: "auto", p: 3, direction: localeCache.dir() }}
      >
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
          <FormattedMessage id="order.title" /> #{order.id}
        </Typography>

        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={6}>
            <List component="nav" disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40, color: blue[700] }}>
                  <PersonTwoTone sx={{ fontSize: "1.3rem" }} />
                </ListItemIcon>
                <ListItemText
                  primary={<FormattedMessage id="order.name" />}
                  secondary={order.name}
                  sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <a href={`tel:${order.phone}`} style={{ color: green[500] }}>
                    <PhonelinkRingTwoTone sx={{ fontSize: "1.3rem" }} />
                  </a>
                </ListItemIcon>
                <ListItemText
                  primary={<FormattedMessage id="order.phone" />}
                  secondary={order.phone}
                  sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
                />
                <ListItemIcon sx={{ minWidth: 40, ml: 1 }}>
                  <a
                    href={`https://wa.me/${order.phone.replace(/^0/, "972")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#25D366" }}
                  >
                    <WhatsApp sx={{ fontSize: "1.3rem" }} />
                  </a>
                </ListItemIcon>
              </ListItem>

              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <a href={`mailto:${order.email}`} style={{ color: red[500] }}>
                    <MailTwoTone sx={{ fontSize: "1.3rem" }} />
                  </a>
                </ListItemIcon>
                <ListItemText
                  primary={<FormattedMessage id="order.email" />}
                  secondary={order.email}
                  sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} sm={6}>
            <List component="nav" disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40, color: purple[500] }}>
                  <AccessTimeTwoTone sx={{ fontSize: "1.3rem" }} />
                </ListItemIcon>
                <ListItemText
                  primary={<FormattedMessage id="order.date" />}
                  secondary={new Date(order.createdAt).toLocaleDateString(
                    "he-IL",
                  )}
                  sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40, color: lime[700] }}>
                  <ShoppingBagTwoTone sx={{ fontSize: "1.3rem" }} />
                </ListItemIcon>
                <ListItemText
                  primary={<FormattedMessage id="order.quantity" />}
                  secondary={order.totalQuantity}
                  sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40, color: orange[500] }}>
                  <MonetizationOnTwoTone sx={{ fontSize: "1.3rem" }} />
                </ListItemIcon>
                <ListItemText
                  primary={<FormattedMessage id="order.total" />}
                  secondary={<Price amount={order.cost} />}
                  sx={{ textAlign: localeCache.isRtl() ? "right" : "left" }}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {order.items.map((product) => (
          <Grid
            key={product.id}
            sx={{
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
            <Grid item sx={{ flexGrow: 1, minWidth: 0 }}>
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

        <Box
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
              color: `var(--color-status-${order.status})`,
              textAlign: "center",
            }}
          >
            <FormattedMessage id="order.status" />:
          </h2>
          <OrderStatusChip status={order.status} size="large" />
        </Box>

        {statusOptions[order.status].length > 0 && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" gutterBottom>
              <FormattedMessage id="order.statusUpdate" />
            </Typography>
            <Grid container justifyContent="center" spacing={2}>
              {statusOptions[order.status].map((nextStatus) => (
                <Grid item key={nextStatus}>
                  <div
                    onClick={async () => {
                      try {
                        const updated = await updateOrderStatus(
                          (order as Order).id,
                          nextStatus,
                        );
                        toast.success(
                          "✅ " +
                            intl.formatMessage({
                              id: "order.statusUpdate.success",
                            }),
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
                            intl.formatMessage({
                              id: "order.statusUpdate.error",
                            }),
                          {
                            description:
                              err?.message ||
                              intl.formatMessage({
                                id: "order.statusUpdate.retry",
                              }),
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
                    <OrderStatusChip
                      status={nextStatus}
                      size="large"
                      clickable
                    />
                  </div>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    )
  );
}
