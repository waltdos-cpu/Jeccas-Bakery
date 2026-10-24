"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { productDescription, productName } from "@/lib/i18n";
import { formatMoney, lineKey } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { CloseIcon, PlusIcon } from "./icons";
import { useShop } from "./providers";
import { Qty } from "./qty";

const TINTS = ["bg-rosa-soft", "bg-cobalt-soft", "bg-marigold-soft", "bg-cream-deep"];
const FLAVOR_SWATCH: Record<string, string> = {
  vanilla: "#f3dfb4",
  chocolate: "#6b3b23",
  strawberry: "#f38fae",
  coconut: "#ffffff",
};

export function MenuGrid({ products }: { products: Product[] }) {
  const [picking, setPicking] = useState<Product | null>(null);
  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} tint={TINTS[i % TINTS.length]} priority={i < 3} onPick={() => setPicking(p)} />
        ))}
      </ul>
      {picking && <FlavorSheet product={picking} onClose={() => setPicking(null)} />}
    </>
  );
}

function ProductCard({
  product: p,
  tint,
  onPick,
  priority,
}: {
  product: Product;
  tint: string;
  onPick: () => void;
  priority: boolean;
}) {
  const { t, lang, lines, add, setPacks } = useShop();
  const flavored = p.flavors.length > 0;
  const inBag = lines.filter((l) => l.productId === p.id).reduce((n, l) => n + l.packs, 0);
  const simpleKey = lineKey({ productId: p.id, packs: 1 });
  const simpleLine = lines.find((l) => l.key === simpleKey);
  const badge = flavored ? t.menu.mix : p.pack_size > 1 ? t.menu.packOf(p.pack_size) : null;

  return (
    <li className={`group relative flex flex-col overflow-hidden rounded-[2rem] ${tint} p-3 transition-transform duration-300 hover:-translate-y-1`}>
      <div className="relative aspect-square overflow-hidden rounded-[1.6rem] bg-cream">
        <Image
          src={p.image}
          alt={productName(p, lang)}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${p.sold_out ? "grayscale" : ""}`}
        />
        {badge && !p.sold_out && (
          <span className="absolute top-3 left-3 -rotate-3 rounded-full border-2 border-cocoa bg-marigold px-3 py-1 text-xs font-extrabold tracking-wide text-cocoa uppercase shadow-[2px_2px_0_var(--color-cocoa)]">
            {badge}
          </span>
        )}
        {p.sold_out && (
          <span className="absolute inset-0 grid place-items-center bg-cocoa/35">
            <span className="display -rotate-6 rounded-full bg-cream px-5 py-2 text-2xl text-terracotta">{t.menu.soldOut}</span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[1.75rem]">{productName(p, lang)}</h3>
          <p className="display shrink-0 pt-1 text-2xl text-cobalt">{formatMoney(p.price_cents)}</p>
        </div>
        <p className="mt-2 flex-1 leading-relaxed text-cocoa-soft">{productDescription(p, lang)}</p>
        {flavored && (
          <div className="mt-3 flex items-center gap-1.5" aria-label={p.flavors.map((f) => f[lang]).join(", ")}>
            {p.flavors.map((f) => (
              <span
                key={f.id}
                title={f[lang]}
                className="size-5 rounded-full border-2 border-cocoa/15"
                style={{ background: FLAVOR_SWATCH[f.id] ?? "var(--color-cream)" }}
              />
            ))}
            <span className="ml-1 text-sm text-cocoa-soft">{p.flavors.map((f) => f[lang]).join(" · ")}</span>
          </div>
        )}
        <div className="mt-5 flex min-h-12 items-center justify-between gap-3">
          <span className="text-sm font-semibold text-cocoa-soft">
            {p.pack_size > 1 ? t.menu.packOf(p.pack_size) : t.menu.each}
            {inBag > 0 && <span className="text-leaf"> · {t.menu.inCart(inBag)}</span>}
          </span>
          {p.sold_out ? null : !flavored && simpleLine ? (
            <Qty value={simpleLine.packs} onChange={(n) => setPacks(simpleKey, n)} label={productName(p, lang)} />
          ) : (
            <button type="button" onClick={flavored ? onPick : () => add({ productId: p.id, packs: 1 })} className="btn btn-cobalt">
              <PlusIcon /> {t.menu.add}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function FlavorSheet({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const { t, lang, add, setDrawerOpen } = useShop();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [packs, setPacks] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const picked = Object.values(counts).reduce((a, b) => a + b, 0);
  const full = picked === p.pack_size;

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={productName(p, lang)}>
      <div className="anim-fade absolute inset-0 bg-cobalt-deep/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        className="anim-sheet relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-cream outline-none sm:rounded-[2rem]"
      >
        <div className="relative h-44 overflow-hidden sm:h-52">
          <Image src={p.image} alt="" fill sizes="512px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/10 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-cream text-cocoa shadow-card"
            aria-label={t.cart.close}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-4xl">{productName(p, lang)}</h3>
            <p className="display text-2xl text-cobalt">{formatMoney(p.price_cents)}</p>
          </div>
          <p className="mt-1 text-cocoa-soft">{t.menu.packOf(p.pack_size)}</p>

          <div className="mt-6 flex items-baseline justify-between">
            <p className="font-bold">{t.menu.chooseFlavors(p.pack_size)}</p>
            <p className={`text-sm font-bold tabular-nums ${full ? "text-leaf" : "text-cocoa-soft"}`}>
              {t.menu.picked(picked, p.pack_size)}
            </p>
          </div>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {Array.from({ length: p.pack_size }, (_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < picked ? "bg-cobalt" : "bg-line"}`} />
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {p.flavors.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-2xl bg-paper py-2 pr-2 pl-4 shadow-card">
                <span className="flex items-center gap-3 font-semibold">
                  <span
                    className="size-6 rounded-full border-2 border-cocoa/15"
                    style={{ background: FLAVOR_SWATCH[f.id] ?? "var(--color-cream)" }}
                  />
                  {f[lang]}
                </span>
                <Qty
                  size="sm"
                  label={f[lang]}
                  value={counts[f.id] ?? 0}
                  max={(counts[f.id] ?? 0) + (p.pack_size - picked)}
                  onChange={(n) => setCounts((c) => ({ ...c, [f.id]: Math.max(0, n) }))}
                />
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between">
            <span className="font-bold">{t.menu.packs}</span>
            <Qty value={packs} min={1} onChange={setPacks} label={t.menu.packs} />
          </div>
          <button
            type="button"
            disabled={!full}
            onClick={() => {
              add({ productId: p.id, packs, flavors: Object.fromEntries(Object.entries(counts).filter(([, n]) => n > 0)) });
              onClose();
              setDrawerOpen(true);
            }}
            className="btn btn-marigold mt-6 w-full !py-4 text-lg"
          >
            {t.menu.addToOrder} · {formatMoney(p.price_cents * packs)}
          </button>
        </div>
      </div>
    </div>
  );
}
