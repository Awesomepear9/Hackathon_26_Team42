// Spiellogik. Alle Aktionen verändern einen Entwurf (Kopie) von Run und Statistik;
// der Store (store.ts) kopiert, speichert und benachrichtigt die Komponenten.
import { CATS, DEMO_DONE, KINDNAME, LIMIT, questionById, type Question } from "./catalog";
import { DIFF, DIRS, DV, exits, generate, turn, type DiffKey, type Run } from "./city";

export interface RunRecord {
  d: string;
  diff: string;
  ev: string;
  fp: number;
  res: "ok" | "no";
}

export interface Stats {
  done: Record<string, number>;
  seen: Record<string, 1>;
  runs: RunRecord[];
}

export interface Draft {
  run: Run | null;
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

export const hearts = (G: Run) => Math.max(0, 5 - G.fp / 2);
export const fmt = (n: number) => String(n).replace(".", ",");
export const pct = (a: number, b: number) => Math.round((a / b) * 100);

/** Wartezeit bis zum nächsten Feld: je schneller, desto kürzer */
export const stepDelay = (speed: number) => Math.max(260, 1500 - speed * 21);

function addLog(G: Run, t: string, tone?: "good" | "bad") {
  G.log.unshift({ t, tone });
  G.log = G.log.slice(0, 30);
}

export function newRun(draft: Draft, diff: DiffKey) {
  draft.run = generate(diff, Math.floor(Math.random() * 1e9));
}

/** Abzweigungen an der nächsten Kreuzung, relativ zur Fahrtrichtung */
export function relOptions(G: Run): ("up" | "left" | "right" | "down")[] {
  let r = G.pos.r;
  let c = G.pos.c;
  const d = G.dir;
  for (let i = 0; i < 8; i++) {
    const ex = exits(G, r, c).filter((x) => x !== turn(d, 2));
    if (ex.length !== 1 || ex[0] !== d || i === 7)
      return ex.map((x) => (x === d ? "up" : x === turn(d, -1) ? "left" : x === turn(d, 1) ? "right" : "down"));
    r += DV[d][0];
    c += DV[d][1];
  }
  return ["up"];
}

export function step(draft: Draft) {
  const G = draft.run;
  if (!G || G.active || G.over || G.speed <= 0) return;
  const opts = exits(G, G.pos.r, G.pos.c).filter((d) => d !== turn(G.dir, 2));
  let nd = null;
  if (G.want) {
    const wd = G.want === "left" ? turn(G.dir, -1) : turn(G.dir, 1);
    if (opts.includes(wd)) {
      nd = wd;
      G.want = null;
    }
  }
  if (!nd) {
    if (opts.includes(G.dir)) nd = G.dir;
    else if (opts.length === 1) nd = opts[0];
    else if (opts.length === 0) {
      G.speed = 0;
      addLog(G, "Sackgasse – halte an und wende mit dem Pfeil nach unten.");
      return;
    } else {
      G.speed = 0;
      addLog(G, "Abzweigung! Wähle links oder rechts und gib wieder Gas.");
      return;
    }
  }
  G.pos = { r: G.pos.r + DV[nd][0], c: G.pos.c + DV[nd][1] };
  G.dir = nd;
  const key = G.pos.r + "," + G.pos.c;
  if (!G.visited.includes(key)) G.visited.push(key);
  if (G.speed > 50) {
    G.fp += 1;
    addLog(G, `${G.speed} km/h innerorts – zu schnell! +1 Fehlerpunkt`, "bad");
  }
  const ev = G.events[key];
  if (ev && !ev.st) {
    const lim = LIMIT[ev.kind];
    if (G.speed > lim && G.speed <= 50) {
      G.fp += 1;
      addLog(
        G,
        `Mit ${G.speed} km/h ${ev.kind === "S" ? "in die Spielstraße" : "auf die Gefahrenstelle"} – erlaubt/angemessen: ${lim}. +1 Fehlerpunkt`,
        "bad",
      );
    }
    G.speed = 0;
    G.active = key;
    addLog(G, `Ereignis: ${KINDNAME[ev.kind]}!`);
  }
  if (G.fp >= MAX_FP) endRun(draft, false);
}

export function press(draft: Draft, dir: "up" | "left" | "right" | "down") {
  const G = draft.run;
  if (!G || G.active || G.over) return;
  if (dir === "down") {
    if (G.speed > 0) return addLog(G, "Zum Wenden erst anhalten (Bremse).");
    G.dir = turn(G.dir, 2);
    G.want = null;
    return addLog(G, "Gewendet.");
  }
  G.want = dir === "up" || G.want === dir ? null : dir;
  if (dir === "up" && G.speed === 0) G.speed = 10;
  step(draft);
}

export function gas(draft: Draft) {
  const G = draft.run;
  if (!G || G.active || G.over) return;
  const was = G.speed;
  G.speed = Math.min(60, G.speed + 10);
  if (!was) step(draft);
}

export function brake(draft: Draft) {
  const G = draft.run;
  if (!G || G.active || G.over) return;
  G.speed = Math.max(0, G.speed - 10);
}

export function isCorrect(q: Question, selected: number[]) {
  const c = q.c ?? [];
  return c.length === selected.length && c.every((i) => selected.includes(i));
}

export function finishEvent(draft: Draft, ok: boolean) {
  const G = draft.run;
  if (!G?.active) return;
  const ev = G.events[G.active];
  if (ev.st) return;
  const q = questionById(ev.qid);
  ev.st = ok ? "ok" : "bad";
  if (ok) {
    addLog(G, `Richtig: ${KINDNAME[ev.kind]} gemeistert.`, "good");
    const S = draft.stats;
    if (!S.seen[q.id]) {
      S.seen[q.id] = 1;
      const total = CATS.find((c) => c.code === q.cat)?.total ?? 999;
      S.done[q.cat] = Math.min(total, (S.done[q.cat] ?? 0) + 1);
    }
  } else {
    G.fp += q.pts;
    addLog(G, `Falsch: +${q.pts} Fehlerpunkte`, "bad");
  }
}

export function continueRun(draft: Draft) {
  const G = draft.run;
  if (!G) return;
  G.active = null;
  if (G.fp >= MAX_FP) return endRun(draft, false);
  if (Object.values(G.events).every((e) => e.st)) endRun(draft, true);
}

function endRun(draft: Draft, won: boolean) {
  const G = draft.run!;
  G.over = won ? "won" : "lost";
  G.speed = 0;
  const evs = Object.values(G.events);
  const done = evs.filter((e) => e.st).length;
  draft.stats.runs.unshift({ d: "Heute", diff: DIFF[G.diff].name, ev: `${done} / ${evs.length}`, fp: G.fp, res: won ? "ok" : "no" });
  draft.stats.runs = draft.stats.runs.slice(0, 8);
}

/* Demo-Zustand für Präsentationen: /spiel?demo=fahrt | /spiel?demo=ereignis */
function bfs(G: Run, from: string, to: string) {
  const prev: Record<string, string | null> = { [from]: null };
  const q = [from];
  while (q.length) {
    const k = q.shift()!;
    if (k === to) break;
    const [r, c] = k.split(",").map(Number);
    for (const d of exits(G, r, c)) {
      const n = r + DV[d][0] + "," + (c + DV[d][1]);
      if (!(n in prev)) {
        prev[n] = k;
        q.push(n);
      }
    }
  }
  const p: string[] = [];
  for (let k: string | null = to; k; k = prev[k]) p.unshift(k);
  return p;
}

export function demoState(mode: "fahrt" | "ereignis"): Run {
  const g = generate("mittel", 20261025);
  const keys = Object.keys(g.events);
  const target = keys.find((k) => g.events[k].kind === "V") ?? keys[0];
  g.events[target].qid = "v1";
  const [tr, tc] = target.split(",").map(Number);
  const startKey = g.pos.r + "," + g.pos.c;
  const path = bfs(g, startKey, target);
  // vorher schon etwas erkundet: ein paar Ereignisse auf dem Weg und daneben
  g.visited = path.slice(0, -1);
  let n = 0;
  path.slice(0, -1).forEach((k) => {
    if (g.events[k]) {
      g.events[k].st = n === 1 ? "bad" : "ok";
      n++;
    }
  });
  const extra = keys.filter((k) => !path.includes(k) && k !== target).slice(0, Math.max(0, 3 - n));
  extra.forEach((k) => {
    g.events[k].st = "ok";
    bfs(g, startKey, k).forEach((x) => {
      if (!g.visited.includes(x)) g.visited.push(x);
    });
  });
  const last = path[path.length - 2].split(",").map(Number);
  g.pos = { r: last[0], c: last[1] };
  g.dir = DIRS.find((d) => last[0] + DV[d][0] === tr && last[1] + DV[d][1] === tc) ?? "N";
  g.fp = 3.5;
  g.speed = 30;
  g.want = null;
  g.log = [
    { t: "Du näherst dich einer Kreuzung …" },
    { t: "Richtig: Zebrastreifen gemeistert.", tone: "good" },
    { t: "Falsch: +3 Fehlerpunkte", tone: "bad" },
    { t: "Mit 40 km/h auf die Gefahrenstelle – angemessen: 30. +1 Fehlerpunkt", tone: "bad" },
    { t: "Richtig: Ampelkreuzung gemeistert.", tone: "good" },
    { t: "Run gestartet: Mittel. Gib Gas!" },
  ];
  if (mode === "ereignis") {
    g.pos = { r: tr, c: tc };
    g.visited.push(target);
    g.active = target;
    g.speed = 0;
    g.log.unshift({ t: "Ereignis: Kreuzung!" });
  }
  return g;
}
