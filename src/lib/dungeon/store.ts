"use client";

// Gemeinsamer Spielstand für Übersicht und Spiel. Gespeichert wird nur lokal im Browser
// (Schlüssel wie im Prototyp: digifl-run und digifl-stats).
import { useSyncExternalStore } from "react";
import type { Run } from "./city";
import { defaultStats, type Draft, type Stats } from "./engine";

const RUN_KEY = "digifl-run";
const STATS_KEY = "digifl-stats";

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Speicher voll oder gesperrt: Spiel läuft ohne Speichern weiter
  }
}

let state: Draft | null = null;
const listeners = new Set<() => void>();

function current(): Draft {
  state ??= { run: load<Run | null>(RUN_KEY, null), stats: load<Stats>(STATS_KEY, defaultStats()) };
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Führt eine Aktion auf einer Kopie aus, speichert und benachrichtigt */
export function act(action: (draft: Draft) => void) {
  const draft = structuredClone(current());
  action(draft);
  state = draft;
  save(RUN_KEY, draft.run);
  save(STATS_KEY, draft.stats);
  listeners.forEach((l) => l());
}

export function resetProgress() {
  try {
    localStorage.removeItem(RUN_KEY);
    localStorage.removeItem(STATS_KEY);
  } catch {
    // nichts zu löschen
  }
  state = { run: null, stats: defaultStats() };
  listeners.forEach((l) => l());
}

/** Spielstand; null beim Server-Rendering und vor der Hydration */
export function useDungeon(): Draft | null {
  return useSyncExternalStore(subscribe, current, () => null);
}
