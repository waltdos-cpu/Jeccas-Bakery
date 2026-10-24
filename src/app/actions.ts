"use server";

import { after } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { BAKERY_TZ, placeOrderWithCode, repo } from "@/lib/db";
import { LANG_COOKIE } from "@/lib/lang";
import { sendOrderEmails, sendRequestEmail } from "@/lib/notify";
import { priceCart } from "@/lib/pricing";
import { isOpenBakeDay, parseISODate } from "@/lib/schedule";
import type { CartLine, Lang } from "@/lib/types";

const phone = z
  .string()
  .trim()
  .max(30)
  .refine((s) => s.replace(/\D/g, "").length >= 7, "phone");
const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((s) => s === "" || z.email().safeParse(s).success, "email");
const lang = z.enum(["en", "es"]).catch("en");

const OrderInput = z.object({
  lines: z.array(z.object({ productId: z.string(), packs: z.number(), flavors: z.record(z.string(), z.number()).optional() })),
  bake_date: z.string(),
  pickup_window: z.string(),
  name: z.string().trim().min(1).max(80),
  phone,
  email: optionalEmail,
  notes: z.string().trim().max(500),
  lang,
  website: z.string().max(0), // honeypot: real people leave it empty
});

export type OrderResult =
  | { ok: true; id: string }
  | { ok: false; error: "invalid"; fields: string[] }
  | { ok: false; error: "full" | "closed" | "unavailable" | "generic" };

export async function placeOrder(input: z.input<typeof OrderInput>): Promise<OrderResult> {
  const parsed = OrderInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid", fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))] };
  }
  const o = parsed.data;
  try {
    const [products, settings] = await Promise.all([repo.getProducts(), repo.getSettings()]);
    if (!settings.pickupWindows.includes(o.pickup_window)) return { ok: false, error: "invalid", fields: ["pickup_window"] };
    if (!parseISODate(o.bake_date) || !isOpenBakeDay(o.bake_date, settings, BAKERY_TZ)) {
      return { ok: false, error: "closed" };
    }
    const priced = priceCart(o.lines as CartLine[], products);
    if (!priced.ok) {
      return priced.error === "empty"
        ? { ok: false, error: "invalid", fields: ["lines"] }
        : { ok: false, error: "unavailable" };
    }

    const res = await placeOrderWithCode({
      bake_date: o.bake_date,
      pickup_window: o.pickup_window,
      customer_name: o.name,
      phone: o.phone,
      email: o.email || null,
      notes: o.notes || null,
      subtotal_cents: priced.subtotal_cents,
      lang: o.lang,
      items: priced.items,
    });
    if (!res.ok) return { ok: false, error: "full" };

    after(async () => {
      const order = await repo.getOrder(res.id);
      if (order) await sendOrderEmails(order, products, settings);
    });
    return { ok: true, id: res.id };
  } catch (e) {
    console.error("[placeOrder]", e);
    return { ok: false, error: "generic" };
  }
}

const RequestInput = z.object({
  name: z.string().trim().min(1).max(80),
  phone,
  email: optionalEmail,
  event_date: z
    .string()
    .trim()
    .refine((s) => s === "" || parseISODate(s) !== null, "date"),
  quantity: z.string().trim().max(120),
  details: z.string().trim().min(3).max(2000),
  lang,
  website: z.string().max(0),
});

export type FormResult = { ok: true } | { ok: false; fields?: string[] };

export async function submitRequest(input: z.input<typeof RequestInput>): Promise<FormResult> {
  const parsed = RequestInput.safeParse(input);
  if (!parsed.success) return { ok: false, fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))] };
  const r = parsed.data;
  try {
    const row = {
      name: r.name,
      phone: r.phone,
      email: r.email || null,
      event_date: r.event_date || null,
      quantity: r.quantity || null,
      details: r.details,
      lang: r.lang,
    };
    await repo.createRequest(row);
    const settings = await repo.getSettings();
    after(() => sendRequestEmail(row, settings));
    return { ok: true };
  } catch (e) {
    console.error("[submitRequest]", e);
    return { ok: false };
  }
}

export async function subscribe(contact: string, l: Lang, website = ""): Promise<FormResult> {
  const c = String(contact ?? "").trim().toLowerCase();
  const valid = c.length <= 120 && (z.email().safeParse(c).success || c.replace(/\D/g, "").length >= 7);
  if (!valid) return { ok: false, fields: ["contact"] };
  if (website) return { ok: true }; // honeypot
  try {
    await repo.addSubscriber(c, l === "es" ? "es" : "en");
    return { ok: true };
  } catch (e) {
    console.error("[subscribe]", e);
    return { ok: false };
  }
}

export async function setLang(l: Lang) {
  (await cookies()).set(LANG_COOKIE, l === "es" ? "es" : "en", { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
