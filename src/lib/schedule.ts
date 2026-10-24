import type { Settings } from "./types";

// All scheduling is done in the bakery's wall-clock time. A wall-clock moment
// is stored as a "naive" timestamp: Date.UTC() of the local fields. This keeps
// date math free of the server's own timezone. Across a DST change a cutoff
// can drift by one hour, which is fine for a 24h+ cutoff.

const DAY = 86_400_000;

export type BakeDay = {
  date: string; // YYYY-MM-DD
  /** Last moment (naive, bakery-local) an order is accepted. */
  cutoff: number;
};

export function wallClockNow(tz: string, now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}

export function toISODate(naive: number): string {
  return new Date(naive).toISOString().slice(0, 10);
}

export function parseISODate(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const t = Date.parse(date + "T00:00:00Z");
  return Number.isNaN(t) || toISODate(t) !== date ? null : t;
}

/** Bake days a customer can still order for, soonest first. */
export function openBakeDays(settings: Settings, tz: string, now: Date = new Date()): BakeDay[] {
  const nowNaive = wallClockNow(tz, now);
  const today = parseISODate(toISODate(nowNaive))!;
  const blackout = new Set(settings.blackoutDates);
  const extra = new Set(settings.extraDates);
  const days: BakeDay[] = [];
  for (let i = 0; i <= settings.daysAhead; i++) {
    const start = today + i * DAY;
    const date = toISODate(start);
    const weekday = new Date(start).getUTCDay();
    if (!(settings.bakeWeekdays.includes(weekday) || extra.has(date))) continue;
    if (blackout.has(date)) continue;
    const cutoff = start - settings.cutoffHours * 3_600_000;
    if (nowNaive >= cutoff) continue;
    days.push({ date, cutoff });
  }
  return days;
}

export function isOpenBakeDay(date: string, settings: Settings, tz: string, now?: Date): boolean {
  return openBakeDays(settings, tz, now).some((d) => d.date === date);
}

const LOCALE = { en: "en-US", es: "es-US" } as const;

export function formatBakeDate(date: string, lang: "en" | "es", style: "short" | "long" = "short"): string {
  const t = parseISODate(date);
  if (t === null) return date;
  const out = new Intl.DateTimeFormat(LOCALE[lang], {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  }).format(t);
  // Spanish reads "sábado 26 de septiembre", without the comma Intl adds
  return lang === "es" ? out.replace(", ", " ") : out;
}

/** "Saturday" / "sábado" */
export function formatWeekday(date: string, lang: "en" | "es"): string {
  const t = parseISODate(date);
  return t === null ? date : new Intl.DateTimeFormat(LOCALE[lang], { timeZone: "UTC", weekday: "long" }).format(t);
}

/** "Sep 26" / "26 de sept" */
export function formatDayMonth(date: string, lang: "en" | "es"): string {
  const t = parseISODate(date);
  if (t === null) return date;
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(LOCALE[lang], { timeZone: "UTC", ...o }).format(t);
  return lang === "es" ? `${f({ day: "numeric" })} de ${f({ month: "short" })}` : f({ month: "short", day: "numeric" });
}

/**
 * The last moment to order, shown as the last full minute before the cutoff:
 * "Wed, Sep 23, 11:59 PM" / "miércoles 23 de septiembre a las 11:59 p.m."
 */
export function formatCutoff(cutoff: number, lang: "en" | "es"): string {
  const lastMinute = cutoff - 60_000;
  if (lang === "es") {
    const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(LOCALE.es, { timeZone: "UTC", ...o }).format(lastMinute);
    return `${f({ weekday: "long", month: "long", day: "numeric" }).replace(", ", " ")} a las ${f({ hour: "numeric", minute: "2-digit" })}`;
  }
  return new Intl.DateTimeFormat(LOCALE.en, {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(lastMinute);
}

/** "10:00-12:00" -> "10–12 AM" style label. */
export function formatWindow(window: string, lang: "en" | "es"): string {
  const m = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/.exec(window);
  if (!m) return window;
  const fmt = (h: number, min: number) =>
    new Intl.DateTimeFormat(LOCALE[lang], {
      timeZone: "UTC",
      hour: "numeric",
      minute: min ? "2-digit" : undefined,
    }).format(Date.UTC(2000, 0, 1, h, min));
  return `${fmt(+m[1], +m[2])} – ${fmt(+m[3], +m[4])}`;
}

export function addDays(date: string, n: number): string {
  const t = parseISODate(date);
  return t === null ? date : toISODate(t + n * DAY);
}

/** Today's date (YYYY-MM-DD) in the bakery's timezone. */
export function todayIn(tz: string, now: Date = new Date()): string {
  return toISODate(wallClockNow(tz, now));
}
