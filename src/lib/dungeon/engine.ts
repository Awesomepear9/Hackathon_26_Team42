// DigiFL Theorie-Dungeon – PLATZHALTER-ENGINE (aus engine.js, Iteration 3).
// Wird später durch das WebAssembly-Modul ersetzt. Das Frontend ruft nur diese drei Funktionen auf:
//
//   Engine.generate_board(difficulty, seed)    -> Board
//   Engine.new_game(board, difficulty, seed)   -> GameState   (Startzustand)
//   Engine.update(board, gameState, input)     -> GameState   (ein Spielzug)
//
// Datenformate wie serde sie standardmäßig erzeugt (siehe Typen unten). board.signs ergänzt das
// Frontend (signs.ts), damit die Engine Vorfahrt und Einbahnstraßen kennt.

export type Direction = "North" | "East" | "South" | "West";
export type Blinker = "Left" | "Right" | "Straight" | "Backwards";
export type DiffKey = "leicht" | "mittel" | "schwer";

export interface RoadTile {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}
/** "Grass" oder Straße; up = Norden (y-1), down = Süden (y+1), left = Westen, right = Osten */
export type TileType = "Grass" | { Road: RoadTile };

export type SignType = "yield" | "stop" | "spiel" | "spielEnde" | "einbahn" | "einfahrtVerboten" | "bahn";
export type FieldKind = "bahn" | "spiel" | "einbahn" | "vorfahrt" | "rvl" | "zebra";

export interface Signs {
  /** Arme mit Wartepflicht je Kreuzung */
  priority: Record<string, { sub: Partial<Record<Direction, "yield" | "stop">> }>;
  /** erlaubte Fahrtrichtung je Feld */
  oneway: Record<string, Direction>;
  /** nur Frontend: Tile-Grafik, Feldart und Schild-Sprites */
  tiles: Record<string, { img: string; rot: number }>;
  kinds: Record<string, FieldKind>;
  sprites: { type: SignType; x: number; y: number }[];
}

export interface Board {
  /** map[y][x], y = Zeile (0 = oben/Norden) */
  map: TileType[][];
  signs?: Signs;
}

export interface Input {
  /** None = abwarten */
  direction: Direction | "None";
  blinker: Blinker;
}

export interface Agent {
  x: number;
  y: number;
  heading: Direction;
  blinker: Blinker;
  stopped_at: string | null;
}

export interface Vehicle extends Agent {
  id: number;
  kind: string;
  wait: number;
  plan: Direction | null;
}

export interface Message {
  kind: "info" | "ok" | "error";
  text: string;
  points?: number;
}

export interface GameState {
  turn: number;
  player: Agent;
  vehicles: Vehicle[];
  /** Fahrfehler-Punkte aus der Engine (Fragen zählt das Frontend) */
  error_points: number;
  visited: [number, number][];
  /** nur dieser Zug */
  messages: Message[];
  status: "Running";
  _seed: number;
}

const MAP_SIZE = 25; // Platzhalter: groß genug für „Schwer“ (21–25 Felder)
const SIZES: Record<DiffKey, [number, number]> = { leicht: [9, 12], mittel: [15, 20], schwer: [21, 25] };
const CARS: Record<DiffKey, number> = { leicht: 3, mittel: 6, schwer: 10 };
const KINDS = ["auto_1", "auto_2", "sprinter", "motorrad_1"];

export const DIRS: Direction[] = ["North", "East", "South", "West"];
export const V: Record<Direction, [number, number]> = { North: [0, -1], East: [1, 0], South: [0, 1], West: [-1, 0] };
export const FIELD: Record<Direction, keyof RoadTile> = { North: "up", East: "right", South: "down", West: "left" };
export const turn = (d: Direction, k: number): Direction => DIRS[(DIRS.indexOf(d) + k + 4) % 4];
export const opp = (d: Direction) => turn(d, 2);
export const key = (x: number, y: number) => x + "," + y;

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

export const roadAt = (b: Board, x: number, y: number): RoadTile | null => {
  const t = b.map[y]?.[x];
  return t && t !== "Grass" ? t.Road : null;
};
export const exits = (b: Board, x: number, y: number): Direction[] => {
  const r = roadAt(b, x, y);
  return r ? DIRS.filter((d) => r[FIELD[d]]) : [];
};
const isJunction = (b: Board, x: number, y: number) => exits(b, x, y).length >= 3;

/* ---------------- Karte erzeugen ---------------- */
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

