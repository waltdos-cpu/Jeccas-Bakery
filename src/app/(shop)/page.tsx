import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Flower, Marquee, Scallop, Squiggle, Starburst } from "@/components/decor";
import { MenuGrid } from "@/components/menu-grid";
import { DICT, productName } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { formatBakeDate, formatCutoff } from "@/lib/schedule";
import { getMenu, getOpenDays } from "@/lib/storefront";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return lang === "es"
    ? {
        title: { absolute: "JJ Baked Goods · Pan dulce hecho por encargo" },
        description:
          "Pan dulce casero hecho por encargo: conchas, miguelitos, cañones de dulce de leche y más. Haz tu pedido en línea y recógelo recién horneado.",
      }
    : {};
}

export default async function Home() {
  const [lang, products, days] = await Promise.all([getLang(), getMenu(), getOpenDays()]);
  const t = DICT[lang];
  const next = days.find((d) => d.remaining > 0);
  const steps = t.how.steps(
    next ? formatCutoff(next.cutoff, lang) : t.how.fallback.by,
    next ? formatBakeDate(next.date, lang, "long") : t.how.fallback.day,
  );
  const conchas = products.find((p) => p.id === "conchas");

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="tile-lines relative bg-cobalt text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-sm font-bold tracking-wide ring-1 ring-cream/20">
              <Flower className="size-4 text-marigold" /> {t.hero.eyebrow}
            </p>
            <h1 className="mt-6 text-[3.4rem] leading-[0.92] sm:text-7xl lg:text-[5.6rem]">
              {t.hero.title1}
              <br />
              <span className="relative inline-block text-marigold">
                {t.hero.title2}
                <Squiggle className="absolute -bottom-3 left-0 h-4 w-full text-rosa" />
              </span>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-cream/85 sm:text-xl">{t.hero.sub}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="#menu" className="btn btn-marigold !px-7 !py-4 text-lg">
                {t.hero.cta}
              </Link>
              <Link href="/custom" className="btn btn-outline !px-7 !py-4 text-lg">
                {t.hero.cta2}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[26rem] md:max-w-none">
            <div className="arch relative aspect-[4/5] overflow-hidden border-[10px] border-cream shadow-lift">
              <Image
                src="/images/menu/conchas-tray.jpg"
                alt="Fresh vanilla and chocolate conchas"
                fill
                priority
                sizes="(min-width: 768px) 480px, 90vw"
                className="object-cover"
              />
            </div>
            {conchas && (
              <Starburst className="absolute -top-4 -right-2 rotate-12 sm:-right-6" size={128}>
                <span className="block text-[0.7rem] font-extrabold tracking-wider uppercase">{t.hero.sticker[0]}</span>
                <span className="display block text-xl">{t.hero.sticker[1]}</span>
                <span className="display block text-3xl">{t.hero.sticker[2]}</span>
              </Starburst>
            )}
            <div className="absolute -bottom-8 -left-3 w-[42%] -rotate-6 overflow-hidden rounded-[1.4rem] border-[6px] border-cream shadow-lift sm:-left-8">
              <div className="relative aspect-square">
                <Image src="/images/menu/miguelitos.jpg" alt="Miguelitos" fill sizes="220px" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
        <Scallop className="absolute inset-x-0 top-full" />
      </section>

      {/* ───────── Ticker ───────── */}
      <div className="mt-14 -rotate-1 border-y-2 border-cocoa bg-terracotta py-4 text-cream">
        <Marquee items={products.map((p) => productName(p, lang))} />
      </div>

      {/* ───────── Menu ───────── */}
      <section id="menu" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold tracking-[0.18em] text-terracotta uppercase">{t.menu.kicker}</p>
            <h2 className="mt-2 text-5xl sm:text-6xl">{t.menu.title}</h2>
          </div>
          <p className="max-w-xs text-lg text-cocoa-soft">{t.menu.sub}</p>
        </div>
        <MenuGrid products={products} />
      </section>

      {/* ───────── How it works ───────── */}
      <section id="how" className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <h2 className="text-center text-5xl sm:text-6xl">{t.how.title}</h2>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <div aria-hidden className="absolute top-10 right-[16%] left-[16%] hidden border-t-[3px] border-dashed border-cobalt/30 md:block" />
          {steps.map((s, i) => (
            <li key={s.k} className="relative text-center">
              <span
                className={`display relative mx-auto grid size-20 place-items-center rounded-full border-[3px] border-cocoa text-3xl shadow-[4px_4px_0_var(--color-cocoa)] ${
                  ["bg-marigold", "bg-rosa", "bg-cobalt text-cream"][i]
                }`}
              >
                {i + 1}
              </span>
              <p className="mt-5 text-sm font-extrabold tracking-[0.18em] text-terracotta uppercase">{s.k}</p>
              <h3 className="mt-2 text-[1.7rem]">{s.t}</h3>
              <p className="mx-auto mt-2 max-w-xs text-cocoa-soft">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── Party orders ───────── */}
      <section className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
        <div className="relative grid overflow-hidden rounded-[2.5rem] border-[3px] border-cocoa bg-marigold shadow-[8px_8px_0_var(--color-cocoa)] md:grid-cols-[1.15fr_1fr]">
          <div className="relative z-10 p-8 sm:p-12">
            <h2 className="text-5xl sm:text-6xl">{t.custom.band}</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed">{t.custom.bandSub}</p>
            <Link href="/custom" className="btn btn-cobalt mt-8 !px-7 !py-4 text-lg">
              {t.custom.bandCta}
            </Link>
          </div>
          <div className="relative min-h-72">
            <div className="absolute inset-0 grid grid-cols-2 gap-3 p-3 md:p-4">
              {["/images/menu/cubilete-inside.jpg", "/images/menu/canon.jpg", "/images/menu/almohada.jpg", "/images/menu/polvorones.jpg"].map(
                (src, i) => (
                  <div key={src} className={`relative overflow-hidden ${i % 2 ? "rounded-[1.5rem]" : "arch"}`}>
                    <Image src={src} alt="" fill sizes="(min-width: 768px) 260px, 50vw" className="object-cover" />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pt-28 sm:px-6">
        <h2 className="text-center text-5xl sm:text-6xl">{t.faq.title}</h2>
        <div className="mt-10 space-y-3">
          {t.faq.items.map((f) => (
            <details key={f.q} className="group rounded-[1.5rem] bg-paper px-6 shadow-card open:ring-2 open:ring-cobalt/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-bold">
                {f.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cobalt-soft text-xl text-cobalt transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="-mt-1 pb-5 leading-relaxed text-cocoa-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
