// Spielsitzung (Frontend-Logik aus Iteration 3): Züge an die Engine geben, Blinker, Ereignisse,
// Fragen und Ende des Runs. Alle Aktionen verändern einen Entwurf (Kopie); store.ts speichert ihn.
import { CATS, catOf, DEMO_DONE, TYPE_NAME } from "./catalog";
import { DIFF, placeEvents, placeSigns, shuffle, type CityEvent } from "./city";
import { Engine, exits, key, opp, rng, turn, type Blinker, type Board, type DiffKey, type Direction, type GameState, type Message } from "./engine";
import { frageByNr } from "./fragen";

export type RelDir = "up" | "left" | "right" | "down";

export interface LogEntry {
  /** Zug */
  t: number;
  kind: Message["kind"];
  text: string;
  pts: number;
}

export interface Session {
  diff: DiffKey;
  seed: number;
  board: Board;
  state: GameState;
  events: Record<string, CityEvent>;
  /** Fehlerpunkte aus falsch beantworteten Fragen */
  quiz: number;
  log: LogEntry[];
  blinker: Blinker;
  /** Schlüssel "x,y" des offenen Ereignisses */
  active: string | null;
  /** gewählte Antworten (Index im Katalog) */
  sel: number[];
  /** Reihenfolge, in der die Antworten angezeigt werden */
  order: number[] | null;
  answered: { ok: boolean } | null;
  over: "won" | "lost" | null;
}

export interface RunRecord {
  d: string;
  diff: string;
  ev: string;
  fp: number;
  res: "ok" | "no";
}

export interface Stats {
  done: Record<string, number>;
  seen: Record<number, 1>;
  runs: RunRecord[];
}

export interface Draft {
  session: Session | null;
  stats: Stats;
}

export const MAX_FP = 10;

export function defaultStats(): Stats {
  return {
    done: { ...DEMO_DONE },
    seen: {},
    runs: [
      { d: "Gestern", diff: "Mittel", ev: "10 / 10", fp: 4, res: "ok" },
      { d: "23.10.", diff: "Leicht", ev: "6 / 6", fp: 2, res: "ok" },
      { d: "22.10.", diff: "Mittel", ev: "7 / 10", fp: 10.5, res: "no" },
      { d: "20.10.", diff: "Leicht", ev: "6 / 6", fp: 5, res: "ok" },
    ],
  };
}

export const fmt = (n: number) => String(n).replace(".", ",");
export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
export const totalFP = (S: Session) => S.state.error_points + S.quiz;
export const hearts = (S: Session) => Math.max(0, 5 - totalFP(S) / 2);

/** Relative Richtung (vom Auto aus) → Himmelsrichtung */
export function absOf(S: Session, rel: RelDir): Direction {
  const h = S.state.player.heading;
  return rel === "up" ? h : rel === "left" ? turn(h, -1) : rel === "right" ? turn(h, 1) : opp(h);
}

function pushLog(S: Session, msgs: Message[]) {
  msgs.forEach((m) => S.log.unshift({ t: S.state.turn, kind: m.kind, text: m.text, pts: m.points ?? 0 }));
  S.log = S.log.slice(0, 40);
}

export function newRun(draft: Draft, diff: DiffKey) {
  const seed = Math.floor(Math.random() * 1e9);
  const board = Engine.generate_board(diff, seed);
  const state = Engine.new_game(board, diff, seed);
  board.signs = placeSigns(board, seed, diff, state.player); // Schilder kennt die Engine über board.signs
  const events = placeEvents(board, board.signs, seed, diff, state.player);
  const S: Session = { diff, seed, board, state, events, quiz: 0, log: [], blinker: "Straight", active: null, sel: [], order: null, answered: null, over: null };
  pushLog(S, state.messages);
  draft.session = S;
}

function checkEnd(draft: Draft) {
  const S = draft.session!;
  if (S.over) return;
  const evs = Object.values(S.events);
  const done = evs.filter((e) => e.st).length;
  let res: Session["over"] = null;
  if (totalFP(S) >= MAX_FP) res = "lost";
  else if (!S.active && done === evs.length) res = "won";
  if (res) {
    S.over = res;
    draft.stats.runs.unshift({ d: "Heute", diff: DIFF[S.diff].name, ev: `${done} / ${evs.length}`, fp: totalFP(S), res: res === "won" ? "ok" : "no" });
    draft.stats.runs = draft.stats.runs.slice(0, 8);
  }
}

/** Ein Zug: Richtung relativ zum Auto oder abwarten */
export function act(draft: Draft, rel: RelDir | "wait") {
  const S = draft.session;
  if (!S || S.active || S.over) return;
  const input = rel === "wait" ? { direction: "None" as const, blinker: S.blinker } : { direction: absOf(S, rel), blinker: rel === "down" ? ("Backwards" as const) : S.blinker };
  const before = { ...S.state.player };
  S.state = Engine.update(S.board, S.state, input); // später: WASM update(board, gameState, input)
  pushLog(S, S.state.messages);
  const P = S.state.player;
  const moved = P.x !== before.x || P.y !== before.y;
  if (moved && exits(S.board, before.x, before.y).length >= 3) S.blinker = "Straight"; // Blinker stellt sich nach der Kreuzung zurück
  const ev = S.events[key(P.x, P.y)];
  if (moved && ev && !ev.st) {
    S.active = key(P.x, P.y);
    S.sel = [];
    S.answered = null;
    S.order = shuffle([0, 1, 2], rng(S.seed + ev.nr));
    S.log.unshift({ t: S.state.turn, kind: "info", text: `Ereignis: ${TYPE_NAME[ev.type]}`, pts: 0 });
  }
  checkEnd(draft);
}

export function setBlinker(draft: Draft, side: "Left" | "Right") {
  const S = draft.session;
  if (!S || S.active || S.over) return;
  S.blinker = S.blinker === side ? "Straight" : side;
}

export function toggleAns(draft: Draft, i: number) {
  const S = draft.session;
  if (!S || S.answered) return;
  S.sel = S.sel.includes(i) ? S.sel.filter((x) => x !== i) : [...S.sel, i];
}

export function answer(draft: Draft) {
  const S = draft.session;
  if (!S?.active || S.answered) return;
  const ev = S.events[S.active];
  const q = frageByNr(ev.nr);
  const ok = q.answers.every((a, i) => a.ok === S.sel.includes(i));
  ev.st = ok ? "ok" : "bad";
  S.answered = { ok };
  if (ok) {
    S.log.unshift({ t: S.state.turn, kind: "ok", text: `Frage ${q.nr} richtig beantwortet.`, pts: 0 });
    const st = draft.stats;
    if (!st.seen[q.nr]) {
      st.seen[q.nr] = 1;
      const c = catOf(q.nr);
      const tot = CATS.find((x) => x.code === c)?.total ?? 999;
      st.done[c] = Math.min(tot, (st.done[c] ?? 0) + 1);
    }
  } else {
    S.quiz += q.pts;
    S.log.unshift({ t: S.state.turn, kind: "error", text: `Frage ${q.nr} falsch beantwortet.`, pts: q.pts });
  }
}

export function continueRun(draft: Draft) {
  const S = draft.session;
  if (!S) return;
  S.active = null;
  S.answered = null;
  checkEnd(draft);
}
