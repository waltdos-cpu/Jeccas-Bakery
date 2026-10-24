"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["/admin", "Orders"],
  ["/admin/menu", "Menu"],
  ["/admin/requests", "Requests"],
  ["/admin/settings", "Settings"],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2">
      {TABS.map(([href, label]) => {
        const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              on ? "bg-cobalt text-cream" : "text-cocoa-soft hover:bg-cream-deep"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