function generate_board(difficulty: DiffKey, seed: number): Board {
  const R = rng(seed);
  const [lo, hi] = SIZES[difficulty] ?? SIZES.mittel;
  const W = lo + Math.floor(R() * (hi - lo + 1));
  const H = Math.max(lo, W - Math.floor(R() * 4));
  const rows = lines(H, R);
  const cols = lines(W, R);
  const g = Array.from({ length: H }, (_, r) => Array.from({ length: W }, (_, c) => rows.includes(r) || cols.includes(c)));
  rows.slice(1, -1).forEach((r) => {
    for (let i = 0; i < cols.length - 1; i++) if (R() < 0.22) for (let c = cols[i] + 1; c < cols[i + 1]; c++) g[r][c] = false;
  });
  cols.slice(1, -1).forEach((c) => {
    for (let i = 0; i < rows.length - 1; i++) if (R() < 0.22) for (let r = rows[i] + 1; r < rows[i + 1]; r++) g[r][c] = false;
  });
  const at = (r: number, c: number) => r >= 0 && c >= 0 && r < H && c < W && g[r][c];
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) if (g[r][c] && !(at(r - 1, c) || at(r + 1, c) || at(r, c - 1) || at(r, c + 1))) g[r][c] = false;
  const ox = Math.floor((MAP_SIZE - W) / 2);
  const oy = Math.floor((MAP_SIZE - H) / 2);
  const map: TileType[][] = Array.from({ length: MAP_SIZE }, () => Array.from({ length: MAP_SIZE }, () => "Grass" as TileType));
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++)
      if (g[r][c]) map[oy + r][ox + c] = { Road: { up: at(r - 1, c), down: at(r + 1, c), left: at(r, c - 1), right: at(r, c + 1) } };
  return { map };
}

/* ---------------- Startzustand ---------------- */
function new_game(board: Board, difficulty: DiffKey, seed: number): GameState {
  const R = rng(seed ^ 0x5bd1e995);
  let start: { x: number; y: number } | null = null;
  for (let y = MAP_SIZE - 1; y >= 0 && !start; y--)
    for (let x = 0; x < MAP_SIZE && !start; x++) {
      const e = exits(board, x, y);
      if (e.length === 2 && e.includes("East") && e.includes("West")) start = { x, y };
    }
  start ??= { x: 0, y: 0 };
  const player: Agent = { x: start.x, y: start.y, heading: "East", blinker: "Straight", stopped_at: null };
  const roads: [number, number][] = [];
  for (let y = 0; y < MAP_SIZE; y++)
    for (let x = 0; x < MAP_SIZE; x++)
      if (roadAt(board, x, y) && !isJunction(board, x, y) && Math.abs(x - start.x) + Math.abs(y - start.y) > 4) roads.push([x, y]);
  const vehicles: Vehicle[] = [];
  const used = new Set<string>();
  for (let i = 0; i < (CARS[difficulty] ?? 5) && roads.length; i++) {
    const [x, y] = roads.splice(Math.floor(R() * roads.length), 1)[0];
    if (used.has(key(x, y))) continue;
    used.add(key(x, y));
    const e = exits(board, x, y);
    vehicles.push({ id: i + 1, kind: KINDS[i % KINDS.length], x, y, heading: e[Math.floor(R() * e.length)], blinker: "Straight", wait: 0, stopped_at: null, plan: null });
  }
  return {
    turn: 0, player, vehicles, error_points: 0, visited: [[start.x, start.y]],
    messages: [{ kind: "info", text: "Los geht's! Wähle eine Richtung." }], status: "Running", _seed: seed,
  };
}

/* ---------------- Regeln ---------------- */
type AnyAgent = Agent & { id: number };
const agents = (s: GameState): AnyAgent[] => [{ ...s.player, id: 0 }, ...s.vehicles];

/** Ist das Feld für ein Fahrzeug mit Fahrtrichtung `heading` belegt? */
function blocked(b: Board, s: GameState, x: number, y: number, heading: Direction, selfId: number) {
  const j = isJunction(b, x, y);
  return agents(s).some((a) => a.id !== selfId && a.x === x && a.y === y && (j || a.heading === heading));
}

/** Hat B (kommt aus Arm armB) Vorrang vor A (kommt aus armA, fährt in headingA)? */
function hasPriority(pr: Signs["priority"][string] | undefined, armB: Direction, armA: Direction, headingA: Direction) {
  if (pr) {
    const aMain = !pr.sub[armA];
    const bMain = !pr.sub[armB];
    if (bMain && !aMain) return true;
    if (aMain && !bMain) return false;
  }
  return armB === turn(headingA, 1); // rechts vor links
}

/** Muss A (fährt mit heading in die Kreuzung jx,jy) warten? */
function mustYield(b: Board, s: GameState, A: AnyAgent, jx: number, jy: number) {
  const armA = opp(A.heading);
  const pr = b.signs?.priority[key(jx, jy)];
  return agents(s).some((B) => {
    if (B.id === A.id) return false;
    if (B.x + V[B.heading][0] !== jx || B.y + V[B.heading][1] !== jy) return false; // fährt nicht auf die Kreuzung zu
    const armB = DIRS.find((d) => jx + V[d][0] === B.x && jy + V[d][1] === B.y);
    if (!armB || armB === armA) return false;
    return hasPriority(pr, armB, armA, A.heading);
  });
}
const onewayOk = (b: Board, x: number, y: number, d: Direction) => {
  const ow = b.signs?.oneway[key(x, y)];
  return !ow || ow === d;
};
const subSign = (b: Board, jx: number, jy: number, arm: Direction) => b.signs?.priority[key(jx, jy)]?.sub[arm] ?? null;

