"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { bbox, DIFF } from "@/lib/dungeon/city";
import { exits, key, roadAt } from "@/lib/dungeon/engine";
import { absOf, act, fmt, hearts, MAX_FP, newRun, pct, setBlinker, totalFP, type RelDir, type Session } from "@/lib/dungeon/session";
import { dispatch, useDungeon } from "@/lib/dungeon/store";
import { EventCard } from "./event-card";
import { Heart } from "./pixel-icon";
import { PixelMap, pixelBg } from "./pixel-map";

const DESKTOP = "(min-width: 1024px)";

function useDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(DESKTOP);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => matchMedia(DESKTOP).matches,
    () => true,
  );
}

const panel = "relative bg-zinc-800 p-4 ring-4 ring-zinc-600 sm:px-5";
const panelTitle = "mb-3 flex items-center justify-between font-pixel text-xs tracking-wider text-yellow-300";
const pbtnBase =
  "inline-block px-4 py-3 font-pixel text-xs text-stone-950 ring-4 ring-stone-950 border-b-4 border-yellow-600 focus-visible:outline-none focus-visible:ring-cyan-500";
const pbtn = `${pbtnBase} bg-yellow-300 hover:bg-yellow-200`;
const DIR_NAME = { North: "Norden", East: "Osten", South: "Süden", West: "Westen" } as const;

