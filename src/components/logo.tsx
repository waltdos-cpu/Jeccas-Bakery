import Image from "next/image";

// Final logo (concept No. 22, "Conchita"). Source files live in public/brand/;
// the lettering is outlined, so the logo looks the same everywhere.
const W = 414, H = 90;

export function Logo({ light = false, className = "h-11 sm:h-12" }: { light?: boolean; className?: string }) {
  return (
    <Image
      src={light ? "/brand/jj-logo-horizontal-light.svg" : "/brand/jj-logo-horizontal.svg"}
      alt="JJ Baked Goods"
      width={W}
      height={H}
      className={`${className} w-auto`}
      unoptimized
      priority
    />
  );
}

export function Mascot({ className = "h-20" }: { className?: string }) {
  return <Image src="/brand/jj-mascot.svg" alt="" width={110} height={80} className={`${className} w-auto`} unoptimized />;
}
