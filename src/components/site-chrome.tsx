"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/", label: "Start" },
  { href: "/uebersicht", label: "Übersicht" },
  { href: "/praxismodul", label: "Praxismodul" },
];

const PLAY_LINK = { href: "/spiel", label: "Jetzt spielen" };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 dark:focus-visible:ring-accent";

function ThemeToggle() {
  // Server und Hydration rendern hell, danach gilt die .dark-Klasse von theme-init.js
  const dark = useSyncExternalStore(
    (cb) => {
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  const toggle = () => {
    const next = !dark;
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
      className="rounded-md p-2 text-navy-700 transition-colors hover:bg-navy-100 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 dark:text-navy-100 dark:hover:bg-navy-800 dark:hover:text-white dark:focus-visible:ring-accent"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-navy-200 bg-white/90 text-primary backdrop-blur transition-colors dark:border-navy-800 dark:bg-navy-950/90 dark:text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" className={`rounded-md ${focusRing}`} aria-label="DigiFL – zur Startseite">
          <Logo className="h-8" alt="" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hauptnavigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${focusRing} ${
                isActive(link.href)
                  ? "bg-navy-50 font-semibold text-primary dark:bg-navy-800 dark:text-white"
                  : "text-navy-600 hover:text-cyan-800 dark:text-navy-200 dark:hover:text-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={PLAY_LINK.href}
            aria-current={isActive(PLAY_LINK.href) ? "page" : undefined}
            className={`ml-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700 dark:bg-accent dark:text-navy-900 dark:hover:bg-cyan-400 ${focusRing}`}
          >
            {PLAY_LINK.label}
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href={PLAY_LINK.href}
            className={`rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white md:hidden dark:bg-accent dark:text-navy-900 ${focusRing}`}
          >
            Spielen
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-navy-700 transition-colors hover:bg-navy-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 md:hidden dark:text-navy-100 dark:hover:bg-navy-800 dark:focus-visible:ring-accent"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
          >
            {open ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          className="border-t border-navy-200 dark:border-navy-800 md:hidden"
          aria-label="Mobile Navigation"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {[...NAV_LINKS, PLAY_LINK].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-navy-100 hover:text-cyan-800 dark:hover:bg-navy-800 dark:hover:text-accent ${focusRing} ${
                  isActive(link.href) ? "bg-navy-50 text-primary dark:bg-navy-800 dark:text-white" : "text-navy-700 dark:text-navy-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-navy-200 bg-surface transition-colors dark:border-navy-800 dark:bg-navy-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-md">
          <Logo className="h-9" alt="DigiFL – Digitaler Fahrlehrer" />
          <p className="mt-3 text-sm text-navy-600 dark:text-navy-300">Theorie-Dungeon · Prototyp für den Hackathon Fulda 2026</p>
          <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">
            Dein Fortschritt wird nur lokal in diesem Browser gespeichert. Alle Fragen sind Beispielfragen.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Fußzeilennavigation">
          {[...NAV_LINKS, { href: "/spiel", label: "Spielen" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded text-sm font-medium text-navy-700 underline-offset-2 transition-colors hover:text-cyan-800 hover:underline dark:text-navy-200 dark:hover:text-accent ${focusRing}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-navy-200 dark:border-navy-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <p className="text-sm text-navy-600 dark:text-navy-300">
            © 2026 Team DigiFL · Schriften: Silkscreen, Pixelify Sans (SIL OFL), Inter.
          </p>
        </div>
      </div>
    </footer>
  );
}
