"use client";
import { Box, Divider, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
  OrderInfoList,
  OrderItemsList,
  OrderStatusActions,
  OrderStatusHeader,
} from "@/components/admin/order-view";
import { getOrderById } from "@/lib/api";
import { localeCache } from "@/lib/config";
import { array_obj_to_obj_with_key } from "@/lib/helper";
import { useAppSelector } from "@/lib/store";
import { ModelType } from "@/lib/types";

import type { Order } from "@/lib/types";

export default function OrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<Order | undefined | null>(undefined);
  const orders: Order[] = useAppSelector(
    (state) => state.admin[ModelType.order],
  ) as Order[];

  useEffect(() => {
    const init = async () => {
      const obj =
        array_obj_to_obj_with_key(orders, Number(id), "id") ??
        (await getOrderById(Number(id)));
      setOrder(obj);
    };
    void init();
  }, [id, orders]);

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
  }, [order]);

  if (order === null) return notFound();

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
