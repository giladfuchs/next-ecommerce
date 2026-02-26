"use client";
import type { OrderItem } from "@/lib/types";
import type { ICellRendererParams } from "ag-grid-community";

export default function OrderItemsRenderer({
  value,
}: ICellRendererParams<OrderItem[]>) {
  if (!Array.isArray(value)) return null;
  return (
    <div style={{ lineHeight: 1.6, whiteSpace: "normal", padding: "4px 0" }}>
      {value.map((item, idx) => (
        <div key={idx}>
          {item.title} × {item.quantity} × {item.unitAmount}
        </div>
      ))}
    </div>
  );
}
