import type {
  DashboardOrderStatus,
  OrderDashboardData,
} from "@/lib/core/types/order-dashboard";
import type { Order } from "@/payload-types";
import type { PayloadRequest } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";
import appConfig from "@/lib/core/config";

const DAY_MS = 24 * 60 * 60 * 1000;
const NON_REVENUE_STATUSES = new Set(["canceled", "refunded"]);

type DashboardOrder = Pick<
  Order,
  "id" | "name" | "email" | "amount" | "status" | "createdAt"
>;

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const parseDateBoundary = (value: string | null, boundary: "start" | "end") => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(
    `${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`,
  );

  return Number.isNaN(date.getTime()) ? null : date;
};

const getRevenue = (orders: DashboardOrder[]) =>
  Number(
    orders
      .reduce(
        (total, order) =>
          NON_REVENUE_STATUSES.has(order.status ?? "")
            ? total
            : total + Number(order.amount ?? 0),
        0,
      )
      .toFixed(2),
  );

const getChange = (current: number, previous: number) => {
  if (!previous) return current ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const getBucketKey = (date: Date, monthly: boolean) =>
  monthly
    ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    : toInputDate(date);

const buildChart = (
  orders: DashboardOrder[],
  from: Date,
  to: Date,
): OrderDashboardData["chart"] => {
  const days = Math.ceil((to.getTime() - from.getTime()) / DAY_MS) + 1;
  const monthly = days > 62;
  const labelFormatter = new Intl.DateTimeFormat(appConfig.LOCAL.locale, {
    ...(monthly
      ? { month: "short", year: "2-digit" }
      : { day: "2-digit", month: "2-digit" }),
    timeZone: "UTC",
  });

  const buckets = new Map<
    string,
    { label: string; revenue: number; orders: number }
  >();
  const cursor = new Date(from);

  if (monthly) cursor.setUTCDate(1);

  while (cursor <= to) {
    buckets.set(getBucketKey(cursor, monthly), {
      label: labelFormatter.format(cursor),
      revenue: 0,
      orders: 0,
    });

    if (monthly) cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    else cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  for (const order of orders) {
    const bucket = buckets.get(
      getBucketKey(new Date(order.createdAt), monthly),
    );
    if (!bucket) continue;

    bucket.orders += 1;
    if (!NON_REVENUE_STATUSES.has(order.status ?? "")) {
      bucket.revenue += Number(order.amount ?? 0);
    }
  }

  return [...buckets.values()].map((bucket) => ({
    ...bucket,
    revenue: Number(bucket.revenue.toFixed(2)),
  }));
};

export const getOrderDashboard = async (req: PayloadRequest) => {
  if (req.method !== "GET") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  if (!isAdmin({ req })) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
  defaultFrom.setUTCHours(0, 0, 0, 0);

  const from =
    parseDateBoundary(req.searchParams.get("from"), "start") ?? defaultFrom;
  const to = parseDateBoundary(req.searchParams.get("to"), "end") ?? now;

  if (from > to) {
    return Response.json(
      { message: "The start date must be before the end date" },
      { status: 400 },
    );
  }

  const { docs } = await req.payload.find({
    collection: "orders",
    depth: 0,
    pagination: false,
    req,
    sort: "-createdAt",
    select: {
      name: true,
      email: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  });
  const orders = docs as DashboardOrder[];
  const fromTime = from.getTime();
  const toTime = to.getTime();
  const periodOrders = orders.filter((order) => {
    const createdAt = new Date(order.createdAt).getTime();
    return createdAt >= fromTime && createdAt <= toTime;
  });

  const periodDuration = toTime - fromTime + 1;
  const previousTo = fromTime - 1;
  const previousFrom = previousTo - periodDuration + 1;
  const previousOrders = orders.filter((order) => {
    const createdAt = new Date(order.createdAt).getTime();
    return createdAt >= previousFrom && createdAt <= previousTo;
  });

  const periodRevenue = getRevenue(periodOrders);
  const previousRevenue = getRevenue(previousOrders);

  const data: OrderDashboardData = {
    range: {
      from: toInputDate(from),
      to: toInputDate(to),
    },
    metrics: {
      totalRevenue: getRevenue(orders),
      totalOrders: orders.length,
      periodRevenue,
      periodOrders: periodOrders.length,
      revenueChange: getChange(periodRevenue, previousRevenue),
      ordersChange: getChange(periodOrders.length, previousOrders.length),
    },
    chart: buildChart(periodOrders, from, to),
    recentOrders: orders.map((order) => ({
      id: order.id,
      name: order.name,
      email: order.email,
      amount: Number(order.amount ?? 0),
      status: (order.status ?? "new") as DashboardOrderStatus,
      createdAt: order.createdAt,
    })),
  };

  return Response.json(data);
};
