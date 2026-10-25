// Stadt-Generator, Tile-Auswahl und Deko. Jeder Run erzeugt aus einem Seed ein neues Straßennetz.
// Rasterzeichen: "." Häuser, "g" Grün, "z" Gleis ohne Straße, "#" Straße, sonst Feldart (siehe EventKind).
import { QUESTIONS, type EventKind } from "./catalog";

export type Dir = "N" | "E" | "S" | "W";
export const DIRS: Dir[] = ["N", "E", "S", "W"];
export const DV: Record<Dir, [number, number]> = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };
export const DEG: Record<Dir, number> = { N: 0, E: 90, S: 180, W: 270 };
export const turn = (d: Dir, k: number): Dir => DIRS[(DIRS.indexOf(d) + k + 4) % 4];

export type DiffKey = "leicht" | "mittel" | "schwer";

export interface Difficulty {
  name: string;
  w: number;
  h: number;
  events: number;
  rail: boolean;
  color: string;
  dots: number;
  desc: string;
}

export const DIFF: Record<DiffKey, Difficulty> = {
  leicht: { name: "Leicht", w: 9, h: 7, events: 6, rail: false, color: "bg-green-400", dots: 1, desc: "Kleines Viertel, viele Grundsituationen" },
  mittel: { name: "Mittel", w: 13, h: 9, events: 10, rail: true, color: "bg-yellow-300", dots: 2, desc: "Mehr Kreuzungen, Bahnübergang, Kreisverkehr" },
  schwer: { name: "Schwer", w: 17, h: 11, events: 15, rail: true, color: "bg-red-400", dots: 3, desc: "Große Stadt, alle Themen, mehr Ablenkung" },
};

export interface Pos {
  r: number;
  c: number;
}

export interface CityEvent {
  kind: EventKind;
  qid: string;
  st: "ok" | "bad" | null;
}

export interface LogEntry {
  t: string;
  tone?: "good" | "bad";
}

export interface Run {
  diff: DiffKey;
  seed: number;
  w: number;
  h: number;
  grid: string[];
  events: Record<string, CityEvent>;
  pos: Pos;
  dir: Dir;
  speed: number;
  fp: number;
  visited: string[];
  want: "left" | "right" | null;
  log: LogEntry[];
  active: string | null;
  over: "won" | "lost" | null;
}

/** Deterministischer Zufall (mulberry32) */
export function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lines(size: number, R: () => number) {
  const a = [0];
  let p = 0;
  for (;;) {
    p += 3 + (R() < 0.45 ? 1 : 0);
    if (p > size - 4) break;
    a.push(p);
  }
  a.push(size - 1);
  return a;
}

const SPECIAL = "XVKWTZBSP";

