"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarCheck,
  FaChartLine,
  FaShoppingBag,
  FaWallet,
} from "react-icons/fa";

import type { OrderDashboardData } from "@/lib/core/types/order-dashboard";
import type { ApexOptions } from "apexcharts";
import type { ReactNode } from "react";

import { withProviders } from "@/components/admin";
import appConfig from "@/lib/core/config";

import "./order-dashboard.scss";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type DateRange = {
  from: string;
  to: string;
};

const quickLinks = [
  { href: "/admin/collections/products", label: "productsLink" },
  { href: "/admin/collections/carts", label: "cartsLink" },
  { href: "/admin/collections/pages", label: "pagesLink" },
  { href: "/admin/collections/category", label: "categoriesLink" },
  { href: "/admin/globals/site-settings", label: "siteSettingsLink" },
  { href: "/admin/collections/media", label: "mediaLink" },
] as const;

const toInputDate = (date: Date) => {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60 * 1000,
  );
  return localDate.toISOString().slice(0, 10);
};

const getDefaultRange = (): DateRange => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);

  return { from: toInputDate(from), to: toInputDate(to) };
};

const MetricCard = ({
  change,
  icon,
  label,
  value,
}: {
  change?: number;
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <article className="order-dashboard__metric-card">
    <div className="order-dashboard__metric-icon">{icon}</div>
    <div className="order-dashboard__metric-content">
      <span>{label}</span>
      <strong>{value}</strong>
      {typeof change === "number" ? (
        <small data-negative={change < 0 || undefined}>
          {change > 0 ? "+" : ""}
          {change}%
        </small>
      ) : null}
    </div>
  </article>
);

const OrderDashboardInner = () => {
  const { currency, dir: direction, locale } = appConfig.LOCAL;
  const t = useTranslations("admin.dashboard");
  const tStatus = useTranslations("admin.orderStatus.values");
  const defaultRange = useMemo(getDefaultRange, []);
  const [draftRange, setDraftRange] = useState(defaultRange);
  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState<OrderDashboardData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 2,
      }),
    [currency, locale],
  );
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [locale],
  );

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(range);

    setLoading(true);
    setError(false);

    fetch(`/api/orders/dashboard?${params.toString()}`, {
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load dashboard");
        return (await response.json()) as OrderDashboardData;
      })
      .then(setData)
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [range]);

  const chartOptions = useMemo<ApexOptions>(
    () => ({
      chart: {
        background: "transparent",
        fontFamily: "inherit",
        toolbar: { show: true },
      },
      colors: ["#2563eb", "#14b8a6"],
      dataLabels: { enabled: false },
      fill: {
        opacity: [0.88, 1],
      },
      grid: {
        borderColor: "var(--theme-elevation-150)",
        strokeDashArray: 4,
      },
      labels: data?.chart.map((point) => point.label) ?? [],
      legend: {
        horizontalAlign: direction === "rtl" ? "right" : "left",
        labels: { colors: "var(--theme-text)" },
        position: "top",
      },
      markers: { size: 4 },
      stroke: {
        curve: "smooth",
        width: [0, 3],
      },
      tooltip: {
        shared: true,
        y: [
          { formatter: (value) => currencyFormatter.format(value) },
          { formatter: (value) => numberFormatter.format(value) },
        ],
      },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          rotate: -45,
          style: { colors: "var(--theme-elevation-600)" },
        },
      },
      yaxis: [
        {
          labels: {
            formatter: (value) =>
              new Intl.NumberFormat(locale, {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(value),
            style: { colors: "var(--theme-elevation-600)" },
          },
          title: { text: t("revenue") },
        },
        {
          opposite: true,
          labels: {
            formatter: (value) => numberFormatter.format(Math.round(value)),
            style: { colors: "var(--theme-elevation-600)" },
          },
          title: { text: t("orders") },
        },
      ],
    }),
    [currencyFormatter, data?.chart, direction, locale, numberFormatter, t],
  );

  const chartSeries = useMemo(
    () => [
      {
        name: t("revenue"),
        type: "column",
        data: data?.chart.map((point) => point.revenue) ?? [],
      },
      {
        name: t("orders"),
        type: "line",
        data: data?.chart.map((point) => point.orders) ?? [],
      },
    ],
    [data?.chart, t],
  );

  const applyRange = () => {
    if (!draftRange.from || !draftRange.to || draftRange.from > draftRange.to) {
      return;
    }
    setRange(draftRange);
  };

  const resetRange = () => {
    const nextRange = getDefaultRange();
    setDraftRange(nextRange);
    setRange(nextRange);
  };

  return (
    <main className="order-dashboard" dir={direction}>
      <header className="order-dashboard__header">
        <div>
          <p>{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <span>{t("description")}</span>
        </div>
        <div className="order-dashboard__header-actions">
          <Link
            href="/"
            className="order-dashboard__store-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("viewStore")}
          </Link>
          <Link
            href="/admin/collections/orders"
            className="order-dashboard__orders-link"
          >
            {t("allOrders")}
          </Link>
        </div>
      </header>

      <section
        className="order-dashboard__quick-links"
        aria-labelledby="dashboard-quick-access"
      >
        <h2 id="dashboard-quick-access">{t("quickAccess")}</h2>
        <nav aria-label={t("quickAccess")}>
          {quickLinks.map(({ href, label }) => (
            <Link key={href} href={href}>
              {t(label)}
            </Link>
          ))}
        </nav>
      </section>

      <section className="order-dashboard__filters" aria-label={t("dateRange")}>
        <label>
          <span>{t("from")}</span>
          <input
            type="date"
            value={draftRange.from}
            max={draftRange.to}
            onChange={(event) =>
              setDraftRange((current) => ({
                ...current,
                from: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span>{t("to")}</span>
          <input
            type="date"
            value={draftRange.to}
            min={draftRange.from}
            onChange={(event) =>
              setDraftRange((current) => ({
                ...current,
                to: event.target.value,
              }))
            }
          />
        </label>
        <button type="button" onClick={applyRange} disabled={loading}>
          {t("apply")}
        </button>
        <button
          type="button"
          className="order-dashboard__reset"
          onClick={resetRange}
          disabled={loading}
        >
          {t("reset")}
        </button>
      </section>

      {error ? (
        <div className="order-dashboard__state" role="alert">
          <strong>{t("errorTitle")}</strong>
          <span>{t("errorDescription")}</span>
        </div>
      ) : null}

      <section className="order-dashboard__metrics" aria-busy={loading}>
        <MetricCard
          label={t("totalRevenue")}
          value={
            data ? currencyFormatter.format(data.metrics.totalRevenue) : "—"
          }
          icon={<FaWallet />}
        />
        <MetricCard
          label={t("totalOrders")}
          value={data ? numberFormatter.format(data.metrics.totalOrders) : "—"}
          icon={<FaShoppingBag />}
        />
        <MetricCard
          label={t("periodRevenue")}
          value={
            data ? currencyFormatter.format(data.metrics.periodRevenue) : "—"
          }
          change={data?.metrics.revenueChange}
          icon={<FaChartLine />}
        />
        <MetricCard
          label={t("periodOrders")}
          value={data ? numberFormatter.format(data.metrics.periodOrders) : "—"}
          change={data?.metrics.ordersChange}
          icon={<FaCalendarCheck />}
        />
      </section>

      <section className="order-dashboard__content-grid">
        <article className="order-dashboard__panel order-dashboard__chart">
          <div className="order-dashboard__panel-heading">
            <div>
              <h2>{t("chartTitle")}</h2>
              <p>{t("chartDescription")}</p>
            </div>
          </div>
          {data?.chart.length ? (
            <ReactApexChart
              height={360}
              options={chartOptions}
              series={chartSeries}
              type="line"
            />
          ) : (
            <div className="order-dashboard__empty">{t("noData")}</div>
          )}
        </article>

        <article className="order-dashboard__panel order-dashboard__recent">
          <div className="order-dashboard__panel-heading">
            <div>
              <h2>{t("recentOrders")}</h2>
              <p>{t("recentDescription")}</p>
            </div>
          </div>
          {data?.recentOrders.length ? (
            <div className="order-dashboard__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t("customer")}</th>
                    <th>{t("date")}</th>
                    <th>{t("status")}</th>
                    <th>{t("amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/admin/collections/orders/${order.id}`}>
                          <strong>{order.name}</strong>
                          <span>{order.email}</span>
                        </Link>
                      </td>
                      <td>{dateFormatter.format(new Date(order.createdAt))}</td>
                      <td>
                        <span
                          className="order-dashboard__status"
                          data-status={order.status}
                        >
                          {tStatus(order.status)}
                        </span>
                      </td>
                      <td>{currencyFormatter.format(order.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="order-dashboard__empty">{t("noOrders")}</div>
          )}
        </article>
      </section>
    </main>
  );
};

export const OrderDashboard = withProviders(OrderDashboardInner);
