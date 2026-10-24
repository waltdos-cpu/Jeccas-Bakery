import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS } from "../catalog";
import type { CustomRequest, Order, OrderItem, Product, Subscriber } from "../types";
import { DuplicateCodeError, type Repo } from "./types";

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data;
}

type OrderRow = Omit<Order, "items"> & { order_items: OrderItem[] };
const ORDER_SELECT =
  "id, code, created_at, status, bake_date, pickup_window, customer_name, phone, email, notes, subtotal_cents, lang, " +
  "order_items (product_id, name, packs, pack_size, flavors, unit_price_cents, line_total_cents)";

function toOrder({ order_items, ...o }: OrderRow): Order {
  return { ...o, items: order_items ?? [] };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const supabaseRepo: Repo = {
  async getProducts() {
    return check(await db().from("products").select("*").order("sort")) as Product[];
  },
  async updateProduct(id, patch) {
    check(await db().from("products").update(patch).eq("id", id));
  },
  async getSettings() {
    const row = check(await db().from("settings").select("data").eq("id", 1).maybeSingle());
    return { ...DEFAULT_SETTINGS, ...(row?.data ?? {}) };
  },
  async saveSettings(settings) {
    check(await db().from("settings").upsert({ id: 1, data: settings }));
  },

  async countOrdersByDate(dates) {
    const counts: Record<string, number> = Object.fromEntries(dates.map((x) => [x, 0]));
    if (dates.length === 0) return counts;
    const rows = check(
      await db().from("orders").select("bake_date").in("bake_date", dates).neq("status", "cancelled"),
    ) as { bake_date: string }[];
    for (const r of rows) counts[r.bake_date] = (counts[r.bake_date] ?? 0) + 1;
    return counts;
  },
  async placeOrder({ items, ...order }) {
    const res = await db().rpc("place_order", { p_order: order, p_items: items });
    if (res.error) {
      if (res.error.code === "23505") throw new DuplicateCodeError();
      throw new Error(`Supabase: ${res.error.message}`);
    }
    const data = res.data as { id?: string; error?: string };
    if (data.error === "full") return { ok: false, error: "full" };
    return { ok: true, id: data.id! };
  },
  async getOrder(id) {
    if (!UUID.test(id)) return null;
    const row = check(await db().from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle());
    return row ? toOrder(row as unknown as OrderRow) : null;
  },
  async listOrders({ from, to }) {
    const rows = check(
      await db()
        .from("orders")
        .select(ORDER_SELECT)
        .gte("bake_date", from)
        .lte("bake_date", to)
        .order("bake_date")
        .order("pickup_window")
        .order("created_at"),
    );
    return (rows as unknown as OrderRow[]).map(toOrder);
  },
  async updateOrderStatus(id, status) {
    check(await db().from("orders").update({ status }).eq("id", id));
  },

  async createRequest(r) {
    check(await db().from("custom_requests").insert(r));
  },
  async listRequests() {
    return (check(await db().from("custom_requests").select("*").order("created_at", { ascending: false })) ??
      []) as CustomRequest[];
  },
  async updateRequestStatus(id, status) {
    check(await db().from("custom_requests").update({ status }).eq("id", id));
  },

  async addSubscriber(contact, lang) {
    check(await db().from("subscribers").upsert({ contact, lang }, { onConflict: "contact", ignoreDuplicates: true }));
  },
  async listSubscribers() {
    return (check(await db().from("subscribers").select("*").order("created_at", { ascending: false })) ??
      []) as Subscriber[];
  },
};