export function generate(diffKey: DiffKey, seed: number): Run {
  const D = DIFF[diffKey];
  const R = rng(seed);
  const W = D.w;
  const H = D.h;
  const rows = lines(H, R);
  const cols = lines(W, R);
  const g: string[][] = Array.from({ length: H }, (_, r) =>
    Array.from({ length: W }, (_, c) => (rows.includes(r) || cols.includes(c) ? "#" : R() < 0.28 ? "g" : ".")),
  );
  // innere Abschnitte zufällig entfernen
  rows.slice(1, -1).forEach((r) => {
    for (let i = 0; i < cols.length - 1; i++)
      if (R() < 0.22) for (let c = cols[i] + 1; c < cols[i + 1]; c++) g[r][c] = R() < 0.3 ? "g" : ".";
  });
  cols.slice(1, -1).forEach((c) => {
    for (let i = 0; i < rows.length - 1; i++)
      if (R() < 0.22) for (let r = rows[i] + 1; r < rows[i + 1]; r++) g[r][c] = R() < 0.3 ? "g" : ".";
  });
  const road = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < H && c < W && g[r][c] !== "." && g[r][c] !== "g" && g[r][c] !== "z";
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++)
      if (road(r, c) && !(road(r - 1, c) || road(r + 1, c) || road(r, c - 1) || road(r, c + 1))) g[r][c] = ".";
  // Gleise
  if (D.rail) {
    const cand: number[] = [];
    for (let r = 2; r < H - 2; r++) if (!rows.includes(r)) cand.push(r);
    const rr = cand[Math.floor(R() * cand.length)];
    for (let c = 0; c < W; c++) g[rr][c] = road(rr, c) ? "B" : "z";
  }
  // Sonderfelder
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      if (!road(r, c) || g[r][c] === "B") continue;
      const n = road(r - 1, c), e = road(r, c + 1), s = road(r + 1, c), w = road(r, c - 1);
      const cnt = +n + +e + +s + +w;
      const x = R();
      if (cnt === 4) g[r][c] = x < 0.34 ? "X" : x < 0.72 ? "V" : "K";
      else if (cnt === 3) g[r][c] = x < 0.5 ? "W" : "T";
      else if (cnt === 2 && ((n && s) || (e && w))) g[r][c] = x < 0.12 ? "Z" : x < 0.19 ? "P" : x < 0.25 ? "S" : "#";
    }
  const grid = g.map((r) => r.join(""));
  // Start: gerades Stück in der untersten Reihe
  let start: Pos | null = null;
  for (let c = 1; c < W - 1 && !start; c++) if (grid[H - 1][c] === "#") start = { r: H - 1, c };
  if (!start) start = { r: H - 1, c: 1 };
  // Ereignisse
  const special: [number, number][] = [];
  const plain: [number, number][] = [];
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      const ch = grid[r][c];
      if (Math.abs(r - start.r) + Math.abs(c - start.c) < 2) continue;
      if (SPECIAL.includes(ch)) special.push([r, c]);
      else if (ch === "#") plain.push([r, c]);
    }
  const shuffle = <T,>(a: T[]) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  shuffle(special);
  shuffle(plain);
  const nSpecial = Math.min(special.length, Math.round(D.events * 0.8));
  const picks = special.slice(0, nSpecial).concat(plain.slice(0, D.events - nSpecial));
  const used = new Set<string>();
  const events: Record<string, CityEvent> = {};
  picks.forEach(([r, c]) => {
    const kind = (SPECIAL.includes(grid[r][c]) ? grid[r][c] : "U") as EventKind;
    const pool = QUESTIONS.filter((q) => q.kinds.includes(kind));
    const fresh = pool.filter((q) => !used.has(q.id));
    const from = fresh.length ? fresh : pool;
    const q = from[Math.floor(R() * from.length)];
    used.add(q.id);
    events[r + "," + c] = { kind, qid: q.id, st: null };
  });
  return {
    diff: diffKey, seed, w: W, h: H, grid, events, pos: start, dir: "E", speed: 0, fp: 0,
    visited: [start.r + "," + start.c], want: null,
    log: [{ t: `Run gestartet: ${D.name}. Gib Gas!` }],
    active: null, over: null,
  };
}

type City = Pick<Run, "w" | "h" | "grid">;

export function isRoad(G: City, r: number, c: number) {
  if (r < 0 || c < 0 || r >= G.h || c >= G.w) return false;
  const ch = G.grid[r][c];
  return ch !== "." && ch !== "g" && ch !== "z";
}

export function exits(G: City, r: number, c: number) {
  return DIRS.filter((d) => isRoad(G, r + DV[d][0], c + DV[d][1]));
}

export interface Tile {
  img: string;
  rot: number;
  block?: boolean;
}

const BASE: Record<string, string> = {
  X: "stadt_kreuzung_durch", V: "stadt_kreuzung_striche", K: "stadt_kreisverkehr", B: "stadt_bahnuebergang",
  Z: "stadt_gerade_zebra", P: "stadt_parken", S: "stadt_gerade_spielstrasse", W: "stadt_t-kreuzung_vorfahrt_striche",
};

