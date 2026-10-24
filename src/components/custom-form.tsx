"use client";

import { useState, useTransition } from "react";
import { submitRequest, type FormResult } from "@/app/actions";
import { Starburst } from "./decor";
import { useShop } from "./providers";

export function CustomForm() {
  const { t, lang } = useShop();
  const c = t.custom;
  const [form, setForm] = useState({ name: "", phone: "", email: "", event_date: "", quantity: "", details: "" });
  const [bad, setBad] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [pending, start] = useTransition();

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <Starburst size={110} color="var(--color-rosa)">
          <span className="display text-3xl">{c.thanks}</span>
        </Starburst>
        <p className="max-w-sm text-lg">{c.sent}</p>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setBad((b) => b.filter((x) => x !== k));
  };
  const invalid = (k: string) => bad.includes(k);

  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
        start(async () => {
          const r: FormResult = await submitRequest({ ...form, lang, website }).catch(() => ({ ok: false }));
          if (r.ok) setStatus("sent");
          else {
            setBad(r.fields ?? []);
            setStatus("error");
          }
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="label">{c.name}</span>
          <input className="field" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={invalid("name")} />
        </label>
        <label className="block">
          <span className="label">{c.phone}</span>
          <input
            className="field"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set("phone")}
            aria-invalid={invalid("phone")}
          />
        </label>
        <label className="block">
          <span className="label">{c.email}</span>
          <input className="field" type="email" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={invalid("email")} />
        </label>
        <label className="block">
          <span className="label">{c.date}</span>
          <input className="field" type="date" value={form.event_date} onChange={set("event_date")} aria-invalid={invalid("event_date")} />
        </label>
      </div>
      <label className="block">
        <span className="label">{c.quantity}</span>
        <input className="field" value={form.quantity} onChange={set("quantity")} maxLength={120} />
      </label>
      <label className="block">
        <span className="label">{c.details}</span>
        <textarea
          className="field min-h-32"
          value={form.details}
          onChange={set("details")}
          placeholder={c.detailsPh}
          maxLength={2000}
          aria-invalid={invalid("details")}
        />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {status === "error" && (
        <p role="alert" className="rounded-xl bg-rosa-soft px-4 py-3 text-sm font-semibold text-terracotta-dark">
          {bad.length ? t.checkout.errors.invalid : t.checkout.errors.generic}
        </p>
      )}
      <button className="btn btn-marigold !py-4 text-lg" disabled={pending}>
        {c.submit}
      </button>
    </form>
  );
}
