"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/app/actions";
import { useShop } from "./providers";

export function NotifyForm() {
  const { t, lang } = useShop();
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [pending, start] = useTransition();

  if (state === "done") return <p className="font-semibold text-cream">{t.footer.notifyDone}</p>;

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
        start(async () => {
          const r = await subscribe(value, lang, website);
          setState(r.ok ? "done" : "error");
        });
      }}
    >
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input
        className="field flex-1 border-transparent"
        placeholder={t.footer.notifyPh}
        aria-label={t.footer.notifyPh}
        aria-invalid={state === "error"}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setState("idle");
        }}
        required
      />
      <button className="btn bg-cream text-cobalt hover:bg-cream-deep" disabled={pending}>
        {t.footer.notifyCta}
      </button>
    </form>
  );
}
