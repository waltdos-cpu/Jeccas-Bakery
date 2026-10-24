import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { repo } from "@/lib/db";
import { DICT, paymentNote } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { formatBakeDate, formatCutoff, formatDayMonth, formatWeekday, formatWindow } from "@/lib/schedule";
import { getOpenDays } from "@/lib/storefront";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function OrderPage() {
  const [lang, settings, days] = await Promise.all([getLang(), repo.getSettings(), getOpenDays()]);
  const t = DICT[lang];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-5xl sm:text-6xl">{t.checkout.title}</h1>
      <CheckoutForm
        days={days.map((d) => ({
          date: d.date,
          weekday: formatWeekday(d.date, lang),
          label: formatDayMonth(d.date, lang),
          longLabel: formatBakeDate(d.date, lang, "long"),
          orderBy: formatCutoff(d.cutoff, lang),
          remaining: d.remaining,
        }))}
        windows={settings.pickupWindows.map((w) => ({ value: w, label: formatWindow(w, lang) }))}
        paymentNote={paymentNote(settings, lang)}
      />
    </div>
  );
}
