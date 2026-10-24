"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { setLang } from "@/app/actions";
import { DICT } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { Flower } from "./decor";
import { Logo } from "./logo";

const OPTIONS: Record<Lang, { label: string; sub: string }> = {
  es: { label: "Español", sub: "Ver la página en español" },
  en: { label: "English", sub: "View the site in English" },
};

/**
 * First-visit welcome: asks the visitor to pick English or Spanish before
 * browsing. Shown until a choice is saved; the browser's language is listed
 * first. Both languages are shown at once since we don't know which they read.
 */
export function LanguageGate({ suggested }: { suggested: Lang }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [pending, start] = useTransition();
  const firstButton = useRef<HTMLButtonElement>(null);
  const order: Lang[] = suggested === "es" ? ["es", "en"] : ["en", "es"];

  useEffect(() => {
    if (!open) return;
    firstButton.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const choose = (l: Lang) =>
    start(async () => {
      await setLang(l);
      router.refresh();
      setOpen(false);
    });

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      onKeyDown={(e) => e.key === "Escape" && choose(suggested)}
    >
      <div className="anim-fade tile-lines absolute inset-0 bg-cobalt/95 backdrop-blur-sm" />
      <div className="anim-sheet relative w-full max-w-md overflow-hidden rounded-[2.25rem] bg-cream text-center shadow-lift">
        <div className="grid grid-cols-3 gap-2 p-2">
          {["conchas", "miguelitos", "almohada"].map((img, i) => (
            <div key={img} className={`relative aspect-square overflow-hidden ${i === 1 ? "arch" : "rounded-[1.4rem]"}`}>
              <Image src={`/images/menu/${img}.jpg`} alt="" fill sizes="150px" className="object-cover" priority />
            </div>
          ))}
        </div>
        <div className="px-6 pt-5 pb-7 sm:px-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 id="gate-title" className="mt-5 text-4xl leading-tight">
            {DICT.es.gate.hello}
            <span className="mx-2 inline-block align-middle">
              <Flower className="size-5 text-marigold" />
            </span>
            {DICT.en.gate.hello}
          </h2>
          <p className="mt-3 text-cocoa-soft">
            {DICT[order[0]].gate.ask}
            <br />
            {DICT[order[1]].gate.ask}
          </p>
          <div className="mt-6 grid gap-3">
            {order.map((l, i) => (
              <button
                key={l}
                ref={i === 0 ? firstButton : undefined}
                type="button"
                lang={l}
                disabled={pending}
                onClick={() => choose(l)}
                className={`group flex items-center justify-between rounded-2xl border-[3px] border-cocoa px-5 py-4 text-left transition hover:-translate-y-0.5 disabled:opacity-60 ${
                  i === 0 ? "bg-marigold shadow-[4px_4px_0_var(--color-cocoa)]" : "bg-paper shadow-[4px_4px_0_var(--color-cocoa)]"
                }`}
              >
                <span>
                  <span className="display block text-2xl">{OPTIONS[l].label}</span>
                  <span className="block text-sm text-cocoa-soft">{OPTIONS[l].sub}</span>
                </span>
                <span aria-hidden className="text-2xl transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs text-cocoa-soft">
            {DICT[order[0]].gate.note}
            <br />
            {DICT[order[1]].gate.note}
          </p>
        </div>
      </div>
    </div>
  );
}
