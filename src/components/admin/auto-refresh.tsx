"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Keeps the dashboard live: re-fetches every 20s while the tab is visible (and
 * right away when she comes back to it), and shows a banner when new orders
 * arrive.
 */
export function AutoRefresh({ newCount, seconds = 20 }: { newCount: number; seconds?: number }) {
  const router = useRouter();
  const prev = useRef(newCount);
  const [arrived, setArrived] = useState(0);

  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && router.refresh();
    const id = setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);

  useEffect(() => {
    if (newCount > prev.current) {
      setArrived(newCount - prev.current);
    }
    prev.current = newCount;
    document.title = newCount > 0 ? `(${newCount}) New orders · JJ Dashboard` : "Orders · JJ Dashboard";
  }, [newCount]);

  if (!arrived) return null;
  return (
    <button
      type="button"
      onClick={() => setArrived(0)}
      className="anim-sheet fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm rounded-2xl bg-terracotta px-5 py-4 text-left font-bold text-white shadow-lift"
    >
      🎉 {arrived} new {arrived === 1 ? "order" : "orders"} just came in
      <span className="block text-sm font-normal opacity-85">Tap to dismiss</span>
    </button>
  );
}
