"use client";

import { useEffect, useRef, useState } from "react";
import { catName, KINDNAME, questionById, type Question } from "@/lib/dungeon/catalog";
import { DEG, tileFor, type Run } from "@/lib/dungeon/city";
import { continueRun, finishEvent, isCorrect } from "@/lib/dungeon/engine";
import { act } from "@/lib/dungeon/store";
import { pixelBg } from "./pixel-map";

const REACT_MS = 2600;
const SCENE = 208; // px, 3 × 3 Felder

/** 3×3-Ausschnitt um das Ereignis, gedreht in Fahrtrichtung; bewegte Sprites laufen einmal ab */
function EventScene({ run: G, eventKey, q }: { run: Run; eventKey: string; q: Question }) {
  const ref = useRef<HTMLDivElement>(null);
  const [er, ec] = eventKey.split(",").map(Number);
  const t = SCENE / 3;
  const deg = DEG[G.dir];
  const a = (deg * Math.PI) / 180;
  const rot = (x: number, y: number) => ({ x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) });
  const sprites = [{ src: "/dungeon/cars/auto_spieler.png", x: 0.15, y: 0.95, w: 0.3, h: 0.42, rot: 0 }, ...q.rel];
  const place = (x: number, y: number, w: number, h: number) => ({ left: (x + 1.5) * t - (w * t) / 2, top: (y + 1.5) * t - (h * t) / 2 });

  useEffect(() => {
    const anims: Animation[] = [];
    sprites.forEach((s, i) => {
      if (!("to" in s) || !s.to) return;
      const el = ref.current?.querySelector<HTMLElement>(`[data-i="${i}"]`);
      if (!el) return;
      const from = rot(s.x, s.y);
      const to = rot(s.to.x, s.to.y);
      const p0 = place(from.x, from.y, s.w, s.h);
      const p1 = place(to.x, to.y, s.w, s.h);
      anims.push(
        el.animate(
          [{ left: `${p0.left}px`, top: `${p0.top}px` }, { left: `${p1.left}px`, top: `${p1.top}px` }],
          { duration: q.react ? 1400 : 2200, fill: "forwards" },
        ),
      );
    });
    return () => anims.forEach((x) => x.cancel());
    // Animation nur beim Erscheinen des Ereignisses
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventKey]);

  const tiles = [];
  for (let r = er - 1; r <= er + 1; r++)
    for (let c = ec - 1; c <= ec + 1; c++) {
      const ti = tileFor(G, r, c);
      tiles.push(
        <div
          key={`${r},${c}`}
          className={`absolute ${ti.block ? "brightness-75 saturate-90" : ""}`}
          style={{ left: (c - ec + 1) * t, top: (r - er + 1) * t, width: t + 0.6, height: t + 0.6, ...pixelBg(`/dungeon/tiles/${ti.img}.png`), transform: `rotate(${ti.rot}deg)` }}
        />,
      );
    }

  return (
    <div ref={ref} className="relative mx-auto mb-4 size-52 overflow-hidden bg-zinc-950 ring-4 ring-zinc-950" aria-hidden="true">
      <div className="absolute inset-0" style={{ transform: `rotate(${-deg}deg)` }}>
        {tiles}
        {sprites.map((s, i) => {
          const p = rot(s.x, s.y);
          return (
            <div
              key={i}
              data-i={i}
              className="absolute z-10"
              style={{ ...place(p.x, p.y, s.w, s.h), width: s.w * t, height: s.h * t, ...pixelBg(s.src), transform: `rotate(${s.rot + deg}deg)` }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Ablaufender Balken für Reaktionsfragen; läuft er ab, gilt die Antwort als falsch */
function ReactionTimer() {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = 1 - (now - t0) / REACT_MS;
      if (bar.current) bar.current.style.width = `${Math.max(0, k * 100)}%`;
      if (k <= 0) return act((d) => finishEvent(d, false));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="mb-3 mt-1 h-3 bg-amber-200 ring-2 ring-stone-900" role="timer" aria-label="Reaktionszeit">
      <span ref={bar} className="block h-full w-full bg-red-600" />
    </div>
  );
}

const pbtn =
  "font-pixel bg-yellow-300 px-4 py-3 text-xs text-stone-950 ring-4 ring-stone-950 border-b-4 border-yellow-600 transition-opacity hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-cyan-500 disabled:cursor-default disabled:opacity-45";

export function EventCard({ run: G }: { run: Run }) {
  const key = G.active!;
  const ev = G.events[key];
  const q = questionById(ev.qid);
  const [sel, setSel] = useState<number[]>([]);
  const answered = ev.st !== null;

  const toggle = (i: number) => {
    if (answered) return;
    setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : q.multi ? [...s, i] : [i]));
  };

  return (
    <section className="relative mt-8 bg-amber-100 p-4 text-stone-900 ring-4 ring-stone-950 sm:p-5" aria-live="polite" aria-label={`Ereignis: ${KINDNAME[ev.kind]}`}>
      <span className="absolute -left-1 -top-8 bg-red-600 px-2 py-1.5 font-pixel text-xs text-white">! {KINDNAME[ev.kind].toUpperCase()}</span>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <span className="bg-red-600 px-2 py-1 font-pixel-body text-xs text-white">{q.cat} {catName(q.cat).toUpperCase()}</span>
        <span className="bg-stone-950 px-2 py-1 font-pixel-body text-xs text-white">{q.type.toUpperCase()}</span>
        <span className="px-2 py-1 font-pixel-body text-xs text-stone-600 ring-2 ring-inset ring-stone-400">{q.pts} PUNKTE</span>
      </div>

      <EventScene key={key} run={G} eventKey={key} q={q} />

      {q.sign && <div className="mx-auto mb-3 h-20 w-20" style={{ ...pixelBg(q.sign), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} role="img" aria-label="Verkehrszeichen" />}
      <p className="mb-3 font-pixel-body text-base leading-snug sm:text-lg">{q.q}</p>

      {q.react ? (
        !answered && (
          <>
            <ReactionTimer />
            <div className="mt-2 flex justify-center gap-4">
              <button type="button" onClick={() => act((d) => finishEvent(d, q.react === "brake"))} className="flex flex-col items-center gap-1.5 font-pixel-body text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500">
                <span className="h-16 w-28" style={{ ...pixelBg("/dungeon/ctrl/bremse.png"), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "bottom" }} />
                BREMSEN
              </button>
              <button type="button" onClick={() => act((d) => finishEvent(d, q.react === "gas"))} className="flex flex-col items-center gap-1.5 font-pixel-body text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500">
                <span className="h-24 w-14" style={{ ...pixelBg("/dungeon/ctrl/gaspedal.png"), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "bottom" }} />
                WEITER
              </button>
            </div>
          </>
        )
      ) : (
        <>
          {q.multi && <p className="-mt-1 mb-2.5 font-pixel-body text-xs text-stone-500">Mehrere Antworten können richtig sein.</p>}
          <div className="grid gap-2" role={q.multi ? "group" : "radiogroup"}>
            {q.a!.map((text, i) => {
              const picked = sel.includes(i);
              const right = answered && q.c!.includes(i);
              const wrong = answered && picked && !right;
              return (
                <button
                  key={i}
                  type="button"
                  role={q.multi ? "checkbox" : "radio"}
                  aria-checked={picked}
                  disabled={answered}
                  onClick={() => toggle(i)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-left font-pixel-body text-sm leading-snug ring-inset focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-600 sm:text-base ${
                    right ? "bg-green-100 ring-4 ring-green-600" : wrong ? "bg-red-100 ring-4 ring-red-600" : picked ? "bg-yellow-100 ring-4 ring-stone-950" : "bg-amber-50 ring-2 ring-stone-400 hover:bg-yellow-50"
                  }`}
                >
                  <span className={`grid size-6 flex-none place-items-center ring-4 ring-inset ring-stone-950 ${picked ? "bg-yellow-300" : "bg-white"}`}>
                    {picked && <span className="size-2.5 bg-stone-950" />}
                  </span>
                  {text}
                </button>
              );
            })}
          </div>
        </>
      )}

      {answered && (
        <p className="mt-4 bg-amber-50 px-3 py-2.5 font-pixel-body text-sm leading-relaxed ring-2 ring-inset ring-stone-400">
          <b className={`font-normal ${ev.st === "ok" ? "text-green-700" : "text-red-700"}`}>
            {ev.st === "ok" ? "Richtig!" : `Leider falsch: +${q.pts} Fehlerpunkte.`}
          </b>{" "}
          {q.why}
        </p>
      )}

      {answered ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-pixel-body text-xs text-stone-600">{ev.st === "ok" ? "Feld gemeistert ✓" : "Feld markiert ✗"}</span>
          <button type="button" className={pbtn} onClick={() => act(continueRun)}>WEITERFAHREN</button>
        </div>
      ) : (
        !q.react && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="font-pixel-body text-xs text-stone-600">FALSCH: <span className="text-red-700">+{q.pts} FEHLERPUNKTE</span></span>
            <button type="button" className={pbtn} disabled={!sel.length} onClick={() => act((d) => finishEvent(d, isCorrect(q, sel)))}>ANTWORT PRÜFEN</button>
          </div>
        )
      )}
    </section>
  );
}
