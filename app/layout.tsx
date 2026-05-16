import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