/** Tile-Grafik eines Feldes inkl. Drehung */
export function tileFor(G: City, r: number, c: number): Tile {
  if (r < 0 || c < 0 || r >= G.h || c >= G.w) return { img: "stadt", rot: 0, block: true };
  const ch = G.grid[r][c];
  if (ch === ".") return { img: "stadt", rot: 0, block: true };
  if (ch === "g") return { img: "land_leer", rot: 0, block: true };
  if (ch === "z") return { img: "stadt_zug", rot: 0 };
  const ex = exits(G, r, c);
  const n = ex.includes("N"), e = ex.includes("E"), s = ex.includes("S"), w = ex.includes("W");
  let img: string;
  let rot = 0;
  if (ex.length === 4) img = "stadt_kreuzung_striche";
  else if (ex.length === 3) {
    img = "stadt_t-kreuzung_striche";
    rot = !n ? 0 : !e ? 90 : !s ? 180 : 270;
  } else if (ex.length === 2) {
    if (n && s) img = "stadt_gerade_striche";
    else if (e && w) {
      img = "stadt_gerade_striche";
      rot = 90;
    } else {
      img = "stadt_kurve_striche";
      rot = s && e ? 0 : s && w ? 90 : n && w ? 180 : 270;
    }
  } else {
    img = "stadt_sackgasse";
    rot = s ? 0 : w ? 90 : n ? 180 : 270;
  }
  if (BASE[ch]) img = BASE[ch];
  return { img, rot };
}

export interface Decor {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Ampeln und Schilder am Straßenrand (in Feld-Koordinaten) */
export function decor(G: City): Decor[] {
  const out: Decor[] = [];
  for (let r = 0; r < G.h; r++)
    for (let c = 0; c < G.w; c++) {
      const ch = G.grid[r][c];
      if (ch === "X")
        out.push(
          { src: "/dungeon/lights/ampel_gruen.png", x: c + 0.08, y: r + 0.1, w: 0.12, h: 0.5 },
          { src: "/dungeon/lights/ampel_rot.png", x: c + 0.92, y: r + 0.9, w: 0.12, h: 0.5 },
        );
      if (ch === "B") out.push({ src: "/dungeon/signs/schild_andreaskreuz.png", x: c + 0.88, y: r + 0.18, w: 0.2, h: 0.42 });
      if (ch === "S") out.push({ src: "/dungeon/signs/schild_spielstrasse.png", x: c + 0.86, y: r + 0.82, w: 0.34, h: 0.44 });
      if (ch === "W") {
        const ex = exits(G, r, c);
        const stem = DIRS.find((d) => !ex.includes(turn(d, 2)) && ex.includes(d)) ?? "S";
        const v = DV[stem];
        const h = [-v[0], -v[1]];
        const right = [h[1], -h[0]];
        out.push({
          src: "/dungeon/signs/schild_vorfahr_gewaehren.png",
          x: c + 0.5 + v[1] * 0.42 + right[1] * 0.42,
          y: r + 0.5 + v[0] * 0.42 + right[0] * 0.42,
          w: 0.22,
          h: 0.46,
        });
      }
    }
  return out;
}

/** Sichtbarkeit unter dem Nebel: 2 sichtbar, 1 schon erkundet (halbtransparent), 0 verdeckt */
export function visibility(G: Run, r: number, c: number): 0 | 1 | 2 {
  if (Math.max(Math.abs(G.pos.r - r), Math.abs(G.pos.c - c)) <= 1) return 2;
  for (const k of G.visited) {
    const [vr, vc] = k.split(",").map(Number);
    if (Math.max(Math.abs(vr - r), Math.abs(vc - c)) <= 1) return 1;
  }
  return 0;
}

/** Position des Spielers auf der rechten Fahrspur (in Feld-Koordinaten) */
export function laneXY(G: Pick<Run, "pos" | "dir">) {
  const o = 0.15;
  const d = G.dir;
  return {
    x: G.pos.c + 0.5 + (d === "N" ? o : d === "S" ? -o : 0),
    y: G.pos.r + 0.5 + (d === "E" ? o : d === "W" ? -o : 0),
  };
}
