"use client";
import { ICellRendererParams } from "ag-grid-community";
import { OrderStatus } from "lib/types";
import { OrderDisplay } from "components/shared/elements-client";

export default function OrderStatusRenderer({
  value,
}: ICellRendererParams<OrderStatus>) {
  return (
    <div style={{ padding: "4px 0" }}>
      <OrderDisplay status={value} />
    </div>
  );
}
