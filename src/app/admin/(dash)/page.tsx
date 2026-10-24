import Link from "next/link";
import { AutoRefresh } from "@/components/admin/auto-refresh";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { BAKERY_TZ, repo } from "@/lib/db";
import { flavorLabel, itemLine } from "@/lib/order-text";
import { bakeTotals, formatMoney } from "@/lib/pricing";
import { addDays, formatBakeDate, formatDayMonth, formatWeekday, formatWindow, openBakeDays, todayIn } from "@/lib/schedule";
import type { Order, OrderStatus } from "@/lib/types";
import { setOrderStatus } from "../actions";

export const metadata = { title: "Orders" };

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-terracotta text-white" },
  confirmed: { label: "Confirmed", cls: "bg-cobalt-soft text-cobalt" },
  ready: { label: "Ready", cls: "bg-marigold text-cocoa" },
  picked_up: { label: "Picked up", cls: "bg-leaf/15 text-leaf" },
  cancelled: { label: "Cancelled", cls: "bg-cocoa/10 text-cocoa-soft line-through" },
};

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  new: { to: "confirmed", label: "Confirm order" },
  confirmed: { to: "ready", label: "Mark ready" },
  ready: { to: "picked_up", label: "Picked up" },
  picked_up: { to: "ready", label: "Undo pickup" },
  cancelled: { to: "new", label: "Restore order" },
};

