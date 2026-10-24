import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/logo";
import { requireAdmin } from "@/lib/auth";
import { usingSupabase } from "@/lib/db";
import { logout } from "../actions";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · JJ Dashboard" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-cream-deep/50">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <Link href="/admin" className="mr-auto">
            <Logo className="h-10" />
          </Link>
          <Link href="/" className="hidden text-sm font-semibold text-cocoa-soft hover:text-cocoa sm:block" target="_blank">
            View site ↗
          </Link>
          <form action={logout}>
            <button className="rounded-full px-3 py-2 text-sm font-semibold text-cocoa-soft hover:bg-cream-deep">Log out</button>
          </form>
        </div>
        <AdminNav />
      </header>
      {!usingSupabase && (
        <p className="bg-marigold-soft px-4 py-2 text-center text-xs font-semibold">
          Demo mode: orders are saved on this computer only. Connect Supabase before going live.
        </p>
      )}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24">{children}</main>
    </div>
  );
}
