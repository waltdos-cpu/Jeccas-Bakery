import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { login } from "../actions";

export const metadata: Metadata = { title: "Bakery login", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const setup = !adminConfigured() || error === "setup";

  return (
    <main className="tile-lines grid min-h-screen place-items-center bg-cobalt px-4">
      <form action={login} className="w-full max-w-sm rounded-[2rem] bg-cream p-8 shadow-lift">
        <Logo />
        <h1 className="mt-6 text-4xl">Bakery login</h1>
        {setup ? (
          <p className="mt-4 rounded-xl bg-marigold-soft p-4 text-sm">
            Admin login isn&apos;t set up yet. Add <code>ADMIN_PASSWORD</code> and <code>SESSION_SECRET</code> to the
            site&apos;s environment variables.
          </p>
        ) : (
          <>
            <label className="mt-6 block">
              <span className="label">Password</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="field"
                required
                autoFocus
                aria-invalid={error === "1"}
              />
            </label>
            {error === "1" && <p className="mt-2 text-sm font-semibold text-terracotta-dark">Wrong password. Try again.</p>}
            <button className="btn btn-cobalt mt-6 w-full !py-4">Log in</button>
          </>
        )}
      </form>
    </main>
  );
}
