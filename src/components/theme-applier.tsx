"use client";

import { useLayoutEffect } from "react";

export function ThemeApplier() {
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const dark =
        stored === "dark" ||
        (stored === null &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    } catch {
      return;
    }
  }, []);

  return null;
}