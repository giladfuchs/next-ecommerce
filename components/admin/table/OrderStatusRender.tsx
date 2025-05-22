"use client";

import { ICellRendererParams } from "ag-grid-community";
import { OrderStatus } from "lib/types";
import { OrderStatusChip } from "components/shared/OrderStatusChip";

export default function OrderStatusRender({
  value,
}: ICellRendererParams<OrderStatus>) {
  if (!value) return null;

  return (
    <div style={{ padding: "4px 0" }}>
      <OrderStatusChip status={value} />
    </div>
  );
}
