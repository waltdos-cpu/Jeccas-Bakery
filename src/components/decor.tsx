/** Sticker-style starburst badge, e.g. "3 for $5". */
export function Starburst({
  children,
  className = "relative",
  color = "var(--color-marigold)",
  size = 132,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
  size?: number;
}) {
  const points = 18;
  const d = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 43;
    const a = (Math.PI * i) / points - Math.PI / 2;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
  return (
    <div className={`grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full drop-shadow-[3px_3px_0_var(--color-cocoa)]" aria-hidden>
        <polygon points={d} fill={color} stroke="var(--color-cocoa)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <div className="relative text-center leading-none text-cocoa">{children}</div>
    </div>
  );
}

/** Hand-drawn underline for a highlighted word. */
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 16" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M3 10 C 30 3, 45 14, 70 8 S 115 3, 140 9 S 180 12, 197 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Scalloped edge that hangs below a colored section. */
export function Scallop({ color = "var(--color-cobalt)", className = "" }: { color?: string; className?: string }) {
  return <div aria-hidden className={`scallop-bottom ${className}`} style={{ "--scallop-color": color } as React.CSSProperties} />;
}

/** Endless scrolling ticker of product names. */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          <span className="display px-6 text-2xl whitespace-nowrap sm:text-3xl">{it}</span>
          <Flower className="size-6 shrink-0 text-marigold" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div className="animate-marquee flex w-max">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}

/** Four-petal Talavera flower. */
export function Flower({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <g fill="currentColor">
        <path d="M20 4c5 6 5 10 0 16c-5-6-5-10 0-16zM20 36c5-6 5-10 0-16c-5 6-5 10 0 16zM4 20c6-5 10-5 16 0c-6 5-10 5-16 0zM36 20c-6-5-10-5-16 0c6 5 10 5 16 0z" />
      </g>
      <circle cx="20" cy="20" r="3" fill="var(--color-cream)" />
    </svg>
  );
}
