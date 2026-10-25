import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Footer, Header } from "@/components/site-chrome";
import { ThemeApplier } from "@/components/theme-applier";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const silkscreen = localFont({
  src: "./fonts/Silkscreen-Regular.ttf",
  variable: "--font-silkscreen",
  display: "block",
});

const pixelify = localFont({
  src: "./fonts/PixelifySans-Medium.ttf",
  variable: "--font-pixelify",
  display: "block",
});

export const metadata: Metadata = {
  title: {
    default: "DigiFL Theorie-Dungeon",
    template: "%s · DigiFL",
  },
  description:
    "Führerschein-Theorie lernen, als würdest du schon fahren: Fahr durch eine Pixel-Stadt und lerne die Regeln genau dort, wo du sie brauchst.",
  icons: { icon: { url: "/digifl-logo.svg#icon", type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${silkscreen.variable} ${pixelify.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- muss vor Hydration synchron laufen (FOUC-Schutz) */}
        <script src="/theme-init.js" />
      </head>
      <body className="flex min-h-full flex-col bg-surface font-sans text-primary transition-colors dark:bg-navy-950 dark:text-navy-100">
        <ThemeApplier />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-900"
        >
          Zum Inhalt springen
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}