// Run with: npm test  (uses Node's built-in test runner + type stripping)
import { test } from "node:test";
import assert from "node:assert/strict";
import { openBakeDays, wallClockNow, formatWindow, formatCutoff, parseISODate, formatBakeDate, formatWeekday, formatDayMonth } from "../src/lib/schedule.ts";
import { priceCart, bakeTotals, lineKey } from "../src/lib/pricing.ts";
import { SEED_PRODUCTS, DEFAULT_SETTINGS } from "../src/lib/catalog.ts";

const TZ = "America/New_York";
const S = { ...DEFAULT_SETTINGS, bakeWeekdays: [5, 6], cutoffHours: 48, daysAhead: 14 };

test("wall clock uses the bakery timezone, not the server's", () => {
  // 2026-09-24 03:30 UTC is still Sep 23, 11:30 PM in New York (EDT, UTC-4)
  const t = wallClockNow(TZ, new Date("2026-09-24T03:30:00Z"));
  assert.equal(new Date(t).toISOString(), "2026-09-23T23:30:00.000Z");
});

test("cutoff: 48h before the bake day starts", () => {
  // Wed Sep 23, 2026 at 23:30 local. Fri Sep 25 cutoff = Wed 00:00 -> closed.
  // Sat Sep 26 cutoff = Thu 00:00 -> still open.
  const days = openBakeDays(S, TZ, new Date("2026-09-24T03:30:00Z")).map((d) => d.date);
  assert.equal(days[0], "2026-09-26");
  assert.ok(!days.includes("2026-09-25"));
  assert.deepEqual(days, ["2026-09-26", "2026-10-02", "2026-10-03"]);
});

test("cutoff boundary is exact", () => {
  // Thu Sep 24 00:00 local (04:00Z) is exactly Saturday's cutoff -> closed
  const at = openBakeDays(S, TZ, new Date("2026-09-24T04:00:00Z")).map((d) => d.date);
  assert.ok(!at.includes("2026-09-26"));
  const before = openBakeDays(S, TZ, new Date("2026-09-24T03:59:00Z")).map((d) => d.date);
  assert.ok(before.includes("2026-09-26"));
});

test("blackout and extra dates", () => {
  const s = { ...S, blackoutDates: ["2026-10-03"], extraDates: ["2026-09-30"] };
  const days = openBakeDays(s, TZ, new Date("2026-09-24T03:30:00Z")).map((d) => d.date);
  assert.deepEqual(days, ["2026-09-26", "2026-09-30", "2026-10-02"]);
});

test("days crossing a DST change still land on the right weekday", () => {
  // US DST ends Sun Nov 1, 2026
  const s = { ...S, daysAhead: 14 };
  const days = openBakeDays(s, TZ, new Date("2026-10-26T12:00:00Z")).map((d) => d.date);
  assert.deepEqual(days, ["2026-10-30", "2026-10-31", "2026-11-06", "2026-11-07"]);
});

test("date parsing rejects impossible dates", () => {
  assert.equal(parseISODate("2026-02-30"), null);
  assert.equal(parseISODate("2026-9-1"), null);
  assert.notEqual(parseISODate("2026-02-28"), null);
});

test("labels", () => {
  assert.equal(formatWindow("10:00-12:00", "en"), "10 AM – 12 PM");
  const [sat] = openBakeDays(S, TZ, new Date("2026-09-24T03:30:00Z"));
  assert.match(formatCutoff(sat.cutoff, "en"), /Wed, Sep 23, 11:59/);
});

test("Spanish dates read naturally", () => {
  const [sat] = openBakeDays(S, TZ, new Date("2026-09-24T03:30:00Z"));
  assert.equal(formatBakeDate("2026-09-26", "es", "long"), "sábado 26 de septiembre");
  assert.equal(formatWeekday("2026-09-26", "es"), "sábado");
  assert.match(formatDayMonth("2026-09-26", "es"), /^26 de sept/);
  assert.match(formatCutoff(sat.cutoff, "es"), /^miércoles 23 de septiembre a las 11:59/);
  assert.match(formatWindow("14:00-16:00", "es"), /^2 p\.\s?m\. – 4 p\.\s?m\.$/);
});

test("pricing uses server prices and validates flavors", () => {
  const ok = priceCart(
    [
      { productId: "conchas", packs: 2, flavors: { vanilla: 2, chocolate: 1 } },
      { productId: "miguelitos", packs: 3 },
    ],
    SEED_PRODUCTS,
  );
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.subtotal_cents, 2 * 500 + 3 * 200);
    assert.deepEqual(ok.items[0].flavors, { vanilla: 2, chocolate: 1 });
  }
  const bad = (lines: Parameters<typeof priceCart>[0]) => {
    const r = priceCart(lines, SEED_PRODUCTS);
    return r.ok ? "ok" : r.error;
  };
  assert.equal(bad([]), "empty");
  assert.equal(bad([{ productId: "conchas", packs: 1, flavors: { vanilla: 2 } }]), "bad_flavors");
  assert.equal(bad([{ productId: "conchas", packs: 1, flavors: { vanilla: 4, chocolate: -1 } }]), "bad_flavors");
  assert.equal(bad([{ productId: "conchas", packs: 1, flavors: { mango: 3 } }]), "bad_flavors");
  assert.equal(bad([{ productId: "conchas", packs: 1 }]), "bad_flavors");
  assert.equal(bad([{ productId: "miguelitos", packs: 0 }]), "bad_quantity");
  assert.equal(bad([{ productId: "miguelitos", packs: 1.5 }]), "bad_quantity");
  assert.equal(bad([{ productId: "miguelitos", packs: 99 }]), "bad_quantity");
  assert.equal(bad([{ productId: "muffins", packs: 1 }]), "unavailable"); // hidden item
  assert.equal(bad([{ productId: "nope", packs: 1 }]), "unavailable");
  const soldOut = SEED_PRODUCTS.map((p) => (p.id === "canon" ? { ...p, sold_out: true } : p));
  const r = priceCart([{ productId: "canon", packs: 1 }], soldOut);
  assert.ok(!r.ok && r.error === "unavailable");
});

test("bake list totals pieces and flavors", () => {
  const r = priceCart(
    [
      { productId: "conchas", packs: 2, flavors: { vanilla: 2, chocolate: 1 } },
      { productId: "conchas", packs: 1, flavors: { coconut: 3 } },
      { productId: "polvorones", packs: 2 },
    ],
    SEED_PRODUCTS,
  );
  assert.ok(r.ok);
  if (!r.ok) return;
  const t = bakeTotals(r.items);
  assert.deepEqual(t.find((x) => x.id === "conchas"), {
    id: "conchas",
    name: "Conchas",
    pieces: 9,
    flavors: { vanilla: 4, chocolate: 2, coconut: 3 },
  });
  assert.equal(t.find((x) => x.id === "polvorones")?.pieces, 8);
});

test("line keys ignore flavor order", () => {
  assert.equal(
    lineKey({ productId: "conchas", packs: 1, flavors: { vanilla: 2, chocolate: 1 } }),
    lineKey({ productId: "conchas", packs: 5, flavors: { chocolate: 1, vanilla: 2, coconut: 0 } }),
  );
});
