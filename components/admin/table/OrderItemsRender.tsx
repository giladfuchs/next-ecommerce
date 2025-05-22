"use client";

import { ICellRendererParams } from "ag-grid-community";
import { OrderItem } from "../../../lib/types";

export default function OrderItemsRender({
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
