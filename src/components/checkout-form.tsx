"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder, type OrderResult } from "@/app/actions";
import { productName } from "@/lib/i18n";
import { formatMoney } from "@/lib/pricing";
import { lineDetail } from "./cart-drawer";
import { Mascot } from "./logo";
import { useShop } from "./providers";

type Day = { date: string; weekday: string; label: string; longLabel: string; orderBy: string; remaining: number };
type Window = { value: string; label: string };

export function CheckoutForm({ days, windows, paymentNote }: { days: Day[]; windows: Window[]; paymentNote: string }) {
  const { t, lang, lines, products, subtotal, clear, setDrawerOpen, ready } = useShop();
  const router = useRouter();
  const [pending, start] = useTransition();
  const firstOpen = days.find((d) => d.remaining > 0)?.date ?? "";
  const [date, setDate] = useState(firstOpen);
  const [win, setWin] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [bad, setBad] = useState<string[]>([]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const c = t.checkout;

  if (!ready) return <div className="mt-8 h-96 animate-pulse rounded-[2rem] bg-cream-deep" />;

  if (lines.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-5 rounded-[2rem] bg-paper px-6 py-16 text-center shadow-card">
        <Mascot className="h-20" />
        <p className="text-lg text-cocoa-soft">{t.cart.empty}</p>
        <Link href="/#menu" className="btn btn-cobalt">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setBad((b) => b.filter((x) => x !== k));
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const missing = [!date && "bake_date", !win && "pickup_window", !form.name.trim() && "name", !form.phone.trim() && "phone"].filter(
      Boolean,
    ) as string[];
    if (missing.length) {
      setBad(missing);
      setError(c.errors.invalid);
      return;
    }
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    setError(null);
    start(async () => {
      let res: OrderResult;
      try {
        res = await placeOrder({
          lines: lines.map(({ productId, packs, flavors }) => ({ productId, packs, flavors })),
          bake_date: date,
          pickup_window: win,
          ...form,
          lang,
          website,
        });
      } catch {
        res = { ok: false, error: "generic" };
      }
      if (res.ok) {
        clear();
        router.push(`/order/${res.id}`);
        return;
      }
      if (res.error === "invalid") setBad(res.fields);
      if (res.error === "full" || res.error === "closed") {
        setDate("");
        router.refresh();
      }
      setError(c.errors[res.error]);
    });
  };

  const invalid = (k: string) => bad.includes(k);

  return (
    <form onSubmit={submit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12" noValidate>
      <div className="min-w-0 space-y-8">
        {/* Day */}
        <Section n={1} title={c.day} invalid={invalid("bake_date")}>
          {days.length === 0 ? (
            <p className="text-cocoa-soft">{c.noDays}</p>
          ) : (
            <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pt-1 pb-3">
              {days.map((d) => {
                const full = d.remaining <= 0;
                const on = date === d.date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    disabled={full}
                    onClick={() => {
                      setDate(d.date);
                      setBad((b) => b.filter((x) => x !== "bake_date"));
                    }}
                    aria-pressed={on}
                    className={`min-w-36 shrink-0 snap-start rounded-[1.4rem] border-2 px-4 py-4 text-left transition ${
                      on
                        ? "border-cobalt bg-cobalt text-cream shadow-[4px_4px_0_var(--color-cocoa)]"
                        : "border-line bg-paper hover:border-cobalt/40"
                    } disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    <span className={`block text-xs font-extrabold tracking-[0.14em] uppercase ${on ? "text-marigold" : "text-terracotta"}`}>
                      {d.weekday}
                    </span>
                    <span className="display mt-1 block text-2xl">{d.label}</span>
                    <span className={`mt-2 block text-xs ${on ? "text-cream/80" : "text-cocoa-soft"}`}>
                      {full ? c.full : d.remaining <= 3 ? c.spotsLeft(d.remaining) : c.orderBy(d.orderBy)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        {/* Window */}
        <Section n={2} title={c.window} invalid={invalid("pickup_window")}>
          <div className="flex flex-wrap gap-2.5">
            {windows.map((w) => (
              <button
                key={w.value}
                type="button"
                aria-pressed={win === w.value}
                onClick={() => {
                  setWin(w.value);
                  setBad((b) => b.filter((x) => x !== "pickup_window"));
                }}
                className={`rounded-full border-2 px-5 py-3 font-bold transition ${
                  win === w.value ? "border-cobalt bg-cobalt text-cream" : "border-line bg-paper hover:border-cobalt/40"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Details */}
        <Section n={3} title={c.you}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={c.name} invalid={invalid("name")}>
              <input className="field" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={invalid("name")} />
            </Field>
            <Field label={c.phone} help={c.phoneHelp} invalid={invalid("phone")}>
              <input
                className="field"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={set("phone")}
                aria-invalid={invalid("phone")}
              />
            </Field>
            <Field label={c.email} help={c.emailHelp} invalid={invalid("email")}>
              <input
                className="field"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                aria-invalid={invalid("email")}
              />
            </Field>
            <Field label={c.notes}>
              <input className="field" value={form.notes} onChange={set("notes")} placeholder={c.notesPh} maxLength={500} />
            </Field>
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </Section>
      </div>

      {/* Summary */}
      <aside className="rounded-[2rem] bg-paper p-6 shadow-card lg:sticky lg:top-28">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl">{c.yourOrder}</h2>
          <button type="button" onClick={() => setDrawerOpen(true)} className="text-sm font-bold text-cobalt underline underline-offset-4">
            {c.edit}
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {lines.map((l) => {
            const p = byId.get(l.productId);
            if (!p) return null;
            return (
              <li key={l.key} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
                  <span className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full bg-cobalt text-[0.7rem] font-bold text-cream">
                    {l.packs}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{productName(p, lang)}</p>
                  <p className="truncate text-sm text-cocoa-soft">{lineDetail(l, p, lang, t.menu.packOf)}</p>
                </div>
                <p className="font-semibold tabular-nums">{formatMoney(l.packs * p.price_cents)}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 rounded-2xl bg-marigold-soft p-4 text-sm">
          <p className="font-bold">{c.pay}</p>
          <p className="mt-0.5 text-cocoa-soft">{paymentNote}</p>
        </div>
        <div className="mt-5 flex items-baseline justify-between border-t-2 border-dashed border-line pt-4">
          <span className="font-bold">{c.total}</span>
          <span className="display text-3xl text-cobalt">{formatMoney(subtotal)}</span>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rosa-soft px-4 py-3 text-sm font-semibold text-terracotta-dark">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending || days.length === 0} className="btn btn-marigold mt-5 w-full !py-4 text-lg">
          {pending ? c.placing : `${c.place} · ${formatMoney(subtotal)}`}
        </button>
      </aside>
    </form>
  );
}

function Section({ n, title, invalid, children }: { n: number; title: string; invalid?: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-[2rem] bg-paper p-6 shadow-card sm:p-7 ${invalid ? "ring-2 ring-terracotta" : ""}`}>
      <h2 className="mb-5 flex items-center gap-3 text-[1.7rem]">
        <span className="display grid size-9 shrink-0 place-items-center rounded-full bg-marigold text-lg">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, help, invalid, children }: { label: string; help?: string; invalid?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={`label ${invalid ? "text-terracotta-dark" : ""}`}>{label}</span>
      {children}
      {help && <span className="mt-1.5 block text-xs text-cocoa-soft">{help}</span>}
    </label>
  );
}
