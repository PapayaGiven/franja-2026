import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BannerStrip } from "@/components/nav/BannerStrip";
import { UpcomingFavoriteBanner } from "@/components/nav/UpcomingFavoriteBanner";
import { BottomNav } from "@/components/nav/BottomNav";

// Inter via next/font — exposed to Tailwind v4 via the --font-inter
// CSS variable (consumed by --font-sans in globals.css).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FRANJA 2026",
  description: "Estilo de vida, visión, moda y negocios",
  openGraph: {
    title: "FRANJA 2026",
    description: "Estilo de vida, visión, moda y negocios",
    type: "website",
    locale: "es_CO",
  },
};

/**
 * Root layout — the public chrome (banner strip, upcoming-favorite
 * banner, bottom nav) lives here directly rather than in a
 * `(public)` route group. The route group setup hit a 404-at-runtime
 * regression on Next 16 + Vercel even though the build emitted the
 * routes, so we flattened to the canonical structure.
 *
 * If we later add /admin we'll wrap it in its own route group or use
 * a per-route layout to bypass this chrome.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <BannerStrip />
        <UpcomingFavoriteBanner />
        <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 pb-24 pt-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
