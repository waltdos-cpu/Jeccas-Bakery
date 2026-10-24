import "server-only";
import { Resend } from "resend";
import { BRAND, paymentNote } from "./i18n";
import { itemLine } from "./order-text";
import { formatMoney } from "./pricing";
import { formatBakeDate, formatWindow } from "./schedule";
import type { CustomRequest, Order, Product, Settings } from "./types";

// Email is best-effort: a failed email never fails an order. Without
// RESEND_API_KEY, emails are logged to the server console instead.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email skipped: no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return;
  }
  try {
    const { error } = await new Resend(key).emails.send({
      from: process.env.EMAIL_FROM || `${BRAND} <onboarding@resend.dev>`,
      to,
      subject,
      html,
    });
    if (error) console.error("[email failed]", subject, error);
  } catch (e) {
    console.error("[email failed]", subject, e);
  }
}

function wrap(body: string) {
  return `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;color:#3b2418;line-height:1.5">
<h2 style="color:#b5532a;margin:0 0 12px">${BRAND}</h2>${body}</div>`;
}

function itemsHtml(order: Order, products: Product[]) {
  const rows = order.items
    .map(
      (it) =>
        `<tr><td style="padding:4px 0">${esc(itemLine(it, products, order.lang))}</td>` +
        `<td style="text-align:right">${formatMoney(it.line_total_cents)}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding-top:8px;border-top:1px solid #e6d9c8"><b>Total</b></td>
<td style="text-align:right;padding-top:8px;border-top:1px solid #e6d9c8"><b>${formatMoney(order.subtotal_cents)}</b></td></tr></table>`;
}

function ownerEmail(settings: Settings) {
  return settings.ownerEmail || process.env.OWNER_EMAIL || "";
}

export async function sendOrderEmails(order: Order, products: Product[], settings: Settings) {
  const when = `${formatBakeDate(order.bake_date, "en", "long")}, ${formatWindow(order.pickup_window, "en")}`;
  const owner = ownerEmail(settings);
  const jobs: Promise<void>[] = [];
  if (owner) {
    jobs.push(
      send(
        owner,
        `New order ${order.code}: ${order.customer_name}, ${formatBakeDate(order.bake_date, "en")}`,
        wrap(`<p><b>${esc(order.customer_name)}</b> · ${esc(order.phone)}${order.email ? ` · ${esc(order.email)}` : ""}</p>
<p>Pickup: <b>${when}</b></p>${itemsHtml(order, products)}
${order.notes ? `<p><i>Notes:</i> ${esc(order.notes)}</p>` : ""}
<p><a href="${siteUrl()}/admin">Open the dashboard</a></p>`),
      ),
    );
  }
  if (order.email) {
    const es = order.lang === "es";
    const whenL = `${formatBakeDate(order.bake_date, order.lang, "long")}, ${formatWindow(order.pickup_window, order.lang)}`;
    jobs.push(
      send(
        order.email,
        es ? `Recibimos tu pedido ${order.code}` : `We got your order ${order.code}`,
        wrap(`<p>${es ? "¡Gracias" : "Thank you"}, ${esc(order.customer_name)}!</p>
<p>${es ? "Para recoger" : "Pickup"}: <b>${whenL}</b></p>${itemsHtml(order, products)}
<p>${esc(paymentNote(settings, order.lang))}</p>
<p><a href="${siteUrl()}/order/${order.id}">${es ? "Ver tu pedido y la dirección para recoger" : "View your order and pickup details"}</a></p>`),
      ),
    );
  }
  await Promise.all(jobs);
}

export async function sendRequestEmail(r: Omit<CustomRequest, "id" | "created_at" | "status">, settings: Settings) {
  const owner = ownerEmail(settings);
  if (!owner) return;
  await send(
    owner,
    `Custom order request: ${r.name}`,
    wrap(`<p><b>${esc(r.name)}</b> · ${esc(r.phone)}${r.email ? ` · ${esc(r.email)}` : ""}</p>
${r.event_date ? `<p>Event date: <b>${formatBakeDate(r.event_date, "en", "long")}</b></p>` : ""}
${r.quantity ? `<p>Size: ${esc(r.quantity)}</p>` : ""}
<p style="white-space:pre-wrap">${esc(r.details)}</p>
<p><a href="${siteUrl()}/admin/requests">Open requests</a></p>`),
  );
}
