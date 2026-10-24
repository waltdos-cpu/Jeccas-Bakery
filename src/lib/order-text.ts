import type { Flavor, Lang, OrderItem, Product } from "./types";

export function flavorLabel(id: string, flavors: Flavor[], lang: Lang) {
  const f = flavors.find((x) => x.id === id);
  return f ? f[lang] : id;
}

/** "2 × Conchas (pack of 3: 2 Vanilla, 1 Chocolate)" */
export function itemLine(it: OrderItem, products: Product[], lang: Lang): string {
  const p = products.find((x) => x.id === it.product_id);
  const name = p ? (lang === "es" ? p.name_es : p.name_en) : it.name;
  const packWord = lang === "es" ? "paquete de" : "pack of";
  let detail = "";
  if (it.flavors) {
    const fl = Object.entries(it.flavors)
      .map(([id, n]) => `${n} ${flavorLabel(id, p?.flavors ?? [], lang)}`)
      .join(", ");
    detail = ` (${packWord} ${it.pack_size}: ${fl})`;
  } else if (it.pack_size > 1) {
    detail = ` (${packWord} ${it.pack_size})`;
  }
  return `${it.packs} × ${name}${detail}`;
}
