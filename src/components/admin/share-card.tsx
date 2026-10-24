"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** Site link + QR code she can print for bags, flyers, and the counter. */
export function ShareCard({ url }: { url: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 640, margin: 1, color: { dark: "#1d3fa3", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [url]);

  return (
    <aside className="rounded-[1.5rem] bg-paper p-5 shadow-card lg:sticky lg:top-32">
      <h2 className="text-2xl">Share your shop</h2>
      <p className="mt-1 text-sm text-cocoa-soft">Print the QR code for bags and flyers, or send the link to customers.</p>
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element -- generated data URL
        <img src={qr} alt={`QR code for ${url}`} className="mt-4 w-full rounded-xl border border-line" />
      )}
      <p className="mt-3 truncate rounded-xl bg-cream-deep px-3 py-2 font-mono text-sm">{url}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="btn btn-cobalt flex-1 !py-3"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* clipboard blocked */
            }
          }}
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        {qr && (
          <a href={qr} download="jj-baked-goods-qr.png" className="btn btn-outline flex-1 !py-3 text-cobalt">
            Save QR
          </a>
        )}
      </div>
    </aside>
  );
}
