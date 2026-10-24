"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminConfigured, checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { repo } from "@/lib/db";
import { parseISODate } from "@/lib/schedule";
import type { OrderStatus, RequestStatus, Settings } from "@/lib/types";

// Server actions are public endpoints: every action except login checks the
// admin session first.

export async function login(formData: FormData) {
  if (!adminConfigured()) redirect("/admin/login?error=setup");
  const ok = checkPassword(String(formData.get("password") ?? ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    redirect("/admin/login?error=1");
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

const ORDER_STATUSES: OrderStatus[] = ["new", "confirmed", "ready", "picked_up", "cancelled"];

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!id || !ORDER_STATUSES.includes(status)) return;
  await repo.updateOrderStatus(id, status);
  refresh();
}

const REQUEST_STATUSES: RequestStatus[] = ["new", "quoted", "done", "declined"];

export async function setRequestStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as RequestStatus;
  if (!id || !REQUEST_STATUSES.includes(status)) return;
  await repo.updateRequestStatus(id, status);
  refresh();
}

export type SaveResult = { ok: boolean; message?: string } | null;

const ProductForm = z.object({
  name_en: z.string().trim().min(1).max(80),
  name_es: z.string().trim().min(1).max(80),
  description_en: z.string().trim().max(400),
  description_es: z.string().trim().max(400),
  price: z.coerce.number().min(0).max(1000),
  pack_size: z.coerce.number().int().min(1).max(48),
});

export async function saveProduct(id: string, _prev: SaveResult, formData: FormData): Promise<SaveResult> {
  await requireAdmin();
  const parsed = ProductForm.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the name and price." };
  const { price, ...rest } = parsed.data;
  const active = formData.get("active") === "on";
  const price_cents = Math.round(price * 100);
  if (active && price_cents <= 0) return { ok: false, message: "Set a price before showing this item." };
  await repo.updateProduct(id, { ...rest, price_cents, active, sold_out: formData.get("sold_out") === "on" });
  refresh();
  return { ok: true, message: "Saved" };
}

export async function toggleSoldOut(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await repo.updateProduct(id, { sold_out: formData.get("sold_out") === "true" });
  refresh();
}

const WINDOW = /^([01]?\d|2[0-3]):[0-5]\d-([01]?\d|2[0-3]):[0-5]\d$/;
const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

export async function saveSettings(_prev: SaveResult, formData: FormData): Promise<SaveResult> {
  await requireAdmin();
  const windows = lines(formData.get("pickupWindows")).map((w) => w.replace(/\s+/g, ""));
  const badWindow = windows.find((w) => !WINDOW.test(w));
  if (badWindow) return { ok: false, message: `Pickup window "${badWindow}" should look like 10:00-12:00` };
  if (windows.length === 0) return { ok: false, message: "Add at least one pickup window." };

  const blackout = lines(formData.get("blackoutDates"));
  const extra = lines(formData.get("extraDates"));
  const badDate = [...blackout, ...extra].find((d) => parseISODate(d) === null);
  if (badDate) return { ok: false, message: `Date "${badDate}" should look like 2026-12-24` };

  const num = (k: string, min: number, max: number) => {
    const n = Number(formData.get(k));
    return Number.isInteger(n) && n >= min && n <= max ? n : null;
  };
  const cutoffHours = num("cutoffHours", 0, 336);
  const daysAhead = num("daysAhead", 1, 90);
  const maxOrdersPerDay = num("maxOrdersPerDay", 0, 500);
  if (cutoffHours === null || daysAhead === null || maxOrdersPerDay === null) {
    return { ok: false, message: "Check the numbers: cutoff hours, days ahead, and orders per day." };
  }

  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim();
  if (ownerEmail && !z.email().safeParse(ownerEmail).success) return { ok: false, message: "That email doesn't look right." };

  const text = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max);
  const settings: Settings = {
    bakeWeekdays: formData
      .getAll("bakeWeekdays")
      .map(Number)
      .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6),
    cutoffHours,
    daysAhead,
    pickupWindows: windows,
    maxOrdersPerDay,
    blackoutDates: [...new Set(blackout)].sort(),
    extraDates: [...new Set(extra)].sort(),
    pickupArea: text("pickupArea", 120),
    pickupAddress: text("pickupAddress", 400),
    paymentNote: text("paymentNote", 200),
    paymentNoteEs: text("paymentNoteEs", 200),
    ownerEmail,
    announcement: text("announcement", 160),
    announcementEs: text("announcementEs", 160),
  };
  await repo.saveSettings(settings);
  refresh();
  return { ok: true, message: "Settings saved" };
}
