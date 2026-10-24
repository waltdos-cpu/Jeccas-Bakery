"use client";

import { useActionState } from "react";
import { saveSettings, type SaveResult } from "@/app/admin/actions";
import type { Settings } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SettingsForm({ settings: s, timezone }: { settings: Settings; timezone: string }) {
  const [state, action, pending] = useActionState<SaveResult, FormData>(saveSettings, null);

  return (
    <form action={action} className="space-y-6">
      <Card title="Bake days" hint={`Customers can order for these days. Times are in ${timezone.replace("_", " ")}.`}>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d, i) => (
            <label key={d} className="cursor-pointer">
              <input type="checkbox" name="bakeWeekdays" value={i} defaultChecked={s.bakeWeekdays.includes(i)} className="peer sr-only" />
              <span className="block rounded-full border-2 border-line bg-paper px-4 py-2 font-bold peer-checked:border-cobalt peer-checked:bg-cobalt peer-checked:text-cream peer-focus-visible:outline-3 peer-focus-visible:outline-marigold">
                {d}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Order cutoff (hours before bake day)" hint="48 = orders close 2 days before">
            <input name="cutoffHours" type="number" min="0" max="336" defaultValue={s.cutoffHours} className="field" />
          </Field>
          <Field label="Max orders per day">
            <input name="maxOrdersPerDay" type="number" min="0" max="500" defaultValue={s.maxOrdersPerDay} className="field" />
          </Field>
          <Field label="How many days ahead to book">
            <input name="daysAhead" type="number" min="1" max="90" defaultValue={s.daysAhead} className="field" />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Days off" hint="One date per line, like 2026-12-24">
            <textarea name="blackoutDates" defaultValue={s.blackoutDates.join("\n")} className="field min-h-24 font-mono text-sm" />
          </Field>
          <Field label="Extra bake days" hint="One-off days outside your usual schedule">
            <textarea name="extraDates" defaultValue={s.extraDates.join("\n")} className="field min-h-24 font-mono text-sm" />
          </Field>
        </div>
      </Card>

      <Card title="Pickup">
        <Field label="Pickup windows" hint="One per line, 24-hour time, like 14:00-16:00">
          <textarea name="pickupWindows" defaultValue={s.pickupWindows.join("\n")} className="field min-h-24 font-mono text-sm" />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Pickup area (shown publicly)" hint="e.g. Kendall, Miami">
            <input name="pickupArea" defaultValue={s.pickupArea} className="field" />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Payment note (English)">
            <input name="paymentNote" defaultValue={s.paymentNote} className="field" />
          </Field>
          <Field label="Payment note (Spanish)">
            <input name="paymentNoteEs" defaultValue={s.paymentNoteEs} className="field" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Pickup address" hint="Only shown to customers after they order">
            <textarea name="pickupAddress" defaultValue={s.pickupAddress} className="field min-h-20" />
          </Field>
        </div>
      </Card>

      <Card title="Notifications & banner">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email me new orders at" hint="Optional. The dashboard always shows orders live.">
            <input name="ownerEmail" type="email" defaultValue={s.ownerEmail} className="field" />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Top banner (English)" hint="Leave empty to show the next bake day automatically">
            <input name="announcement" defaultValue={s.announcement} className="field" maxLength={160} />
          </Field>
          <Field label="Top banner (Spanish)" hint="Shown to Spanish visitors">
            <input name="announcementEs" defaultValue={s.announcementEs} className="field" maxLength={160} />
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-full bg-cream/90 p-2 shadow-lift backdrop-blur">
        <button className="btn btn-cobalt" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        {state?.message && (
          <span role="status" className={`pr-3 text-sm font-semibold ${state.ok ? "text-leaf" : "text-terracotta-dark"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] bg-paper p-5 shadow-card sm:p-6">
      <h2 className="text-2xl">{title}</h2>
      {hint && <p className="mt-1 text-sm text-cocoa-soft">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-cocoa-soft">{hint}</span>}
    </label>
  );
}
