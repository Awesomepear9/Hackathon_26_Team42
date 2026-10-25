// Frontend-Seite der Stadt: Tile-Formen, Verkehrszeichen (→ board.signs), versteckte Ereignisse.
// Das Frontend liest nur board.map[y][x]; alles Weitere wird hier abgeleitet.
import { POOLS, type EventType } from "./catalog";
import { Engine, exits, key, opp, rng, turn, V, type Agent, type Board, type DiffKey, type Direction, type Signs, type SignType } from "./engine";

export interface Difficulty {
  name: string;
  size: string;
  cars: number;
  events: number;
  color: string;
  dots: number;
  desc: string;
}

export const DIFF: Record<DiffKey, Difficulty> = {
  leicht: { name: "Leicht", size: "9–12", cars: 3, events: 6, color: "bg-green-400", dots: 1, desc: "Kleines Viertel, wenig Verkehr" },
  mittel: { name: "Mittel", size: "15–20", cars: 6, events: 10, color: "bg-yellow-300", dots: 2, desc: "Bahnübergang, Einbahnstraße, mehr Verkehr" },
  schwer: { name: "Schwer", size: "21–25", cars: 10, events: 15, color: "bg-red-400", dots: 3, desc: "Große Stadt, viel Verkehr, alle Schilder" },
};

export const DEG: Record<Direction, number> = { North: 0, East: 90, South: 180, West: 270 };

