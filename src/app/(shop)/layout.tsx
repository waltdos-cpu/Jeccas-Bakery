import Link from "next/link";
import { CartDrawer } from "@/components/cart-drawer";
import { BagBar, Header } from "@/components/header";
import { Logo } from "@/components/logo";
import { NotifyForm } from "@/components/notify-form";
import { ShopProvider } from "@/components/providers";
import { repo } from "@/lib/db";
import { announcementText, BRAND, DICT } from "@/lib/i18n";
import { getBrowserLang, getSavedLang } from "@/lib/lang";
import { LanguageGate } from "@/components/language-gate";
import { formatBakeDate, formatCutoff } from "@/lib/schedule";
import { getMenu, getOpenDays } from "@/lib/storefront";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [saved, browser, products, settings, days] = await Promise.all([
    getSavedLang(),
    getBrowserLang(),
    getMenu(),
    repo.getSettings(),
    getOpenDays(),
  ]);
  const lang = saved ?? browser;
  const t = DICT[lang];
  const next = days.find((d) => d.remaining > 0);
  const announcement =
    announcementText(settings, lang) ||
    (next ? t.announce(formatBakeDate(next.date, lang, "long"), formatCutoff(next.cutoff, lang)) : t.announceNone);

  return (
    <ShopProvider lang={lang} products={products}>
      <Header announcement={announcement} />
      <main className="flex-1" lang={lang}>
        {children}
      </main>
      <footer className="tile-lines relative mt-28 bg-cobalt text-cream" lang={lang}>
        <div className="tile-band h-5 border-y-2 border-cobalt-deep" aria-hidden />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.1fr]">
          <div>
            <Logo light className="h-14" />
            <p className="mt-5 max-w-sm text-lg text-cream/85">{t.footer.homemade}</p>
            {settings.pickupArea && <p className="mt-1 text-cream/85">{settings.pickupArea}</p>}
          </div>
          <div className="rounded-[2rem] bg-cobalt-deep/60 p-7 ring-1 ring-cream/10 sm:p-9">
            <h2 className="text-3xl sm:text-4xl">{t.footer.notifyTitle}</h2>
            <div className="mt-5">
              <NotifyForm />
            </div>
          </div>
        </div>
        <div className="border-t border-cream/15">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-4 py-6 pb-24 text-sm text-cream/70 sm:px-6 md:pb-6">
            <span>
              © {new Date().getFullYear()} {BRAND}
            </span>
            <span className="flex gap-5">
              <Link href="/#faq" className="hover:text-cream">
                {t.nav.faq}
              </Link>
              <Link href="/custom" className="hover:text-cream">
                {t.nav.custom}
              </Link>
            </span>
          </div>
        </div>
      </footer>
      <CartDrawer />
      <BagBar />
      {!saved && <LanguageGate suggested={browser} />}
    </ShopProvider>
  );
}
