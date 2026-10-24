import type { CartLine, OrderItem, Product } from "./types";

export const MAX_PACKS_PER_LINE = 24;
export const MAX_LINES = 30;

export type PricedCart =
  | { ok: true; items: OrderItem[]; subtotal_cents: number }
  | { ok: false; error: "empty" | "too_many" | "unavailable" | "bad_quantity" | "bad_flavors"; productId?: string };

/**
 * Validate a cart against the live menu and price it on the server.
 * Client-sent prices are never used.
 */
export function priceCart(lines: CartLine[], products: Product[]): PricedCart {
  if (!Array.isArray(lines) || lines.length === 0) return { ok: false, error: "empty" };
  if (lines.length > MAX_LINES) return { ok: false, error: "too_many" };
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  let subtotal = 0;

  for (const line of lines) {
    const p = byId.get(line?.productId);
    if (!p || !p.active || p.sold_out || p.price_cents <= 0) {
      return { ok: false, error: "unavailable", productId: line?.productId };
    }
    const packs = line.packs;
    if (!Number.isInteger(packs) || packs < 1 || packs > MAX_PACKS_PER_LINE) {
      return { ok: false, error: "bad_quantity", productId: p.id };
    }
    let flavors: Record<string, number> | null = null;
    if (p.flavors.length > 0) {
      const allowed = new Set(p.flavors.map((f) => f.id));
      const entries = Object.entries(line.flavors ?? {}).filter(([, n]) => n !== 0);
      const sum = entries.reduce((s, [, n]) => s + n, 0);
      const valid =
        entries.length > 0 &&
        entries.every(([id, n]) => allowed.has(id) && Number.isInteger(n) && n > 0) &&
        sum === p.pack_size;
      if (!valid) return { ok: false, error: "bad_flavors", productId: p.id };
      // store in menu order so identical packs compare equal
      flavors = Object.fromEntries(
        p.flavors.filter((f) => entries.some(([id]) => id === f.id)).map((f) => [f.id, line.flavors![f.id]]),
      );
    }
    const line_total_cents = packs * p.price_cents;
    subtotal += line_total_cents;
    items.push({
      product_id: p.id,
      name: p.name_en,
      packs,
      pack_size: p.pack_size,
      flavors,
      unit_price_cents: p.price_cents,
      line_total_cents,
    });
  }
  return { ok: true, items, subtotal_cents: subtotal };
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Stable key for a cart line: same product + same flavor mix = same line. */
export function lineKey(line: CartLine): string {
  const f = line.flavors
    ? Object.entries(line.flavors)
        .filter(([, n]) => n > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, n]) => `${id}:${n}`)
        .join(",")
    : "";
  return `${line.productId}|${f}`;
}

/** Bake list: total pieces per product (and per flavor) across orders. */
export function bakeTotals(items: OrderItem[]) {
  const totals = new Map<string, { name: string; pieces: number; flavors: Record<string, number> }>();
  for (const it of items) {
    const t = totals.get(it.product_id) ?? { name: it.name, pieces: 0, flavors: {} };
    t.pieces += it.packs * it.pack_size;
    if (it.flavors) {
      for (const [f, n] of Object.entries(it.flavors)) t.flavors[f] = (t.flavors[f] ?? 0) + n * it.packs;
    }
    totals.set(it.product_id, t);
  }
  return [...totals.entries()].map(([id, t]) => ({ id, ...t }));
}
