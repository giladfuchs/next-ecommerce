"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Box, Divider, Typography } from "@mui/material";
import {
  OrderInfoList,
  OrderItemsList,
  OrderStatusActions,
  OrderStatusHeader,
} from "components/admin/Order";

import { getOrderById, localeCache } from "lib/api";
import { Order } from "lib/types";

export default function OrderViewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [order, setOrder] = useState<Order | undefined | null>(undefined);

  useEffect(() => {
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
        <OrderInfoList order={order} />
        <Divider sx={{ my: 2 }} />
        <OrderItemsList items={order.items} />
        <OrderStatusHeader status={order.status} />
        <OrderStatusActions order={order} setOrder={setOrder} />
      </Box>
    )
  );
}
