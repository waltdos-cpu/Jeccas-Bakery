import type { Metadata } from "next";
import Image from "next/image";
import { CustomForm } from "@/components/custom-form";
import { Flower } from "@/components/decor";
import { DICT } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export const metadata: Metadata = {
  title: "Party & custom orders",
  description: "Trays and large orders of homemade pan dulce for birthdays, showers, and office breakfasts.",
};

export default async function CustomPage() {
  const lang = await getLang();
  const t = DICT[lang].custom;
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-extrabold tracking-[0.18em] text-terracotta uppercase">
          <Flower className="size-4 text-marigold" /> {DICT[lang].nav.custom}
        </p>
        <h1 className="mt-3 text-5xl sm:text-6xl">{t.title}</h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-cocoa-soft">{t.sub}</p>
        <div className="mt-10 hidden grid-cols-2 gap-4 lg:grid">
          <div className="arch relative aspect-[3/4] overflow-hidden shadow-lift">
            <Image src="/images/menu/conchas.jpg" alt="" fill sizes="280px" className="object-cover" />
          </div>
          <div className="relative mt-12 aspect-[3/4] overflow-hidden rounded-[1.75rem] shadow-lift">
            <Image src="/images/menu/miguelitos-2.jpg" alt="" fill sizes="280px" className="object-cover" />
          </div>
        </div>
      </div>
      <div className="rounded-[2rem] bg-paper p-6 shadow-card sm:p-9">
        <CustomForm />
      </div>
    </div>
  );
}
