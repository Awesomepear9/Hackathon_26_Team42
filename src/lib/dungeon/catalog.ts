// Gliederung des amtlichen Fragenkatalogs und Zuordnung der Team-Fragen (fragen.ts) zu Themen.
// Gesamtzahlen pro Bereich und Startwerte sind Beispieldaten.

export interface Category {
  group: "Grundstoff" | "Zusatzstoff Klasse B";
  code: string;
  name: string;
  total: number;
}

export const CATS: Category[] = [
  { group: "Grundstoff", code: "1.1", name: "Gefahrenlehre", total: 182 },
  { group: "Grundstoff", code: "1.2", name: "Verhalten im Straßenverkehr", total: 264 },
  { group: "Grundstoff", code: "1.3", name: "Vorfahrt, Vorrang", total: 74 },
  { group: "Grundstoff", code: "1.4", name: "Verkehrszeichen", total: 148 },
  { group: "Grundstoff", code: "1.5", name: "Umweltschutz", total: 26 },
  { group: "Grundstoff", code: "1.7", name: "Technik", total: 38 },
  { group: "Grundstoff", code: "1.8", name: "Eignung und Befähigung", total: 30 },
  { group: "Zusatzstoff Klasse B", code: "2.1", name: "Gefahrenlehre", total: 88 },
  { group: "Zusatzstoff Klasse B", code: "2.2", name: "Verhalten im Straßenverkehr", total: 72 },
  { group: "Zusatzstoff Klasse B", code: "2.4", name: "Verkehrszeichen", total: 56 },
  { group: "Zusatzstoff Klasse B", code: "2.5", name: "Umweltschutz", total: 18 },
  { group: "Zusatzstoff Klasse B", code: "2.7", name: "Technik", total: 64 },
];

export const DEMO_DONE: Record<string, number> = {
  "1.1": 96, "1.2": 121, "1.3": 58, "1.4": 83, "1.5": 19, "1.7": 12,
  "1.8": 21, "2.1": 31, "2.2": 24, "2.4": 30, "2.5": 6, "2.7": 9,
};

/** Art eines Ereignisfeldes: bestimmt, aus welchem Themen-Pool die Frage kommt */
export type EventType = "rvl" | "vorfahrt" | "spiel" | "einbahn" | "bahn" | "zebra" | "strasse";

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** Fragen-Nummern je Feldart */
export const POOLS: Record<EventType, number[]> = {
  rvl: range(1, 20),
  vorfahrt: [21, 37, 84, 85, 86, 87, 93, 94, 99],
  spiel: [22, 23, 24, 25, 28, 31, 32, 33, 36, 39],
  einbahn: [41, 42, 43, 44, 45, 46, 48, 49, 50, 51, 52, 53, 54, 60],
  bahn: [81, 82, 83, 88, 89, 90, 91, 92, 95, 96, 98, 100],
  zebra: [12, 28, 33, 74],
  strasse: [26, 27, 29, 30, 34, 35, 38, 40, 47, 55, 56, 57, 58, 59, ...range(61, 80), 97],
};

export const TYPE_NAME: Record<EventType, string> = {
  rvl: "Kreuzung ohne Schilder",
  vorfahrt: "Vorfahrt geregelt",
  spiel: "Verkehrsberuhigter Bereich",
  einbahn: "Einbahnstraße",
  bahn: "Bahnübergang",
  zebra: "Fußgängerüberweg",
  strasse: "Unterwegs",
};

/** Katalogbereich einer Team-Frage */
export function catOf(nr: number) {
  if (nr <= 20 || [84, 85, 86, 87, 93, 94, 99].includes(nr)) return "1.3";
  if ((nr >= 41 && nr <= 46) || [48, 49, 52, 59, 97].includes(nr)) return "1.4";
  if ((nr >= 67 && nr <= 73) || nr === 75) return "1.1";
  return "1.2";
}

/** Verkehrszeichen-Nummer → Pixel-Schild (für Fragen mit Zeichen im Text) */
export const QSIGN: Record<string, string> = {
  "201": "schild_andreaskreuz",
  "220": "schild_einbahn_rechts",
  "267": "schild_durchfahrt_verboten",
  "325.1": "schild_spielstrasse",
  "325.2": "schild_spielstrasse_ende",
  "205": "schild_vorfahr_gewaehren",
  "206": "schild_stop",
};

export const catName = (code: string) => CATS.find((c) => c.code === code)?.name ?? "";