export default async function OrdersPage({ searchParams }: PageProps<"/admin">) {
  const { day } = await searchParams;
  const today = todayIn(BAKERY_TZ);
  const [orders, products, settings] = await Promise.all([
    repo.listOrders({ from: addDays(today, -14), to: addDays(today, 120) }),
    repo.getProducts(),
    repo.getSettings(),
  ]);

  const upcoming = [...new Set([...orders.map((o) => o.bake_date).filter((d) => d >= today), ...openBakeDays(settings, BAKERY_TZ).map((d) => d.date)])].sort();
  const past = [...new Set(orders.map((o) => o.bake_date).filter((d) => d < today))].sort().reverse();
  const countFor = (d: string) => orders.filter((o) => o.bake_date === d && o.status !== "cancelled").length;
  const newFor = (d: string) => orders.some((o) => o.bake_date === d && o.status === "new");

  const selected =
    typeof day === "string" && (upcoming.includes(day) || past.includes(day))
      ? day
      : (upcoming.find((d) => countFor(d) > 0) ?? upcoming[0] ?? past[0]);

  const dayOrders = orders.filter((o) => o.bake_date === selected);
  const live = dayOrders.filter((o) => o.status !== "cancelled");
  const totals = bakeTotals(live.flatMap((o) => o.items));
  const pieces = totals.reduce((n, t) => n + t.pieces, 0);
  const expected = live.reduce((s, o) => s + o.subtotal_cents, 0);
  const newCount = orders.filter((o) => o.status === "new" && o.bake_date >= today).length;
  const windows = [...new Set([...settings.pickupWindows, ...dayOrders.map((o) => o.pickup_window)])].sort();

  return (
    <div>
      <AutoRefresh newCount={newCount} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl">Orders</h1>
        <p className="flex items-center gap-2 text-sm text-cocoa-soft">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-leaf opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-leaf" />
          </span>
          New orders appear automatically
        </p>
      </div>

      {/* Day picker */}
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2">
        {upcoming.map((d) => (
          <DayChip key={d} date={d} count={countFor(d)} hasNew={newFor(d)} on={d === selected} today={d === today} />
        ))}
        {past.length > 0 && <span className="mx-1 w-px shrink-0 bg-line" />}
        {past.slice(0, 6).map((d) => (
          <DayChip key={d} date={d} count={countFor(d)} hasNew={newFor(d)} on={d === selected} past />
        ))}
      </div>

      {!selected ? (
        <Empty text="No bake days coming up. Add bake days in Settings." />
      ) : (
        <>
          <h2 className="mt-6 text-3xl">{formatBakeDate(selected, "en", "long")}</h2>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Orders" value={String(live.length)} sub={`of ${settings.maxOrdersPerDay} max`} />
            <Stat label="Pieces to bake" value={String(pieces)} />
            <Stat label="Expected" value={formatMoney(expected)} />
          </div>

          {/* Bake list */}
          <section className="mt-6 rounded-[1.5rem] bg-paper p-5 shadow-card sm:p-6">
            <h3 className="text-2xl">Bake list</h3>
            {totals.length === 0 ? (
              <p className="mt-2 text-cocoa-soft">Nothing to bake yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {totals.map((t) => {
                  const p = products.find((x) => x.id === t.id);
                  return (
                    <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <span className="font-bold">{p?.name_en ?? t.name}</span>
                      <span className="flex flex-wrap items-center gap-2">
                        {Object.entries(t.flavors).map(([f, n]) => (
                          <span key={f} className="rounded-full bg-cream-deep px-2.5 py-1 text-sm">
                            {n} {flavorLabel(f, p?.flavors ?? [], "en")}
                          </span>
                        ))}
                        <span className="display min-w-12 text-right text-2xl text-cobalt">{t.pieces}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Orders by pickup window */}
          {dayOrders.length === 0 ? (
            <Empty text="No orders for this day yet." />
          ) : (
            windows.map((w) => {
              const list = dayOrders.filter((o) => o.pickup_window === w);
              if (list.length === 0) return null;
              return (
                <section key={w} className="mt-8">
                  <h3 className="text-sm font-extrabold tracking-[0.14em] text-terracotta uppercase">
                    Pickup {formatWindow(w, "en")} · {list.filter((o) => o.status !== "cancelled").length}
                  </h3>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    {list.map((o) => (
                      <OrderCard key={o.id} order={o} products={products} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

function DayChip({
  date,
  count,
  hasNew,
  on,
  today,
  past,
}: {
  date: string;
  count: number;
  hasNew: boolean;
  on: boolean;
  today?: boolean;
  past?: boolean;
}) {
  return (
    <Link
      href={`/admin?day=${date}`}
      className={`relative shrink-0 rounded-2xl border-2 px-4 py-2.5 text-left transition ${
        on ? "border-cobalt bg-cobalt text-cream" : "border-line bg-paper hover:border-cobalt/40"
      } ${past && !on ? "opacity-60" : ""}`}
    >
      {hasNew && <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-cream bg-terracotta" />}
      <span className="block text-xs font-bold opacity-75">{today ? "Today" : formatWeekday(date, "en").slice(0, 3)}</span>
      <span className="block font-bold whitespace-nowrap">
        {formatDayMonth(date, "en")} <span className="opacity-70">· {count}</span>
      </span>
    </Link>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[1.25rem] bg-paper p-4 shadow-card">
      <p className="text-xs font-bold text-cocoa-soft">{label}</p>
      <p className="display mt-1 text-3xl">{value}</p>
      {sub && <p className="text-xs text-cocoa-soft">{sub}</p>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mt-8 rounded-[1.5rem] border-2 border-dashed border-line p-8 text-center text-cocoa-soft">{text}</p>;
}

function OrderCard({ order: o, products }: { order: Order; products: Parameters<typeof itemLine>[1] }) {
  const s = STATUS[o.status];
  const next = NEXT[o.status];
  const digits = o.phone.replace(/[^\d+]/g, "");
  return (
    <article
      className={`rounded-[1.5rem] bg-paper p-5 shadow-card ${o.status === "new" ? "ring-2 ring-terracotta" : ""} ${
        o.status === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xl font-bold">{o.customer_name}</p>
          <p className="text-sm text-cocoa-soft">
            {o.code} · placed {new Date(o.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: BAKERY_TZ })}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold uppercase ${s.cls}`}>{s.label}</span>
      </div>

      <ul className="mt-3 space-y-1">
        {o.items.map((it, i) => (
          <li key={i} className="font-medium">
            {itemLine(it, products, "en")}
          </li>
        ))}
      </ul>
      {o.notes && <p className="mt-3 rounded-xl bg-marigold-soft px-3 py-2 text-sm">“{o.notes}”</p>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <span className="display text-2xl">{formatMoney(o.subtotal_cents)}</span>
        <span className="flex gap-1.5">
          <a href={`tel:${digits}`} className="rounded-full bg-cream-deep px-3 py-1.5 text-sm font-bold hover:bg-line">
            Call
          </a>
          <a href={`sms:${digits}`} className="rounded-full bg-cream-deep px-3 py-1.5 text-sm font-bold hover:bg-line">
            Text
          </a>
        </span>
      </div>
      <p className="mt-1 text-sm text-cocoa-soft">
        {o.phone}
        {o.email ? ` · ${o.email}` : ""}
      </p>

      <form action={setOrderStatus} className="mt-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={o.id} />
        {next && (
          <button
            name="status"
            value={next.to}
            className={`btn flex-1 !py-3 ${o.status === "picked_up" || o.status === "cancelled" ? "btn-outline text-cobalt" : "btn-cobalt"}`}
          >
            {next.label}
          </button>
        )}
        {o.status !== "cancelled" && o.status !== "picked_up" && (
          <ConfirmButton
            name="status"
            value="cancelled"
            message={`Cancel ${o.customer_name}'s order ${o.code}?`}
            className="rounded-full px-3 py-2 text-sm font-semibold text-terracotta-dark hover:bg-rosa-soft"
          >
            Cancel
          </ConfirmButton>
        )}
      </form>
    </article>
  );
}
