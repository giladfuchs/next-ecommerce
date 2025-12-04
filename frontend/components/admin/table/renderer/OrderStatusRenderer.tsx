"use client";

import { OrderStatusDisplay } from "@/components/shared/elements-client";

import type { OrderStatus } from "@/lib/types";
import type { ICellRendererParams } from "ag-grid-community";

export default function OrderStatusRenderer({
  value,
}: ICellRendererParams<OrderStatus>) {
  return (
    <div style={{ padding: "4px 0" }}>
      <OrderStatusDisplay status={value} />
    </div>
  );
}
