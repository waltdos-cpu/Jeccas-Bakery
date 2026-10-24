import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Single-owner admin login: one password (ADMIN_PASSWORD) and a signed,
// HTTP-only session cookie. Every admin page AND every admin server action
// must call requireAdmin(), because server actions are public endpoints.

const COOKIE = "jj_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function config() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (password && secret && secret.length >= 32) return { password, secret };
  if (process.env.NODE_ENV !== "production") {
    return { password: password || "bakery", secret: secret || "dev-only-secret-dev-only-secret-00" };
  }
  return null; // admin disabled until configured
}

export const adminConfigured = () => config() !== null;

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  const c = config();
  if (!c) return false;
  // compare HMACs so lengths always match
  return safeEqual(sign(input, c.secret), sign(c.password, c.secret));
}

export async function startSession() {
  const c = config()!;
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp, c.secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const c = config();
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!c || !raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || !safeEqual(sig, sign(exp, c.secret))) return false;
  return Number(exp) > Date.now() / 1000;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