function Status({ S }: { S: Session }) {
  const evs = Object.values(S.events);
  const done = evs.filter((e) => e.st).length;
  const fp = totalFP(S);
  const h = hearts(S);
  const bb = bbox(S.board);
  let roads = 0;
  for (let y = bb.y0; y <= bb.y1; y++) for (let x = bb.x0; x <= bb.x1; x++) if (roadAt(S.board, x, y)) roads++;
  return (
    <section className={panel} aria-label="Status">
      <h2 className={panelTitle}>
        STATUS{" "}
        <span className="font-pixel-body text-sm tracking-normal text-zinc-400">
          {fmt(S.state.error_points)} Fahrfehler · {fmt(S.quiz)} aus Fragen
        </span>
      </h2>
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5" aria-label={`${fmt(h)} von 5 Herzen`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Heart key={i} fill={Math.max(0, Math.min(1, h - i))} className="h-5 w-6 sm:h-6 sm:w-7" />
          ))}
        </div>
        <p className="text-right font-pixel-body text-base text-white">
          {fmt(fp)} / {MAX_FP}
          <small className="block text-xs text-zinc-400">Fehlerpunkte</small>
        </p>
      </div>
      <div className="mt-2.5 grid grid-cols-10 gap-1" aria-hidden="true">
        {Array.from({ length: MAX_FP }, (_, i) => (
          <i key={i} className={`h-2 ${i < Math.floor(fp) ? "bg-red-600" : "bg-zinc-700"}`} />
        ))}
      </div>
      <dl className="mt-2.5 grid grid-cols-3 gap-1.5 font-pixel-body text-xs text-zinc-400">
        {[
          ["EREIGNISSE", <><em className="not-italic text-yellow-300">{done}</em> / {evs.length}</>],
          ["ERKUNDET", `${pct(S.state.visited.length, roads)} %`],
          ["ZUG", S.state.turn],
        ].map(([k, v]) => (
          <div key={k as string} className="bg-zinc-900 px-2.5 py-1.5">
            <dt>{k}</dt>
            <dd className="text-base text-white">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const BlinkArrow = ({ side, className }: { side: "Left" | "Right"; className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
    <path d={side === "Left" ? "M2 8 9 2v4h5v4H9v4z" : "M14 8 7 2v4H2v4h5v4z"} className="fill-amber-500" />
  </svg>
);

function Controls({ S, desktop }: { S: Session; desktop: boolean }) {
  const P = S.state.player;
  const ex = exits(S.board, P.x, P.y);
  const can = (r: RelDir) => ex.includes(absOf(S, r));
  const isJ = ex.length >= 3;
  const pr = isJ && S.board.signs?.priority[key(P.x, P.y)];
  const arrow = (r: RelDir) => `/dungeon/ctrl/pfeil_${can(r) ? "an" : "aus"}_${r === "up" || r === "down" ? "vor" : "seite"}.png`;
  const btn = "relative grid size-12 place-items-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500 disabled:cursor-not-allowed";
  const blinkBtn = (side: "Left" | "Right", label: string) => {
    const on = S.blinker === side;
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => dispatch((d) => setBlinker(d, side))}
        className={`flex h-12 items-center justify-center gap-2.5 font-pixel-body text-sm ring-4 focus-visible:outline-none focus-visible:ring-cyan-500 ${
          on ? "bg-amber-950 text-white ring-amber-500" : "bg-zinc-900 text-zinc-400 ring-zinc-700 hover:text-zinc-200"
        }`}
      >
        {side === "Left" && <BlinkArrow side="Left" className={`size-4 ${on ? "animate-pulse" : "opacity-50"}`} />}
        {label}
        {side === "Right" && <BlinkArrow side="Right" className={`size-4 ${on ? "animate-pulse" : "opacity-50"}`} />}
      </button>
    );
  };
  return (
    <section className={panel} aria-label="Steuerung">
      <h2 className={panelTitle}>
        STEUERUNG {desktop && <span className="font-pixel-body text-sm tracking-normal text-zinc-400">Pfeile · Q/E · Leertaste</span>}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {blinkBtn("Left", "Blinker links")}
        {blinkBtn("Right", "Blinker rechts")}
      </div>
      <div className="mt-4 flex items-stretch justify-between gap-4">
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
          <span className="size-12" />
          <button type="button" className={btn} disabled={!can("up")} onClick={() => dispatch((d) => act(d, "up"))} aria-label="Geradeaus">
            <span className="h-11 w-10" style={pixelBg(arrow("up"))} />
          </button>
          <span className="size-12" />
          <button type="button" className={btn} disabled={!can("left")} onClick={() => dispatch((d) => act(d, "left"))} aria-label="Links">
            <span className="h-10 w-11" style={pixelBg(arrow("left"))} />
          </button>
          <span className="grid size-12 place-items-center">
            <span className="h-8 w-6" style={{ ...pixelBg("/dungeon/cars/auto_spieler.png"), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
          </span>
          <button type="button" className={btn} disabled={!can("right")} onClick={() => dispatch((d) => act(d, "right"))} aria-label="Rechts">
            <span className="h-10 w-11 -scale-x-100" style={pixelBg(arrow("right"))} />
          </button>
          <span className="size-12" />
          <button type="button" className={btn} disabled={!can("down")} onClick={() => dispatch((d) => act(d, "down"))} aria-label="Wenden">
            <span className="h-11 w-10 rotate-180" style={pixelBg(arrow("down"))} />
          </button>
          <span className="size-12" />
        </div>
        <button
          type="button"
          onClick={() => dispatch((d) => act(d, "wait"))}
          className="flex flex-1 flex-col items-center justify-center gap-1.5 bg-zinc-900 p-3 text-center font-pixel-body text-base text-white ring-4 ring-zinc-700 hover:ring-cyan-500 focus-visible:outline-none focus-visible:ring-cyan-500"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-6 text-cyan-400" aria-hidden="true">
            <path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" />
          </svg>
          ABWARTEN
          <small className="text-xs text-zinc-400">Eine Runde stehen bleiben, die anderen fahren</small>
        </button>
      </div>
      <p className="mt-3.5 bg-zinc-900 px-2.5 py-2 font-pixel-body text-sm leading-snug text-zinc-400" aria-live="polite">
        {isJ ? (
          <>
            Du bist auf einer <b className="font-normal text-yellow-300">{pr ? "Kreuzung mit Vorfahrtsregelung" : "Kreuzung ohne Schilder"}</b>. Erst den Blinker setzen, dann abbiegen.
          </>
        ) : (
          <>
            Ein Klick fährt ein Feld weiter. Vor Kreuzungen: Schilder prüfen, Verkehr von rechts beachten, notfalls <b className="font-normal text-yellow-300">abwarten</b>.
          </>
        )}
      </p>
    </section>
  );
}

function Log({ S }: { S: Session }) {
  return (
    <section className={`${panel} hidden lg:block`} aria-label="Fahrtenbuch">
      <h2 className={panelTitle}>FAHRTENBUCH</h2>
      <div className="max-h-48 overflow-auto font-pixel-body text-sm leading-snug text-zinc-400">
        {S.log.map((l, i) => (
          <p
            key={i}
            className={`flex gap-2.5 border-b border-dashed border-zinc-700 py-1 ${l.kind === "ok" ? "text-green-400" : l.kind === "error" ? "text-red-400" : i === 0 ? "text-white" : ""}`}
          >
            <span className="w-6 flex-none text-right text-zinc-500">{l.t}</span>
            <span className="flex-1">{l.text}</span>
            <span className="flex-none">{l.pts ? `+${fmt(l.pts)}` : ""}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

export function Game() {
  const state = useDungeon();
  const desktop = useDesktop();
  const S = state?.session ?? null;

  // Ohne laufenden Run einen mittleren Run starten
  useEffect(() => {
    dispatch((d) => {
      if (!d.session) newRun(d, "mittel");
    });
  }, []);

  // Tastatur: Pfeile fahren ein Feld, Q/E Blinker, Leertaste abwarten
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) return;
      const map: Record<string, () => void> = {
        ArrowUp: () => dispatch((d) => act(d, "up")),
        ArrowLeft: () => dispatch((d) => act(d, "left")),
        ArrowRight: () => dispatch((d) => act(d, "right")),
        ArrowDown: () => dispatch((d) => act(d, "down")),
        " ": () => dispatch((d) => act(d, "wait")),
        q: () => dispatch((d) => setBlinker(d, "Left")),
        Q: () => dispatch((d) => setBlinker(d, "Left")),
        e: () => dispatch((d) => setBlinker(d, "Right")),
        E: () => dispatch((d) => setBlinker(d, "Right")),
      };
      const fn = map[e.key];
      if (!fn || (e.key === " " && e.target instanceof HTMLButtonElement)) return;
      e.preventDefault();
      fn();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  if (!S) return <div className="min-h-96 animate-pulse bg-zinc-900 motion-reduce:animate-none" aria-label="Spiel wird geladen" />;

  const won = S.over === "won";
  // Kamera folgt dem Auto: Die Karten sind bis zu 27 Felder groß, ganz gezeigt wären die Felder zu klein
  const bb = bbox(S.board);
  const view = desktop
    ? { cols: Math.min(bb.x1 - bb.x0 + 1, 11), rows: Math.min(bb.y1 - bb.y0 + 1, 8) }
    : { cols: 5.2, rows: S.active ? 2.6 : 4.6 };
  const onJunction = exits(S.board, S.state.player.x, S.state.player.y).length >= 3;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:pt-6">
      <div className="mb-4 hidden flex-wrap items-center gap-4 lg:flex">
        <h1 className="font-pixel text-xl tracking-wide text-white">
          STADT <span className="text-yellow-300">· {DIFF[S.diff].name.toUpperCase()}</span>
        </h1>
        <span className="font-pixel-body text-sm text-zinc-400">
          Karte #{String(S.seed).slice(-5)} · Zug {S.state.turn}
          {onJunction && <span className="text-yellow-300"> · Kreuzung</span>}
        </span>
        <Link href="/uebersicht" className="ml-auto bg-zinc-800 px-3 py-2 font-pixel-body text-sm text-zinc-100 ring-4 ring-zinc-600 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-cyan-500">
          Run pausieren
        </Link>
      </div>
      <h1 className="sr-only lg:hidden">Theorie-Dungeon · {DIFF[S.diff].name}</h1>

      <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="relative bg-zinc-950 p-1 ring-4 ring-zinc-600 lg:col-span-2 lg:p-1.5">
          <PixelMap
            board={S.board}
            player={S.state.player}
            blinker={S.blinker}
            vehicles={S.state.vehicles}
            events={S.events}
            fog={{ visited: S.state.visited }}
            view={view}
            label={`Stadtkarte, ${DIFF[S.diff].name}. Dein Auto fährt Richtung ${DIR_NAME[S.state.player.heading]}.`}
            className="mx-auto"
            style={desktop ? { maxWidth: `calc((100dvh - 12rem) * ${view.cols / view.rows})` } : undefined}
          />
          {S.over && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-zinc-950/80 p-4">
              <div className="max-w-sm bg-amber-100 p-6 text-center text-stone-900 ring-4 ring-stone-950" role="alertdialog" aria-labelledby="run-end">
                <h2 id="run-end" className="mb-2.5 font-pixel text-xl">{won ? "BESTANDEN!" : "DURCHGEFALLEN"}</h2>
                <p className="mb-5 font-pixel-body text-base leading-snug">
                  {won ? `Alle Ereignisse geschafft mit ${fmt(totalFP(S))} Fehlerpunkten.` : `${fmt(totalFP(S))} Fehlerpunkte. Ab ${MAX_FP} Punkten ist die Prüfung nicht bestanden.`}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" className={pbtn} onClick={() => dispatch((d) => newRun(d, S.diff))}>NEUE STADT</button>
                  <Link href="/uebersicht" className={`${pbtnBase} bg-amber-50 hover:bg-white`}>ÜBERSICHT</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:gap-6">
          <Status S={S} />
          {S.active ? <EventCard S={S} /> : <Controls S={S} desktop={desktop} />}
          <Log S={S} />
        </div>
      </div>
    </div>
  );
}
