import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "https://assets.unlayer.com/projects/237/1779221268527-Imagen-02%20(1).png",
    shortcut: "https://assets.unlayer.com/projects/237/1779221268527-Imagen-02%20(1).png",
    apple: "https://assets.unlayer.com/projects/237/1779221268527-Imagen-02%20(1).png",
  },
  openGraph: {
    title: "FRANJA 2026",
    description: "Estilo de vida, visión, moda y negocios",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "https://assets.unlayer.com/projects/237/1779221268527-Imagen-02%20(1).png",
        width: 512,
        height: 512,
        alt: "FRANJA 2026",
      },
    ],
  },
};

/**
 * Root layout — the public chrome (banner strip, upcoming-favorite
 * banner, bottom nav) lives here directly rather than in a `(public)`
 * route group. The route group setup hit a 404-at-runtime regression on
 * Next 16 + Vercel even though the build emitted the routes, so we
 * flattened to the canonical structure.
 *
 * /admin/* still flows through this layout (Next layouts always wrap
 * their children) so we read `x-pathname` injected by middleware and
 * skip the public chrome + the narrow mobile container on those routes.
 * The admin shell brings its own chrome via `app/admin/layout.tsx`.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {isAdmin ? (
          children
        ) : (
          <>
            <BannerStrip />
            <UpcomingFavoriteBanner />
            <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 pb-32 pt-6">
            {children}
            </main>
            <a
              href="https://franjavisual.co/registrate-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-franja-turquoise px-5 py-3 text-sm font-semibold text-franja-bg shadow-lg shadow-franja-turquoise/25 transition hover:scale-105 hover:bg-white"
            >
              Comprar tiquetes
            </a>

            <BottomNav />
          </>
        )}
      </body>
    </html>
  );
}
