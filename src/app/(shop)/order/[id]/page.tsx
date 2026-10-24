import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Starburst } from "@/components/decor";
import { CalendarIcon } from "@/components/icons";
import { repo } from "@/lib/db";
import { DICT, paymentNote, productName } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { itemLine } from "@/lib/order-text";
import { formatMoney } from "@/lib/pricing";
import { formatBakeDate, formatWindow } from "@/lib/schedule";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderConfirmation({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const [lang, order, products, settings] = await Promise.all([getLang(), repo.getOrder(id), repo.getProducts(), repo.getSettings()]);
  if (!order) notFound();
  const t = DICT[lang];
  const c = t.confirm;
  const cancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-16">
      <div className="tile-lines relative overflow-hidden rounded-[2.5rem] bg-cobalt px-7 pt-10 pb-12 text-cream sm:px-12">
        <Starburst className="absolute -top-3 -right-3 rotate-12 sm:top-6 sm:right-8" size={120}>
          <span className="block text-[0.65rem] font-extrabold tracking-wider uppercase">{c.code}</span>
          <span className="display mt-1 block text-lg">{order.code}</span>
        </Starburst>
        <p className="inline-block rounded-full bg-cream/15 px-3 py-1 text-sm font-bold">{c.status[order.status]}</p>
        <h1 className="mt-5 max-w-md pr-24 text-5xl sm:pr-0 sm:text-6xl">{c.title(order.customer_name.split(" ")[0])}</h1>
        {!cancelled && <p className="mt-4 max-w-md text-lg text-cream/85">{c.sub}</p>}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-[2rem] bg-paper p-6 shadow-card">
          <p className="flex items-center gap-2 text-sm font-extrabold tracking-[0.14em] text-terracotta uppercase">
            <CalendarIcon /> {c.pickup}
          </p>
          <p className="display mt-3 text-3xl">{formatBakeDate(order.bake_date, lang, "long")}</p>
          <p className="mt-1 text-lg font-semibold text-cobalt">{formatWindow(order.pickup_window, lang)}</p>
        </div>
        <div className="rounded-[2rem] bg-paper p-6 shadow-card">
          <p className="text-sm font-extrabold tracking-[0.14em] text-terracotta uppercase">{c.where}</p>
          {settings.pickupAddress ? (
            <p className="mt-3 text-lg font-semibold whitespace-pre-line">{settings.pickupAddress}</p>
          ) : (
            <p className="mt-3 text-cocoa-soft">{c.whereLater}</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] bg-paper p-6 shadow-card sm:p-8">
        <ul className="space-y-4">
          {order.items.map((it, i) => {
            const p = products.find((x) => x.id === it.product_id);
            return (
              <li key={i} className="flex items-center gap-4">
                {p && (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={p.image} alt={productName(p, lang)} fill sizes="64px" className="object-cover" />
                  </div>
                )}
                <p className="flex-1 font-semibold">{itemLine(it, products, lang)}</p>
                <p className="font-semibold tabular-nums">{formatMoney(it.line_total_cents)}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex items-baseline justify-between border-t-2 border-dashed border-line pt-4">
          <span className="font-bold">{t.checkout.total}</span>
          <span className="display text-3xl text-cobalt">{formatMoney(order.subtotal_cents)}</span>
        </div>
        <p className="mt-4 rounded-2xl bg-marigold-soft p-4 text-sm text-cocoa-soft">{paymentNote(settings, lang)}</p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        <Link href="/" className="font-bold text-cobalt underline underline-offset-4">
          {c.back}
        </Link>
      </div>
    </div>
  );
}
