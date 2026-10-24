import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { BRAND } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const description =
  "Homemade pan dulce, baked to order. Conchas, miguelitos, cañones de dulce de leche and more. Pre-order online and pick up fresh.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${BRAND} · Pan dulce, baked to order`, template: `%s · ${BRAND}` },
  description,
  openGraph: {
    title: `${BRAND} · Pan dulce, baked to order`,
    description,
    siteName: BRAND,
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: BRAND }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#fbf5ec" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${fraunces.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
