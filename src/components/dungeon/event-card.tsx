"use client";

import type { CSSProperties } from "react";
import { catName, catOf, QSIGN, TYPE_NAME } from "@/lib/dungeon/catalog";
import { DEG, laneXY, SIGN_IMG, tileFor } from "@/lib/dungeon/city";
import type { Agent } from "@/lib/dungeon/engine";
import { frageByNr } from "@/lib/dungeon/fragen";
import { answer, continueRun, toggleAns, type Session } from "@/lib/dungeon/session";
import { dispatch } from "@/lib/dungeon/store";
import { pixelBg } from "./pixel-map";

const SCENE = 208; // px, 3 × 3 Felder

/** 3×3-Ausschnitt um das Ereignis, gedreht in Fahrtrichtung (dein Auto kommt von unten) */
function EventScene({ S }: { S: Session }) {
  const [ex, ey] = S.active!.split(",").map(Number);
  const t = SCENE / 3;
  const deg = DEG[S.state.player.heading];
  const inScene = (x: number, y: number) => x >= ex - 1.5 && x <= ex + 1.5 && y >= ey - 1.5 && y <= ey + 1.5;
  const at = (x: number, y: number, w: number, h: number): CSSProperties => ({ left: (x - ex + 1.5) * t - (w * t) / 2, top: (y - ey + 1.5) * t - (h * t) / 2, width: w * t, height: h * t });
  const car = (a: Agent, kind: string, k: string) => {
    const p = laneXY(a);
    return <div key={k} className="absolute z-10" style={{ ...at(p.x, p.y, 0.3, 0.42), ...pixelBg(`/dungeon/cars/${kind}.png`), transform: `rotate(${DEG[a.heading]}deg)` }} />;
  };

  const tiles = [];
  for (let y = ey - 1; y <= ey + 1; y++)
    for (let x = ex - 1; x <= ex + 1; x++) {
      const ti = tileFor(S.board, x, y);
      tiles.push(
        <div
          key={`${x},${y}`}
          className={`absolute ${ti.block ? "brightness-75 saturate-90" : ""}`}
          style={{ left: (x - ex + 1) * t, top: (y - ey + 1) * t, width: t + 0.6, height: t + 0.6, ...pixelBg(`/dungeon/tiles/${ti.img}.png`), transform: `rotate(${ti.rot}deg)` }}
        />,
      );
    }

  return (
    <div className="relative mx-auto mb-4 size-52 overflow-hidden bg-zinc-950 ring-4 ring-zinc-950" aria-hidden="true">
      <div className="absolute inset-0" style={{ transform: `rotate(${-deg}deg)` }}>
        {tiles}
        {(S.board.signs?.sprites ?? [])
          .filter((s) => inScene(s.x, s.y))
          .map((s, i) => {
            const w = s.type === "spiel" || s.type === "spielEnde" || s.type === "einbahn" ? 0.36 : 0.24;
            return <div key={i} className="absolute z-5" style={{ ...at(s.x, s.y, w, 0.46), ...pixelBg(`/dungeon/signs/${SIGN_IMG[s.type]}.png`), transform: `rotate(${deg}deg)` }} />;
          })}
        {S.state.vehicles.filter((v) => inScene(v.x + 0.5, v.y + 0.5)).map((v) => car(v, v.kind, `v${v.id}`))}
        {car(S.state.player, "auto_spieler", "me")}
      </div>
    </div>
  );
}

const pbtn =
  "font-pixel bg-yellow-300 px-4 py-3 text-xs text-stone-950 ring-4 ring-stone-950 border-b-4 border-yellow-600 transition-opacity hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-cyan-500 disabled:cursor-default disabled:opacity-45";

