"use client";

import { notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Box, Divider, Typography } from "@mui/material";
import {
  OrderInfoList,
  OrderItemsList,
  OrderStatusActions,
  OrderStatusHeader,
} from "components/admin/order-view";
import { cache, getOrderById, localeCache } from "lib/api";
import { ModelType, Order } from "lib/types";
import { array_obj_to_obj_with_key } from "lib/helper";

export default function OrderViewPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | undefined | null>(undefined);

  useEffect(() => {
    const init = async () => {
      const obj =
        array_obj_to_obj_with_key(
          cache.getByModel(ModelType.order),
          Number(params.id),
          "id",
        ) ?? (await getOrderById(Number(params.id)));
      setOrder(obj);
    };
    void init();
  }, []);
  if (order === null) return notFound();

  const StaticOrderView = useMemo(() => {
    if (!order) return null;
    return (
      <>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
          <FormattedMessage id="order.title" /> #{order.id}
        </Typography>
        <OrderInfoList order={order} />
        <Divider sx={{ my: 2 }} />
        <OrderItemsList items={order.items} />
      </>
    );
  }, [order?.id]);

  return (
    order && (
      <Box
        data-testid="admin-order-detail"
        sx={{ maxWidth: 800, mx: "auto", p: 3, direction: localeCache.dir() }}
      >
        {StaticOrderView}
        <OrderStatusHeader status={order.status} />
        <OrderStatusActions order={order} setOrder={setOrder} />
      </Box>
    )
  );
}
