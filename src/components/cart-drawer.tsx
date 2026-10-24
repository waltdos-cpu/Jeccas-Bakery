"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { productName } from "@/lib/i18n";
import { flavorLabel } from "@/lib/order-text";
import { formatMoney } from "@/lib/pricing";
import type { CartLine, Lang, Product } from "@/lib/types";
import { CloseIcon } from "./icons";
import { Mascot } from "./logo";
import { useShop } from "./providers";
import { Qty } from "./qty";

export function lineDetail(line: CartLine, p: Product, lang: Lang, packOf: (n: number) => string) {
  const parts: string[] = [];
  if (p.pack_size > 1) parts.push(packOf(p.pack_size));
  if (line.flavors) {
    parts.push(
      Object.entries(line.flavors)
        .filter(([, n]) => n > 0)
        .map(([id, n]) => `${n} ${flavorLabel(id, p.flavors, lang)}`)
        .join(", "),
    );
  }
  return parts.join(" · ");
}

export function CartDrawer() {
  const { t, lang, lines, products, subtotal, setPacks, drawerOpen, setDrawerOpen } = useShop();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;
  const byId = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t.cart.title}>
      <div className="anim-fade absolute inset-0 bg-cocoa/40" onClick={() => setDrawerOpen(false)} />
      <aside className="anim-slide absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-3xl">{t.cart.title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="grid size-10 place-items-center rounded-full hover:bg-cream-deep"
            aria-label={t.cart.close}
          >
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-cocoa-soft">
            <Mascot className="h-16" />
            <p>{t.cart.empty}</p>
            <Link href="/#menu" onClick={() => setDrawerOpen(false)} className="btn btn-outline text-cobalt">
              {t.cart.browse}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((l) => {
                const p = byId.get(l.productId);
                if (!p) return null;
                return (
                  <li key={l.key} className="flex gap-4 py-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                      <Image src={p.image} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <p className="display text-xl leading-tight">{productName(p, lang)}</p>
                          <p className="text-sm text-cocoa-soft">{lineDetail(l, p, lang, t.menu.packOf)}</p>
                        </div>
                        <p className="font-semibold tabular-nums">{formatMoney(l.packs * p.price_cents)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Qty size="sm" value={l.packs} onChange={(n) => setPacks(l.key, n)} label={productName(p, lang)} />
                        <button
                          type="button"
                          onClick={() => setPacks(l.key, 0)}
                          className="text-sm text-cocoa-soft underline underline-offset-2 hover:text-cocoa"
                        >
                          {t.cart.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line bg-paper px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex justify-between text-lg">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <Link href="/order" onClick={() => setDrawerOpen(false)} className="btn btn-marigold w-full !py-4 text-lg">
                {t.cart.checkout}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
