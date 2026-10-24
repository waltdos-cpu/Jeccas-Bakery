import "server-only";
import { BAKERY_TZ, repo } from "./db";
import { openBakeDays } from "./schedule";

export type OpenDay = { date: string; cutoff: number; remaining: number };

/** Bake days still open for ordering, with how many order spots remain. */
export async function getOpenDays(): Promise<OpenDay[]> {
  const settings = await repo.getSettings();
  const days = openBakeDays(settings, BAKERY_TZ);
  const counts = await repo.countOrdersByDate(days.map((d) => d.date));
  return days.map((d) => ({ ...d, remaining: Math.max(0, settings.maxOrdersPerDay - (counts[d.date] ?? 0)) }));
}

export async function getMenu() {
  return (await repo.getProducts()).filter((p) => p.active && p.price_cents > 0);
}