export function shuffle<T>(a: T[], R: () => number) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface BBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Ausschnitt mit allen Straßen plus ein Feld Rand */
export function bbox(b: Board): BBox {
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  b.map.forEach((row, y) =>
    row.forEach((t, x) => {
      if (t !== "Grass") {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    }),
  );
  const N = b.map.length;
  return { x0: Math.max(0, x0 - 1), y0: Math.max(0, y0 - 1), x1: Math.min(N - 1, x1 + 1), y1: Math.min(N - 1, y1 + 1) };
}

export interface Shape {
  img: string;
  rot: number;
  /** x Kreuzung, t Einmündung, v/h gerade, c Kurve, d Sackgasse */
  kind: "x" | "t" | "v" | "h" | "c" | "d";
}

export function shapeOf(b: Board, x: number, y: number): Shape | null {
  const ex = exits(b, x, y);
  const n = ex.includes("North"), e = ex.includes("East"), s = ex.includes("South"), w = ex.includes("West");
  const c = ex.length;
  if (!c) return null;
  if (c === 4) return { img: "stadt_kreuzung_striche", rot: 0, kind: "x" };
  if (c === 3) return { img: "stadt_t-kreuzung_striche", rot: !n ? 0 : !e ? 90 : !s ? 180 : 270, kind: "t" };
  if (c === 2) {
    if (n && s) return { img: "stadt_gerade_striche", rot: 0, kind: "v" };
    if (e && w) return { img: "stadt_gerade_striche", rot: 90, kind: "h" };
    return { img: "stadt_kurve_striche", rot: s && e ? 0 : s && w ? 90 : n && w ? 180 : 270, kind: "c" };
  }
  return { img: "stadt_sackgasse", rot: s ? 0 : w ? 90 : n ? 180 : 270, kind: "d" };
}

export interface Tile {
  img: string;
  rot: number;
  block?: boolean;
}

/** Tile-Grafik eines Feldes: Schild-Überschreibung, Straßenform oder Häuser/Grün */
export function tileFor(b: Board, x: number, y: number): Tile {
  const ov = b.signs?.tiles[key(x, y)];
  if (ov) return ov;
  const s = shapeOf(b, x, y);
  if (s) return { img: s.img, rot: s.rot };
  const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
  return { img: h % 4 === 0 ? "land_leer" : "stadt", rot: 0, block: true };
}

export const SIGN_IMG: Record<SignType, string> = {
  yield: "schild_vorfahr_gewaehren",
  stop: "schild_stop",
  spiel: "schild_spielstrasse",
  spielEnde: "schild_spielstrasse_ende",
  einbahn: "schild_einbahn_rechts",
  einfahrtVerboten: "schild_durchfahrt_verboten",
  bahn: "schild_andreaskreuz",
};

/** Verkehrszeichen platzieren: Bahnlinie, Spiel- und Einbahnstraßen, Vorfahrt, Zebrastreifen */
export function placeSigns(b: Board, seed: number, diff: DiffKey, start?: { x: number; y: number }): Signs {
  const R = rng(seed ^ 0x2f6b1c3);
  const bb = bbox(b);
  const sg: Signs = { priority: {}, oneway: {}, tiles: {}, kinds: {}, sprites: [] };
  // Schild rechts neben der Fahrbahn für Fahrzeuge, die mit Richtung h das Feld (x,y) befahren
  const signAt = (type: SignType, x: number, y: number, h: Direction, along = -0.36) => {
    const r = V[turn(h, 1)];
    sg.sprites.push({ type, x: x + 0.5 + V[h][0] * along + r[0] * 0.43, y: y + 0.5 + V[h][1] * along + r[1] * 0.43 });
  };
  const shape = (x: number, y: number) => shapeOf(b, x, y);
  // 1) Bahnlinie quer durch eine Zeile, in der jede Straße nur Nord–Süd verläuft
  if (diff !== "leicht" || R() < 0.5) {
    const rows: number[] = [];
    for (let y = bb.y0 + 3; y <= bb.y1 - 3; y++) {
      let ok = true, any = false;
      for (let x = bb.x0; x <= bb.x1; x++) {
        const s = shape(x, y);
        if (s) {
          any = true;
          if (s.kind !== "v") ok = false;
        }
      }
      if (ok && any) rows.push(y);
    }
    if (rows.length) {
      const y = rows[Math.floor(R() * rows.length)];
      for (let x = bb.x0; x <= bb.x1; x++) {
        const k = key(x, y);
        if (shape(x, y)) {
          sg.tiles[k] = { img: "stadt_bahnuebergang", rot: 0 };
          sg.kinds[k] = "bahn";
          signAt("bahn", x, y, "North", 0.1);
          signAt("bahn", x, y, "South", 0.1);
        } else sg.tiles[k] = { img: "stadt_zug", rot: 0 };
      }
    }
  }
  // 2) gerade Abschnitte zwischen Kreuzungen → Spielstraße und Einbahnstraße
  type Run = { axis: "h" | "v"; cells: [number, number][] };
  const runs: Run[] = [];
  for (let y = bb.y0; y <= bb.y1; y++) {
    let cur: [number, number][] = [];
    for (let x = bb.x0; x <= bb.x1 + 1; x++) {
      const s = x <= bb.x1 ? shape(x, y) : null;
      if (s && s.kind === "h" && !sg.kinds[key(x, y)]) cur.push([x, y]);
      else {
        if (cur.length >= 2) runs.push({ axis: "h", cells: cur });
        cur = [];
      }
    }
  }
  for (let x = bb.x0; x <= bb.x1; x++) {
    let cur: [number, number][] = [];
    for (let y = bb.y0; y <= bb.y1 + 1; y++) {
      const s = y <= bb.y1 ? shape(x, y) : null;
      if (s && s.kind === "v" && !sg.kinds[key(x, y)]) cur.push([x, y]);
      else {
        if (cur.length >= 2) runs.push({ axis: "v", cells: cur });
        cur = [];
      }
    }
  }
  const nearStart = (run: Run) => !!start && run.cells.some(([x, y]) => Math.abs(x - start.x) + Math.abs(y - start.y) <= 3);
  for (let i = runs.length - 1; i >= 0; i--) if (nearStart(runs[i])) runs.splice(i, 1);
  shuffle(runs, R);
  const nSpecial = diff === "schwer" ? 2 : 1;
  const spiel = runs.splice(0, nSpecial);
  const einbahn = runs.splice(0, nSpecial);
  spiel.forEach((run) => {
    const [inA, inZ]: Direction[] = run.axis === "h" ? ["East", "West"] : ["South", "North"];
    run.cells.forEach(([x, y]) => {
      const k = key(x, y);
      sg.tiles[k] = { img: "stadt_gerade_spielstrasse", rot: run.axis === "h" ? 90 : 0 };
      sg.kinds[k] = "spiel";
    });
    const A = run.cells[0];
    const Z = run.cells[run.cells.length - 1];
    signAt("spiel", A[0], A[1], inA);
    signAt("spiel", Z[0], Z[1], inZ);
    signAt("spielEnde", A[0], A[1], inZ, 0.36);
    signAt("spielEnde", Z[0], Z[1], inA, 0.36);
  });
  einbahn.forEach((run) => {
    const dirs: Direction[] = run.axis === "h" ? ["East", "West"] : ["South", "North"];
    const d = dirs[Math.floor(R() * 2)];
    const cells = d === "East" || d === "South" ? run.cells : [...run.cells].reverse();
    cells.forEach(([x, y]) => {
      const k = key(x, y);
      sg.oneway[k] = d;
      sg.kinds[k] = "einbahn";
    });
    const A = cells[0];
    const Z = cells[cells.length - 1];
    signAt("einbahn", A[0], A[1], d);
    signAt("einfahrtVerboten", Z[0], Z[1], opp(d));
  });
  // 3) Vorfahrt an Kreuzungen und Einmündungen (sonst rechts vor links)
  for (let y = bb.y0; y <= bb.y1; y++)
    for (let x = bb.x0; x <= bb.x1; x++) {
      const s = shape(x, y);
      if (!s || (s.kind !== "t" && s.kind !== "x")) continue;
      const k = key(x, y);
      const ex = exits(b, x, y);
      if (s.kind === "t" && R() < 0.55) {
        const stem = ex.find((d) => !ex.includes(opp(d)))!;
        const t = R() < 0.3 ? "stop" : "yield";
        sg.priority[k] = { sub: { [stem]: t } };
        sg.tiles[k] = { img: "stadt_t-kreuzung_vorfahrt_striche", rot: s.rot };
      } else if (s.kind === "x" && R() < 0.45) {
        const subs: Direction[] = R() < 0.5 ? ["East", "West"] : ["North", "South"];
        const t = R() < 0.3 ? "stop" : "yield";
        sg.priority[k] = { sub: { [subs[0]]: t, [subs[1]]: t } };
      }
      if (sg.priority[k]) {
        (Object.entries(sg.priority[k].sub) as [Direction, "yield" | "stop"][]).forEach(([arm, t]) =>
          signAt(t, x + V[arm][0], y + V[arm][1], opp(arm), 0.2),
        );
        sg.kinds[k] = "vorfahrt";
      } else sg.kinds[k] = "rvl";
    }
  // 4) Zebrastreifen als Ausstattung
  for (let y = bb.y0; y <= bb.y1; y++)
    for (let x = bb.x0; x <= bb.x1; x++) {
      const s = shape(x, y);
      const k = key(x, y);
      if (!s || sg.kinds[k]) continue;
      if ((s.kind === "h" || s.kind === "v") && R() < 0.07) {
        sg.tiles[k] = { img: "stadt_gerade_zebra", rot: s.kind === "h" ? 90 : 0 };
        sg.kinds[k] = "zebra";
      }
    }
  return sg;
}

export interface CityEvent {
  type: EventType;
  /** Nummer der Frage im Katalog */
  nr: number;
  st: "ok" | "bad" | null;
}

/** Versteckte Ereignisse: zuerst je Feldart eins, dann zufällig (Kreuzungen doppelt gewichtet) */
export function placeEvents(b: Board, sg: Signs, seed: number, diff: DiffKey, start: { x: number; y: number }) {
  const R = rng(seed ^ 0x77aa31);
  const bb = bbox(b);
  const cand: Partial<Record<EventType, string[]>> = {};
  for (let y = bb.y0; y <= bb.y1; y++)
    for (let x = bb.x0; x <= bb.x1; x++) {
      const s = shapeOf(b, x, y);
      if (!s) continue;
      if (Math.abs(x - start.x) + Math.abs(y - start.y) < 3) continue;
      const t: EventType | null = sg.kinds[key(x, y)] ?? (s.kind === "h" || s.kind === "v" || s.kind === "c" ? "strasse" : null);
      if (!t || !POOLS[t]) continue;
      (cand[t] ??= []).push(key(x, y));
    }
  Object.values(cand).forEach((a) => shuffle(a, R));
  const picked: [EventType, string][] = [];
  const n = DIFF[diff].events;
  (["bahn", "spiel", "einbahn", "vorfahrt", "rvl", "zebra"] as EventType[]).forEach((t) => {
    const list = cand[t];
    if (list?.length && picked.length < n) picked.push([t, list.shift()!]);
  });
  const rest: [EventType, string][] = [];
  (Object.entries(cand) as [EventType, string[]][]).forEach(([t, a]) =>
    a.forEach((k) => {
      rest.push([t, k]);
      if (t === "rvl" || t === "vorfahrt") rest.push([t, k]);
    }),
  );
  shuffle(rest, R);
  for (const [t, k] of rest) {
    if (picked.length >= n) break;
    if (!picked.some((p) => p[1] === k)) picked.push([t, k]);
  }
  const used = new Set<number>();
  const ev: Record<string, CityEvent> = {};
  picked.forEach(([t, k]) => {
    const fresh = POOLS[t].filter((nr) => !used.has(nr));
    const pool = fresh.length ? fresh : POOLS[t];
    const nr = pool[Math.floor(R() * pool.length)];
    used.add(nr);
    ev[k] = { type: t, nr, st: null };
  });
  return ev;
}

/** Stadt für Vorschauen (Startseite, Übersicht): Karte, Schilder und Fahrzeuge zum Start */
export function demoCity(diff: DiffKey, seed: number) {
  const board = Engine.generate_board(diff, seed);
  const state = Engine.new_game(board, diff, seed);
  board.signs = placeSigns(board, seed, diff, state.player);
  return { board, player: state.player, vehicles: state.vehicles };
}

/** Position auf der rechten Fahrspur (in Feld-Koordinaten) */
export function laneXY(a: Pick<Agent, "x" | "y" | "heading">) {
  const o = 0.17;
  const r = V[turn(a.heading, 1)];
  return { x: a.x + 0.5 + r[0] * o, y: a.y + 0.5 + r[1] * o };
}

/** Sichtbarkeit unter dem Nebel: 2 sichtbar (2 Felder um dich), 1 schon erkundet, 0 verdeckt */
export function visibility(player: Pick<Agent, "x" | "y">, visited: [number, number][], x: number, y: number): 0 | 1 | 2 {
  if (Math.max(Math.abs(player.x - x), Math.abs(player.y - y)) <= 2) return 2;
  for (const [vx, vy] of visited) if (Math.max(Math.abs(vx - x), Math.abs(vy - y)) <= 1) return 1;
  return 0;
}
