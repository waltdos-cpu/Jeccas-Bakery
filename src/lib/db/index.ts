import "server-only";
import { randomInt } from "node:crypto";
import { localRepo } from "./local";
import { supabaseRepo } from "./supabase";
import { DuplicateCodeError, type Repo } from "./types";
import type { NewOrder } from "../types";

export const usingSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

function pick(): Repo {
  if (usingSupabase) return supabaseRepo;
  // The local JSON store needs a writable disk, which hosts like Vercel and
  // Netlify don't have, so production always requires Supabase.
  if (process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in production.");
  }
  return localRepo;
}

export const repo: Repo = new Proxy({} as Repo, {
  get: (_, key: keyof Repo) => pick()[key],
});

/** Bakery timezone for all scheduling. */
export const BAKERY_TZ = process.env.BAKERY_TZ || "America/New_York";

// No 0/O/1/I/L so codes are easy to read aloud over the phone.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function newOrderCode(): string {
  let s = "";
  for (let i = 0; i < 5; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `JJ-${s}`;
}

/** Place an order, retrying on the (rare) duplicate order code. */
export async function placeOrderWithCode(order: Omit<NewOrder, "code">) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newOrderCode();
    try {
      const res = await repo.placeOrder({ ...order, code });
      return res.ok ? { ...res, code } : res;
    } catch (e) {
      if (!(e instanceof DuplicateCodeError)) throw e;
    }
  }
  throw new Error("Could not generate a unique order code");
}
