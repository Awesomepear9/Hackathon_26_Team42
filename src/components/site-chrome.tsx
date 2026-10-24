"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Start" },
  { href: "/lernen", label: "Lernen" },
  { href: "/pruefung", label: "Prüfung" },
  { href: "/karte", label: "Karte" },
];

const SOCIAL_LINKS = [
  { href: "https://github.com", label: "GitHub" },
  { href: "https://opencollective.com", label: "Open Collective" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-white shadow-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold">
          Fahrkompetenz
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy-100 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-white transition-colors hover:bg-navy-800 md:hidden"
          aria-expanded={open}
          aria-label="Menü öffnen"
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="border-t border-navy-800 md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-navy-100 transition-colors hover:bg-navy-800 hover:text-accent"
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
    <footer className="border-t border-navy-200 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div>
          <p className="font-semibold text-primary">Fahrkompetenz</p>
          <p className="mt-1 text-sm text-navy-500">
            Lernplattform für Fahrschulkompetenzen.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-navy-500 transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-navy-200">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <p className="text-sm text-navy-400">
            © 2026 Fahrkompetenz – Open Source.
          </p>
        </div>
      </div>
    </footer>
  );
}