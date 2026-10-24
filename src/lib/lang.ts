import "server-only";
import { cookies, headers } from "next/headers";
import type { Lang } from "./types";

export const LANG_COOKIE = "lang";

/** The language the visitor explicitly picked, or null if they haven't yet. */
export async function getSavedLang(): Promise<Lang | null> {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return saved === "en" || saved === "es" ? saved : null;
}

/** The browser's preferred language, used until the visitor picks one. */
export async function getBrowserLang(): Promise<Lang> {
  const accept = (await headers()).get("accept-language") ?? "";
  return /^es\b/i.test(accept.trim()) ? "es" : "en";
}

/** Visitor's language: saved choice first, then the browser's preference. */
export async function getLang(): Promise<Lang> {
  return (await getSavedLang()) ?? (await getBrowserLang());
}
