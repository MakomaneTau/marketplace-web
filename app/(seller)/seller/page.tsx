"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Circle,
  CircleCheck,
  Eye,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { ProtectedRequestError } from "@/components/auth/protected-request-error";
import { useUnreadMessages } from "@/components/messaging/unread-messages";
import { SectionHeading } from "@/components/seller/section-heading";
import { ShopSetupRequired } from "@/components/seller/shop-setup-required";
import { StatCard } from "@/components/seller/stat-card";
import { StatusBadge } from "@/components/seller/status-badge";
import { ApiClientError, apiErrorMessage, apiRequest } from "@/lib/api";
import { formatZAR } from "@/lib/format";

type Dashboard = {
  shop: { name: string };
  products: {
    total: number;
    active: number;
    views: number;
    low_stock: { id: string; title: string; stock_quantity: number }[];
  };
  orders: {
    total: number;
    open: number;
    recent: {
      id: string;
      status: string;
      total_amount: number | string;
      created_at: string;
    }[];
  };
  unread_notifications: number;
  unread_messages: number;
};

const setupSteps = [
  { label: "Complete your shop profile", href: "/seller/shop", key: "shop" },
  {
    label: "Add your first product",
    href: "/seller/products/new",
    key: "product",
  },
  {
    label: "Review account settings",
    href: "/seller/settings",
    key: "settings",
  },
];

export default function SellerDashboardPage() {
  const unreadMessages = useUnreadMessages();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsShopSetup, setNeedsShopSetup] = useState(false);

  useEffect(() => {
    apiRequest<Dashboard>("/seller/dashboard", { auth: true })
      .then(setData)
      .catch((requestError) => {
        if (
          requestError instanceof ApiClientError &&
          requestError.status === 403 &&
          requestError.code === "SELLER_SHOP_REQUIRED"
        ) {
          setNeedsShopSetup(true);
          return;
        }
        setError(apiErrorMessage(requestError));
      });
  }, []);

  if (needsShopSetup) return <ShopSetupRequired />;
  if (error) return <ProtectedRequestError message={error} />;
  if (!data) return <DashboardSkeleton />;

  const messageCount = unreadMessages ?? data.unread_messages;
  const completedSetup = data.products.total > 0 ? 2 : 1;

  return (
    <div className="space-y-6">
      {data.products.low_stock?.length > 0 && (
        <section className="rounded-card border border-border p-4">
          <h2 className="font-bold">Running low</h2>
          {data.products.low_stock.map((product) => (
            <p key={product.id} className="mt-2">
              <Link
                className="underline"
                href={`/seller/products/${product.id}/edit`}
              >
                {product.title}
              </Link>{" "}
              <span className="text-muted">
                : {product.stock_quantity} left
              </span>
            </p>
          ))}
        </section>
      )}
      <SectionHeading
        title={data.shop.name}
        description="A clear view of what needs your attention today."
        action={
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-action px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </Link>
        }
      />

      <section
        aria-label="Shop performance"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          href="/seller/products"
          label="Active listings"
          value={String(data.products.active)}
          helper={`${data.products.total} total`}
          icon={Package}
        />
        <StatCard
          href="/seller/orders"
          label="Open orders"
          value={String(data.orders.open)}
          helper={`${data.orders.total} total`}
          icon={ShoppingBag}
        />
        <StatCard
          href="/seller/analytics"
          label="Product views"
          value={String(data.products.views)}
          helper="Across active listings"
          icon={Eye}
        />
        <StatCard
          href="/seller/messages"
          label="Unread messages"
          value={String(messageCount)}
          helper={`${data.unread_notifications} notifications`}
          icon={MessageSquare}
        />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.75fr)]">
        <section className="overflow-hidden rounded-lg border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
            <h2 className="font-bold text-foreground">Recent orders</h2>
            <Link
              href="/seller/orders"
              className="flex items-center gap-1 text-sm font-semibold text-primary-text hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {data.orders.recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-surface-muted text-xs font-semibold text-muted">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.orders.recent.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-surface-muted"
                    >
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={formatStatus(order.status)} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-foreground">
                        {formatZAR(Number(order.total_amount))}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href="/seller/orders"
                          className="font-semibold text-primary-text hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <ShoppingBag
                className="mx-auto h-8 w-8 text-subtle"
                aria-hidden="true"
              />
              <p className="mt-3 font-semibold text-foreground">
                No orders yet
              </p>
              <p className="mt-1 text-sm text-muted">
                New orders will appear here as buyers check out.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-white">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-foreground">Store setup</h2>
              <span className="text-xs font-semibold text-muted">
                {completedSetup} of {setupSteps.length} complete
              </span>
            </div>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted"
              aria-hidden="true"
            >
              <div
                className="h-full bg-secondary"
                style={{
                  width: `${(completedSetup / setupSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="p-2">
            {setupSteps.map((step, index) => {
              const complete = index < completedSetup;
              return (
                <Link
                  key={step.key}
                  href={step.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition hover:bg-surface-muted hover:text-foreground"
                >
                  {complete ? (
                    <CircleCheck
                      className="h-5 w-5 shrink-0 text-secondary"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="h-5 w-5 shrink-0 text-subtle"
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-1">{step.label}</span>
                  <ArrowRight
                    className="h-4 w-4 text-subtle"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionPanel
          title="Inventory attention"
          description={
            data.products.active < data.products.total
              ? `${data.products.total - data.products.active} listings are not currently active.`
              : "All of your listings are active and visible."
          }
          href="/seller/products"
          action="Review products"
          icon={Package}
        />
        <ActionPanel
          title="Buyer messages"
          description={
            messageCount > 0
              ? `${messageCount} unread ${messageCount === 1 ? "message needs" : "messages need"} a response.`
              : "You are caught up with buyer conversations."
          }
          href="/seller/messages"
          action="Open inbox"
          icon={MessageSquare}
        />
      </div>
    </div>
  );
}

function ActionPanel({
  title,
  description,
  href,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: LucideIcon;
}) {
  return (
    <section className="flex items-center gap-4 rounded-lg border border-border bg-white p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-text">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <Link
        href={href}
        className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary-text hover:underline sm:flex"
      >
        {action} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-label="Loading seller dashboard"
      aria-busy="true"
    >
      <LoadingSplash compact label="Loading seller dashboard…" />
      <div className="animate-pulse motion-reduce:animate-none">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-slate-200" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse motion-reduce:animate-none rounded-lg bg-slate-200"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.75fr)]">
        <div className="h-80 animate-pulse motion-reduce:animate-none rounded-lg bg-slate-200" />
        <div className="h-80 animate-pulse motion-reduce:animate-none rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
