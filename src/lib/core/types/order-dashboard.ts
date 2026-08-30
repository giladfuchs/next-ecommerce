export type DashboardOrderStatus =
  "new" | "ready" | "done" | "canceled" | "refunded";

export type OrderDashboardData = {
  range: {
    from: string;
    to: string;
  };
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    periodRevenue: number;
    periodOrders: number;
    revenueChange: number;
    ordersChange: number;
  };
  chart: Array<{
    label: string;
    revenue: number;
    orders: number;
  }>;
  recentOrders: Array<{
    id: number;
    name: string;
    email: string;
    amount: number;
    status: DashboardOrderStatus;
    createdAt: string;
  }>;
};
