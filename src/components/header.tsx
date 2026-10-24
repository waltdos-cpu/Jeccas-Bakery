"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Lang } from "@/lib/types";
import { setLang } from "@/app/actions";
import { formatMoney } from "@/lib/pricing";
import { BagIcon } from "./icons";
import { Logo } from "./logo";
import { useShop } from "./providers";

export function Header({ announcement }: { announcement: string }) {
  const { t, lang, count, setDrawerOpen, bump } = useShop();
  const [switchLang, pending] = useSwitchLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-marigold text-cocoa">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 sm:px-6">
          <p className="py-0.5 text-[0.78rem] leading-snug font-bold sm:text-sm">{announcement}</p>
          <LangSwitch />
        </div>
      </div>
      <header
        className={`sticky top-0 z-30 bg-cream transition-shadow ${scrolled ? "shadow-[0_8px_24px_-16px_rgb(42_26_18/0.35)]" : ""}`}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-2 px-4 sm:px-6">
          <Link href="/" className="mr-auto">
            <Logo className="h-10 sm:h-12" />
          </Link>
          <nav className="mr-3 hidden items-center gap-1 font-semibold md:flex">
            {[
              ["/#menu", t.nav.menu],
              ["/#how", t.nav.how],
              ["/custom", t.nav.custom],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full px-4 py-2 hover:bg-cream-deep">
                {label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            disabled={pending}
            onClick={() => switchLang(lang === "en" ? "es" : "en")}
            className="rounded-full px-3 py-2 text-sm font-bold text-cobalt underline-offset-4 hover:underline disabled:opacity-50"
            lang={lang === "en" ? "es" : "en"}
          >
            {lang === "en" ? "ES" : "EN"}
            <span className="sr-only"> {t.langToggle}</span>
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn btn-cobalt !px-4 !py-3"
            aria-label={`${t.nav.cart} (${count})`}
          >
            <BagIcon />
            <span className="hidden sm:inline">{t.nav.cart}</span>
            <span
              key={bump}
              className={`grid min-w-6 place-items-center rounded-full px-1.5 text-xs leading-6 ${
                count > 0 ? "anim-pop bg-marigold text-cocoa" : "bg-cream/20 text-cream"
              }`}
            >
              {count}
            </span>
          </button>
        </div>
      </header>
    </>
  );
}

/** Mobile: a bag bar pinned to the bottom once something is in the bag. */
export function BagBar() {
  const { t, count, subtotal, setDrawerOpen, drawerOpen } = useShop();
  if (count === 0 || drawerOpen) return null;
  return (
    <div className="anim-rise fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="flex w-full items-center justify-between rounded-full bg-cobalt px-5 py-4 font-bold text-cream shadow-lift"
      >
        <span className="flex items-center gap-2">
          <BagIcon /> {t.menu.bagBar(count)}
        </span>
        <span>{formatMoney(subtotal)}</span>
      </button>
    </div>
  );
}

function useSwitchLang() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const switchLang = (l: Lang) =>
    start(async () => {
      await setLang(l);
      router.refresh();
    });
  return [switchLang, pending] as const;
}

/** Always-visible English/Español switch in the top bar. */
function LangSwitch() {
  const { lang } = useShop();
  const [switchLang, pending] = useSwitchLang();
  return (
    <div
      role="group"
      aria-label="Language / Idioma"
      className={`flex shrink-0 rounded-full border-2 border-cocoa bg-cream p-0.5 text-xs font-extrabold sm:text-sm ${pending ? "opacity-60" : ""}`}
    >
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          disabled={pending}
          onClick={() => lang !== l && switchLang(l)}
          className={`rounded-full px-2.5 py-1 transition sm:px-3 ${lang === l ? "bg-cobalt text-cream" : "text-cocoa hover:bg-cream-deep"}`}
        >
          <span className="sm:hidden">{l.toUpperCase()}</span>
          <span className="hidden sm:inline">{l === "en" ? "English" : "Español"}</span>
        </button>
      ))}
    </div>
  );
}
