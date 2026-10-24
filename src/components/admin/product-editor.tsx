"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveProduct, toggleSoldOut, type SaveResult } from "@/app/admin/actions";
import { formatMoney } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function ProductEditor({ product: p }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<SaveResult, FormData>(saveProduct.bind(null, p.id), null);

  return (
    <article className={`rounded-[1.5rem] bg-paper shadow-card ${!p.active ? "opacity-75" : ""}`}>
      <div className="flex items-center gap-4 p-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
          <Image src={p.image} alt="" fill sizes="64px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{p.name_en}</p>
          <p className="text-sm text-cocoa-soft">
            {p.price_cents > 0 ? formatMoney(p.price_cents) : "No price"}
            {p.pack_size > 1 ? ` · pack of ${p.pack_size}` : " · each"}
            {!p.active && " · Hidden"}
          </p>
        </div>
        {p.active && (
          <form action={toggleSoldOut}>
            <input type="hidden" name="id" value={p.id} />
            <input type="hidden" name="sold_out" value={String(!p.sold_out)} />
            <button
              className={`rounded-full px-3.5 py-2 text-sm font-bold ${
                p.sold_out ? "bg-terracotta text-white" : "bg-cream-deep text-cocoa hover:bg-line"
              }`}
            >
              {p.sold_out ? "Sold out" : "In stock"}
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-full px-3 py-2 text-sm font-bold text-cobalt hover:bg-cobalt-soft"
          aria-expanded={open}
        >
          {open ? "Close" : "Edit"}
        </button>
      </div>

      {open && (
        <form action={action} className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
          <label>
            <span className="label">Name (English)</span>
            <input name="name_en" defaultValue={p.name_en} className="field" required />
          </label>
          <label>
            <span className="label">Name (Spanish)</span>
            <input name="name_es" defaultValue={p.name_es} className="field" required />
          </label>
          <label>
            <span className="label">Description (English)</span>
            <textarea name="description_en" defaultValue={p.description_en} className="field min-h-24" />
          </label>
          <label>
            <span className="label">Description (Spanish)</span>
            <textarea name="description_es" defaultValue={p.description_es} className="field min-h-24" />
          </label>
          <label>
            <span className="label">Price ($)</span>
            <input name="price" type="number" step="0.25" min="0" defaultValue={(p.price_cents / 100).toFixed(2)} className="field" />
          </label>
          <label>
            <span className="label">Pieces per order (1 = sold individually)</span>
            <input name="pack_size" type="number" min="1" max="48" defaultValue={p.pack_size} className="field" />
          </label>
          <div className="flex flex-wrap gap-5 sm:col-span-2">
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" name="active" defaultChecked={p.active} className="size-5 accent-cobalt" /> Show on site
            </label>
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" name="sold_out" defaultChecked={p.sold_out} className="size-5 accent-cobalt" /> Sold out
            </label>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button className="btn btn-cobalt" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            {state?.message && (
              <span className={`text-sm font-semibold ${state.ok ? "text-leaf" : "text-terracotta-dark"}`}>{state.message}</span>
            )}
          </div>
        </form>
      )}
    </article>
  );
}
