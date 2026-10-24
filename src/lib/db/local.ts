import "server-only";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS, SEED_PRODUCTS } from "../catalog";
import type { CustomRequest, Order, Product, Settings, Subscriber } from "../types";
import { DuplicateCodeError, type Repo } from "./types";

// Development-only store: a JSON file in .data/. Every operation reads and
// writes synchronously, so within one Node process each call is atomic.

type Data = {
  products: Product[];
  settings: Settings;
  orders: Order[];
  requests: CustomRequest[];
  subscribers: Subscriber[];
};

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "db.json");

function load(): Data {
  if (!existsSync(FILE)) {
    const seed: Data = {
      products: structuredClone(SEED_PRODUCTS),
      settings: structuredClone(DEFAULT_SETTINGS),
      orders: [],
      requests: [],
      subscribers: [],
    };
    save(seed);
    return seed;
  }
  const data = JSON.parse(readFileSync(FILE, "utf8")) as Data;
  data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
  return data;
}

function save(data: Data) {
  mkdirSync(DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, FILE);
}

function update<T>(fn: (d: Data) => T): T {
  const d = load();
  const out = fn(d);
  save(d);
  return out;
}

export const localRepo: Repo = {
  async getProducts() {
    return load().products.sort((a, b) => a.sort - b.sort);
  },
  async updateProduct(id, patch) {
    update((d) => {
      const p = d.products.find((x) => x.id === id);
      if (p) Object.assign(p, patch);
    });
  },
  async getSettings() {
    return load().settings;
  },
  async saveSettings(settings) {
    update((d) => {
      d.settings = settings;
    });
  },

  async countOrdersByDate(dates) {
    const counts: Record<string, number> = Object.fromEntries(dates.map((x) => [x, 0]));
    for (const o of load().orders) {
      if (o.status !== "cancelled" && o.bake_date in counts) counts[o.bake_date]++;
    }
    return counts;
  },
  async placeOrder(order) {
    return update((d) => {
      if (d.orders.some((o) => o.code === order.code)) throw new DuplicateCodeError();
      const taken = d.orders.filter((o) => o.bake_date === order.bake_date && o.status !== "cancelled").length;
      if (taken >= d.settings.maxOrdersPerDay) return { ok: false as const, error: "full" as const };
      const id = randomUUID();
      d.orders.push({ ...order, id, created_at: new Date().toISOString(), status: "new" });
      return { ok: true as const, id };
    });
  },
  async getOrder(id) {
    return load().orders.find((o) => o.id === id) ?? null;
  },
  async listOrders({ from, to }) {
    return load()
      .orders.filter((o) => o.bake_date >= from && o.bake_date <= to)
      .sort(
        (a, b) =>
          a.bake_date.localeCompare(b.bake_date) ||
          a.pickup_window.localeCompare(b.pickup_window) ||
          a.created_at.localeCompare(b.created_at),
      );
  },
  async updateOrderStatus(id, status) {
    update((d) => {
      const o = d.orders.find((x) => x.id === id);
      if (o) o.status = status;
    });
  },

  async createRequest(r) {
    update((d) => {
      d.requests.push({ ...r, id: randomUUID(), created_at: new Date().toISOString(), status: "new" });
    });
  },
  async listRequests() {
    return load().requests.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async updateRequestStatus(id, status) {
    update((d) => {
      const r = d.requests.find((x) => x.id === id);
      if (r) r.status = status;
    });
  },

  async addSubscriber(contact, lang) {
    update((d) => {
      if (!d.subscribers.some((s) => s.contact === contact)) {
        d.subscribers.push({ id: randomUUID(), created_at: new Date().toISOString(), contact, lang });
      }
    });
  },
  async listSubscribers() {
    return load().subscribers.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
};
