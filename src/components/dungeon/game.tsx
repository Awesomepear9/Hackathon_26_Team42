"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { DIFF, generate, type Run } from "@/lib/dungeon/city";
import { brake, demoState, fmt, gas, hearts, MAX_FP, newRun, pct, press, relOptions, step, stepDelay } from "@/lib/dungeon/engine";
import { act, useDungeon } from "@/lib/dungeon/store";
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

function Status({ run: G }: { run: Run }) {
  const evs = Object.values(G.events);
  const done = evs.filter((e) => e.st).length;
  const h = hearts(G);
  const roads = G.grid.join("").replace(/[.gz]/g, "").length;
  return (
    <section className={panel} aria-label="Status">
      <h2 className={panelTitle}>
        STATUS <span className="font-pixel-body text-sm tracking-normal text-zinc-400">{DIFF[G.diff].name}</span>
      </h2>
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5" aria-label={`${fmt(h)} von 5 Herzen`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Heart key={i} fill={Math.max(0, Math.min(1, h - i))} className="h-5 w-6 sm:h-6 sm:w-7" />
          ))}
        </div>
        <p className="text-right font-pixel-body text-base text-white">
          {fmt(G.fp)} / {MAX_FP}
          <small className="block text-xs text-zinc-400">Fehlerpunkte</small>
        </p>
      </div>
      <div className="mt-2.5 grid grid-cols-10 gap-1" aria-hidden="true">
        {Array.from({ length: MAX_FP }, (_, i) => (
          <i key={i} className={`h-2 ${i < Math.floor(G.fp) ? "bg-red-600" : "bg-zinc-700"}`} />
        ))}
      </div>
      <dl className="mt-2.5 grid grid-cols-3 gap-1.5 font-pixel-body text-xs text-zinc-400">
        {[
          ["EREIGNISSE", <><em className="not-italic text-yellow-300">{done}</em> / {evs.length}</>],
          ["ERKUNDET", `${pct(G.visited.length, roads)} %`],
          ["TEMPO", `${G.speed} km/h`],
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

function Controls({ run: G, desktop }: { run: Run; desktop: boolean }) {
  const opts = relOptions(G);
  const arrow = (d: "up" | "down" | "left" | "right") =>
    `/dungeon/ctrl/pfeil_${opts.includes(d) || (d === "down" && G.speed === 0) ? "an" : "aus"}_${d === "up" || d === "down" ? "vor" : "seite"}.png`;
  const hint =
    G.speed === 0 ? (
      <>Steh-Modus: <b className="font-normal text-yellow-300">Gas</b> zum Losfahren, Pfeil nach unten zum Wenden.</>
    ) : G.want ? (
      <>Nächste Abzweigung: <b className="font-normal text-yellow-300">{G.want === "left" ? "links" : "rechts"}</b> abbiegen.</>
    ) : (
      <>Grüne Pfeile = mögliche Richtungen an der nächsten Kreuzung.</>
    );
  const btn = "relative grid size-12 place-items-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500";
  const want = "after:absolute after:-inset-0.5 after:border-4 after:border-dashed after:border-yellow-300";
  return (
    <section className={panel} aria-label="Steuerung">
      <h2 className={panelTitle}>
        STEUERUNG {desktop && <span className="font-pixel-body text-sm tracking-normal text-zinc-400">Pfeiltasten · W/S</span>}
      </h2>
      <div className="flex justify-center">
        <div className="h-24 w-48 sm:h-28 sm:w-56" style={{ ...pixelBg(`/dungeon/ctrl/tempo/${Math.min(60, G.speed)}.png`), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} role="img" aria-label={`Tacho: ${G.speed} km/h`} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
          <span className="size-12" />
          <button type="button" className={btn} onClick={() => act((d) => press(d, "up"))} aria-label="Geradeaus">
            <span className="h-11 w-10" style={pixelBg(arrow("up"))} />
          </button>
          <span className="size-12" />
          <button type="button" className={`${btn} ${G.want === "left" ? want : ""}`} onClick={() => act((d) => press(d, "left"))} aria-label="Links abbiegen" aria-pressed={G.want === "left"}>
            <span className="h-10 w-11" style={pixelBg(arrow("left"))} />
          </button>
          <span className="size-12" />
          <button type="button" className={`${btn} ${G.want === "right" ? want : ""}`} onClick={() => act((d) => press(d, "right"))} aria-label="Rechts abbiegen" aria-pressed={G.want === "right"}>
            <span className="h-10 w-11 -scale-x-100" style={pixelBg(arrow("right"))} />
          </button>
          <span className="size-12" />
          <button type="button" className={btn} onClick={() => act((d) => press(d, "down"))} aria-label="Wenden">
            <span className="h-11 w-10 rotate-180" style={pixelBg(arrow("down"))} />
          </button>
          <span className="size-12" />
        </div>
        <div className="flex items-end gap-4">
          <button type="button" onClick={() => act(brake)} className="group flex flex-col items-center gap-1.5 font-pixel-body text-xs text-zinc-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500">
            <span className="h-14 w-24 transition-transform group-active:translate-y-1 group-active:scale-95" style={{ ...pixelBg("/dungeon/ctrl/bremse.png"), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "bottom" }} />
            BREMSE
          </button>
          <button type="button" onClick={() => act(gas)} className="group flex flex-col items-center gap-1.5 font-pixel-body text-xs text-zinc-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500">
            <span className="h-20 w-12 transition-transform group-active:translate-y-1 group-active:scale-95" style={{ ...pixelBg("/dungeon/ctrl/gaspedal.png"), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "bottom" }} />
            GAS
          </button>
        </div>
      </div>
      <p className="mt-3.5 bg-zinc-900 px-2.5 py-2 font-pixel-body text-sm leading-snug text-zinc-400" aria-live="polite">{hint}</p>
    </section>
  );
}

function Log({ run: G }: { run: Run }) {
  return (
    <section className={`${panel} hidden lg:block`} aria-label="Fahrtenbuch">
      <h2 className={panelTitle}>LOG</h2>
      <div className="max-h-48 overflow-auto font-pixel-body text-sm leading-snug text-zinc-400">
        {G.log.map((l, i) => (
          <p key={i} className={`border-b border-dashed border-zinc-700 py-1 ${l.tone === "good" ? "text-green-400" : l.tone === "bad" ? "text-red-400" : i === 0 ? "text-white" : ""}`}>
            {l.t}
          </p>
        ))}
      </div>
    </section>
  );
}

export function Game() {
  const state = useDungeon();
  const desktop = useDesktop();
  const G = state?.run ?? null;

  // Ohne laufenden Run einen mittleren Run starten; Demo-Zustände für Präsentationen per ?demo=
  useEffect(() => {
    const demo = new URLSearchParams(location.search).get("demo");
    if (demo === "fahrt" || demo === "ereignis") act((d) => void (d.run = demoState(demo)));
    else act((d) => void (d.run ??= generate("mittel", Math.floor(Math.random() * 1e9))));
  }, []);

  // Fahren: solange Tempo > 0, rückt das Auto im Takt der Geschwindigkeit ein Feld vor
  const moving = G && G.speed > 0 && !G.active && !G.over;
  useEffect(() => {
    if (!moving) return;
    const id = setTimeout(() => act(step), stepDelay(G.speed));
    return () => clearTimeout(id);
  }, [moving, G]);

  // Tastatur: Pfeile lenken, W gibt Gas, S/Leertaste bremst
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) return;
      const map: Record<string, () => void> = {
        ArrowUp: () => act((d) => press(d, "up")),
        ArrowLeft: () => act((d) => press(d, "left")),
        ArrowRight: () => act((d) => press(d, "right")),
        ArrowDown: () => act((d) => press(d, "down")),
        w: () => act(gas),
        W: () => act(gas),
        s: () => act(brake),
        S: () => act(brake),
        " ": () => act(brake),
      };
      const fn = map[e.key];
      if (!fn || (e.key === " " && e.target instanceof HTMLButtonElement)) return;
      e.preventDefault();
      fn();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  if (!G) return <div className="min-h-96 animate-pulse bg-zinc-900 motion-reduce:animate-none" aria-label="Spiel wird geladen" />;

  const won = G.over === "won";
  const view = desktop ? undefined : { cols: 5.6, rows: G.active ? 2.4 : 4.4 };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:pt-6">
      <div className="mb-4 hidden flex-wrap items-center gap-4 lg:flex">
        <h1 className="font-pixel text-xl tracking-wide text-white">
          STADT <span className="text-yellow-300">· {DIFF[G.diff].name.toUpperCase()}</span>
        </h1>
        <span className="font-pixel-body text-sm text-zinc-400">Karte #{String(G.seed).slice(-5)}</span>
        <Link href="/uebersicht" className="ml-auto bg-zinc-800 px-3 py-2 font-pixel-body text-sm text-zinc-100 ring-4 ring-zinc-600 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-cyan-500">
          Run pausieren
        </Link>
      </div>
      <h1 className="sr-only lg:hidden">Theorie-Dungeon · {DIFF[G.diff].name}</h1>

      <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="relative bg-zinc-950 p-1 ring-4 ring-zinc-600 lg:col-span-2 lg:p-1.5">
          <PixelMap
            run={G}
            fog
            view={view}
            label={`Stadtkarte, ${DIFF[G.diff].name}. Dein Auto fährt Richtung ${{ N: "Norden", E: "Osten", S: "Süden", W: "Westen" }[G.dir]}.`}
            className="mx-auto"
            style={desktop ? { maxWidth: `calc((100dvh - 12rem) * ${G.w / G.h})` } : undefined}
          />
          {G.over && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-zinc-950/80 p-4">
              <div className="max-w-sm bg-amber-100 p-6 text-center text-stone-900 ring-4 ring-stone-950" role="alertdialog" aria-labelledby="run-end">
                <h2 id="run-end" className="mb-2.5 font-pixel text-xl">{won ? "BESTANDEN!" : "DURCHGEFALLEN"}</h2>
                <p className="mb-5 font-pixel-body text-base leading-snug">
                  {won ? `Alle Ereignisse geschafft mit ${fmt(G.fp)} Fehlerpunkten.` : `${fmt(G.fp)} Fehlerpunkte. Ab ${MAX_FP} Punkten ist die Prüfung nicht bestanden.`}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" className={pbtn} onClick={() => act((d) => newRun(d, G.diff))}>NEUE STADT</button>
                  <Link href="/uebersicht" className={`${pbtnBase} bg-amber-50 hover:bg-white`}>ÜBERSICHT</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:gap-6">
          <Status run={G} />
          {G.active ? <EventCard key={G.active} run={G} /> : <Controls run={G} desktop={desktop} />}
          <Log run={G} />
        </div>
      </div>
    </div>
  );
}
