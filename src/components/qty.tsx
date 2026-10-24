"use client";

import { MinusIcon, PlusIcon } from "./icons";

export function Qty({
  value,
  onChange,
  min = 0,
  max = 24,
  label,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "size-9" : "size-11";
  return (
    <div className="inline-flex items-center rounded-full bg-cobalt p-1 text-cream" role="group" aria-label={label}>
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full hover:bg-cobalt-deep disabled:opacity-35`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`${label}: −1`}
      >
        <MinusIcon />
      </button>
      <span className="w-7 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full hover:bg-cobalt-deep disabled:opacity-35`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`${label}: +1`}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
