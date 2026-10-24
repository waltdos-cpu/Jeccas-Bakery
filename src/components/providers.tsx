"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICT } from "@/lib/i18n";
import { lineKey } from "@/lib/pricing";
import type { CartLine, Lang, Product } from "@/lib/types";

type Line = CartLine & { key: string };

type Shop = {
  lang: Lang;
  t: (typeof DICT)[Lang];
  products: Product[];
  lines: Line[];
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setPacks: (key: string, packs: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  /** increments on every add, so the cart badge can animate */
  bump: number;
  /** false until the saved bag has been restored from storage */
  ready: boolean;
};

const ShopContext = createContext<Shop | null>(null);
const STORAGE_KEY = "jj_cart_v1";

export function ShopProvider({ lang, products, children }: { lang: Lang; products: Product[]; children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bump, setBump] = useState(0);

  // Restore the saved cart once on mount; drop anything no longer on the menu.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Line[];
      const ids = new Set(products.filter((p) => !p.sold_out).map((p) => p.id));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      setLines(Array.isArray(saved) ? saved.filter((l) => ids.has(l.productId)) : []);
    } catch {
      /* storage unavailable: start empty */
    }
    setLoaded(true);
  }, [products]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, loaded]);

  const add = useCallback((line: CartLine) => {
    const key = lineKey(line);
    setLines((prev) => {
      const hit = prev.find((l) => l.key === key);
      if (hit) return prev.map((l) => (l.key === key ? { ...l, packs: Math.min(24, l.packs + line.packs) } : l));
      return [...prev, { ...line, key }];
    });
    setBump((b) => b + 1);
  }, []);

  const setPacks = useCallback((key: string, packs: number) => {
    setLines((prev) =>
      packs <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, packs: Math.min(24, packs) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Shop>(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return {
      lang,
      t: DICT[lang],
      products,
      lines,
      count: lines.reduce((n, l) => n + l.packs, 0),
      subtotal: lines.reduce((s, l) => s + l.packs * (byId.get(l.productId)?.price_cents ?? 0), 0),
      add,
      setPacks,
      remove,
      clear,
      drawerOpen,
      setDrawerOpen,
      bump,
      ready: loaded,
    };
  }, [lang, products, lines, add, setPacks, remove, clear, drawerOpen, bump, loaded]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