export function EventCard({ S }: { S: Session }) {
  const ev = S.events[S.active!];
  const q = frageByNr(ev.nr);
  const A = S.answered;
  const cat = catOf(q.nr);
  const signs = q.signs.filter((s) => QSIGN[s]);

  return (
    <section className="relative mt-8 bg-amber-100 p-4 text-stone-900 ring-4 ring-stone-950 sm:p-5" aria-live="polite" aria-label={`Ereignis: ${TYPE_NAME[ev.type]}`}>
      <span className="absolute -left-1 -top-8 bg-red-600 px-2 py-1.5 font-pixel text-xs text-white">! {TYPE_NAME[ev.type].toUpperCase()}</span>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <span className="bg-red-600 px-2 py-1 font-pixel-body text-xs text-white">{cat} {catName(cat).toUpperCase()}</span>
        <span className="bg-stone-950 px-2 py-1 font-pixel-body text-xs text-white">FRAGE {q.nr}</span>
        <span className="px-2 py-1 font-pixel-body text-xs text-stone-600 ring-2 ring-inset ring-stone-400">{q.pts} PUNKTE</span>
      </div>

      <EventScene S={S} />

      {signs.length > 0 && (
        <div className="mb-3 flex justify-center gap-3">
          {signs.map((s) => (
            <div key={s} className="size-16" style={{ ...pixelBg(`/dungeon/signs/${QSIGN[s]}.png`), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} role="img" aria-label={`Zeichen ${s}`} />
          ))}
        </div>
      )}
      <p className="mb-3 font-pixel-body text-base leading-snug sm:text-lg">{q.text}</p>
      <p className="-mt-1 mb-2.5 font-pixel-body text-xs text-stone-500">Mehrere Antworten können richtig sein.</p>

      <div className="grid gap-2" role="group">
        {(S.order ?? [0, 1, 2]).map((i) => {
          const a = q.answers[i];
          const picked = S.sel.includes(i);
          const right = !!A && a.ok;
          const wrong = !!A && picked && !a.ok;
          return (
            <button
              key={i}
              type="button"
              role="checkbox"
              aria-checked={picked}
              disabled={!!A}
              onClick={() => dispatch((d) => toggleAns(d, i))}
              className={`flex items-center gap-3 px-3 py-2.5 text-left font-pixel-body text-sm leading-snug ring-inset focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-600 sm:text-base ${
                right ? "bg-green-100 ring-4 ring-green-600" : wrong ? "bg-red-100 ring-4 ring-red-600" : picked ? "bg-yellow-100 ring-4 ring-stone-950" : "bg-amber-50 ring-2 ring-stone-400 hover:bg-yellow-50"
              }`}
            >
              <span className={`grid size-6 flex-none place-items-center ring-4 ring-inset ring-stone-950 ${picked ? "bg-yellow-300" : "bg-white"}`}>
                {picked && <span className="size-2.5 bg-stone-950" />}
              </span>
              {a.t}
            </button>
          );
        })}
      </div>

      {A && (
        <p className="mt-4 bg-amber-50 px-3 py-2.5 font-pixel-body text-sm leading-relaxed ring-2 ring-inset ring-stone-400">
          <b className={`font-normal ${A.ok ? "text-green-700" : "text-red-700"}`}>{A.ok ? "Richtig!" : `Leider falsch: +${q.pts} Fehlerpunkte.`}</b>{" "}
          {A.ok
            ? "Das Feld ist geschafft."
            : `Richtig: ${q.answers
                .filter((a) => a.ok)
                .map((a) => a.t)
                .join(" · ")}`}
        </p>
      )}

      {A ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-pixel-body text-xs text-stone-600">{A.ok ? "Feld gemeistert ✓" : "Feld markiert ✗"}</span>
          <button type="button" className={pbtn} onClick={() => dispatch(continueRun)}>WEITERFAHREN</button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-pixel-body text-xs text-stone-600">FALSCH: <span className="text-red-700">+{q.pts} FEHLERPUNKTE</span></span>
          <button type="button" className={pbtn} disabled={!S.sel.length} onClick={() => dispatch(answer)}>ANTWORT PRÜFEN</button>
        </div>
      )}
    </section>
  );
}
