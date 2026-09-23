"use client";
import "../../lib/styles/admin-tailwind.css";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

import type { Order } from "@/payload-types";

import { withProviders } from "@/components/admin";
import BaseDal from "@/lib/core/dal/base-dal";
import { OrderStatus } from "@/lib/core/types/types";
import { cn, ORDER_STATUS_FLOW, postJson } from "@/lib/core/util";

type OrderContactActionsProps = Pick<Order, "phone" | "email">;

type OrderDetails = OrderContactActionsProps & {
  id: string;
  status: OrderStatus;
};

const base = {
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "9999px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-50)",
};
export const OrderContactActions = ({
  phone,
  email,
}: OrderContactActionsProps) => {
  if (!phone && !email) return null;

  return (
    <div style={{ display: "flex", gap: "1rem", padding: "0.5rem 0.25rem" }}>
      <a href={`tel:${phone}`} style={{ ...base, color: "#16a34a" }}>
        <FaPhoneAlt size="1.3rem" />
      </a>
      <a
        href={`https://wa.me/${phone.replace(/^0/, "972")}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...base, color: "#25D366" }}
      >
        <FaWhatsapp size="1.3rem" />
      </a>
      <a href={`mailto:${email}`} style={{ ...base, color: "#2563eb" }}>
        <FaEnvelope size="1.3rem" />
      </a>
    </div>
  );
};
const Divider = () => (
  <div style={{ height: 1, backgroundColor: "#e5e7eb", margin: "8px 0" }} />
);
const useOrderId = () => {
  const params = useParams();
  return useMemo(() => {
    const id =
      params?.segments?.at(-1) ??
      (typeof window === "undefined"
        ? undefined
        : window.location.pathname.split("/").at(-1));
    return id && id !== "create" ? id : undefined;
  }, [params]);
};

const OrderViewInner = () => {
  const id = useOrderId();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (!id) return;
    let isCurrent = true;

    BaseDal.fetchApi<Pick<Order, "phone" | "email" | "status">>(
      `orders/${id}`,
      {
        expect: "json",
        select: { phone: true, email: true, status: true },
      },
    ).then(({ phone, email, status }) => {
      if (!isCurrent) return;
      setOrder({
        id,
        phone,
        email,
        status: (status ?? OrderStatus.NEW) as OrderStatus,
      });
    });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  if (!id || order?.id !== id) return null;

  return (
    <div>
      <OrderContactActions phone={order.phone} email={order.email} />
      <Divider />
      <OrderStatusPanelInner key={id} initialStatus={order.status} id={id} />
    </div>
  );
};

const OrderStatusChip = ({ status }: { status: OrderStatus }) => {
  const t = useTranslations("admin.orderStatus");

  return (
    <span className="order-status-chip" data-status={status}>
      <span className="order-status-chip__dot" aria-hidden="true" />
      {t(`values.${status}`)}
    </span>
  );
};

const OrderStatusPanelInner = ({
  initialStatus,
  id,
}: {
  initialStatus: OrderStatus;
  id: string;
}) => {
  const t = useTranslations("admin.orderStatus");

  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  const nextOptions = ORDER_STATUS_FLOW[status];

  const handleClick = async (nextStatus: OrderStatus) => {
    setPending(nextStatus);
    try {
      await postJson(`orders/${id}/status`, { status: nextStatus });
      setStatus(nextStatus);
      toast.success(t("updateSuccess"), {
        description: t(`values.${nextStatus}`),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("updateError");
      toast.error(t("updateError"), { description: message });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="order-status-vars flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3
          className="font-semibold text-gray-500"
          style={{ marginInlineEnd: 6 }}
        >
          {t("title")}
        </h3>
        <OrderStatusChip status={status} />
      </div>
      <Divider />
      {nextOptions.length > 0 && (
        <div>
          <h3 className="mb-2">{t("statusUpdate")}</h3>
          <div className="flex flex-wrap gap-2">
            {nextOptions.map((nextStatus) => (
              <button
                type="button"
                key={nextStatus}
                disabled={pending !== null}
                onClick={() => handleClick(nextStatus)}
                className={cn(
                  "border-none bg-transparent p-0 transition-opacity",
                  pending ? "cursor-default" : "cursor-pointer",
                  pending && pending !== nextStatus
                    ? "opacity-50"
                    : "opacity-100",
                )}
              >
                <OrderStatusChip status={nextStatus} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrderView = withProviders(OrderViewInner);