/* ---------------- Spielzug ---------------- */
function update(board: Board, prev: GameState, input: Input): GameState {
  const s: GameState = structuredClone(prev);
  s.turn++;
  s.messages = [];
  const P = s.player;
  const err = (pts: number, text: string) => {
    s.error_points += pts;
    s.messages.push({ kind: "error", text, points: pts });
  };
  P.blinker = input.blinker || "Straight";

  if (!input.direction || input.direction === "None") {
    P.stopped_at = key(P.x, P.y);
    s.messages.push({ kind: "info", text: "Du wartest ab." });
  } else {
    const d = input.direction;
    const ex = exits(board, P.x, P.y);
    if (!ex.includes(d)) s.messages.push({ kind: "info", text: "Dort ist keine Straße." });
    else {
      const nx = P.x + V[d][0];
      const ny = P.y + V[d][1];
      const rel = d === P.heading ? "straight" : d === turn(P.heading, -1) ? "left" : d === turn(P.heading, 1) ? "right" : "back";
      if (blocked(board, s, nx, ny, d, 0)) s.messages.push({ kind: "info", text: "Vor dir ist ein Fahrzeug. Warte ab." });
      else {
        if (ex.length >= 3) {
          if ((rel === "left" || rel === "right") && P.blinker !== (rel === "left" ? "Left" : "Right"))
            err(1, `Abgebogen ohne Blinker ${rel === "left" ? "links" : "rechts"}.`);
          if (rel === "straight" && (P.blinker === "Left" || P.blinker === "Right")) err(1, "Blinker gesetzt, aber geradeaus gefahren.");
        }
        if (!onewayOk(board, nx, ny, d)) {
          if (onewayOk(board, P.x, P.y, d) && !board.signs?.oneway[key(P.x, P.y)]) err(3, "In die Einbahnstraße falsch herum eingefahren.");
          else s.messages.push({ kind: "info", text: "Du fährst in der Einbahnstraße falsch herum." });
        }
        if (isJunction(board, nx, ny)) {
          if (mustYield(board, s, { ...P, id: 0, heading: d }, nx, ny)) err(3, "Vorfahrt missachtet!");
          if (subSign(board, nx, ny, opp(d)) === "stop" && P.stopped_at !== key(P.x, P.y)) err(2, "Am Stoppschild nicht angehalten.");
        }
        P.x = nx;
        P.y = ny;
        P.heading = d;
        P.stopped_at = null;
        if (!s.visited.some(([x, y]) => x === nx && y === ny)) s.visited.push([nx, ny]);
      }
    }
  }

  // Andere Verkehrsteilnehmer: zufällig, aber regelkonform
  const R = rng((prev._seed || 1) + s.turn * 7919);
  const reserved = new Set<string>();
  for (const v of s.vehicles) {
    const ex = exits(board, v.x, v.y);
    let opts = ex.filter((d) => d !== opp(v.heading) && onewayOk(board, v.x + V[d][0], v.y + V[d][1], d));
    if (!opts.length) opts = ex.filter((d) => onewayOk(board, v.x + V[d][0], v.y + V[d][1], d));
    if (!opts.length) {
      v.wait++;
      continue;
    }
    if (!v.plan || !opts.includes(v.plan)) v.plan = opts.includes(v.heading) && R() < 0.55 ? v.heading : opts[Math.floor(R() * opts.length)];
    const d = v.plan;
    const nx = v.x + V[d][0];
    const ny = v.y + V[d][1];
    const nk = key(nx, ny);
    v.blinker = d === v.heading ? "Straight" : d === turn(v.heading, -1) ? "Left" : d === turn(v.heading, 1) ? "Right" : "Backwards";
    if (blocked(board, s, nx, ny, d, v.id) || reserved.has(nk)) {
      v.wait++;
      continue;
    }
    if (isJunction(board, nx, ny)) {
      if (subSign(board, nx, ny, opp(d)) === "stop" && v.stopped_at !== key(v.x, v.y)) {
        v.stopped_at = key(v.x, v.y);
        v.wait++;
        continue;
      }
      if (mustYield(board, s, { ...v, heading: d }, nx, ny) && v.wait < 3) {
        v.wait++;
        continue;
      }
    }
    v.x = nx;
    v.y = ny;
    v.heading = d;
    v.wait = 0;
    v.plan = null;
    v.stopped_at = null;
    reserved.add(nk);
  }
  return s;
}

export const Engine = { MAP_SIZE, generate_board, new_game, update };
