// Pixel-Stadtkarte. Alle Positionen in Prozent der Kartengröße, dadurch skaliert die Karte
// mit dem Container und braucht keine Messung (auch als Server-Komponente nutzbar).
import type { CSSProperties } from "react";
import { DEG, decor, laneXY, tileFor, visibility, type Run } from "@/lib/dungeon/city";
import { CHECK, CROSS } from "@/lib/dungeon/pixel";
import { PixelIcon } from "./pixel-icon";

export const pixelBg = (src: string): CSSProperties => ({
  backgroundImage: `url("${src}")`,
  backgroundSize: "100% 100%",
  imageRendering: "pixelated",
});

type MapRun = Pick<Run, "w" | "h" | "grid" | "events" | "pos" | "dir" | "visited">;

interface PixelMapProps {
  run: MapRun;
  fog?: boolean;
  player?: boolean;
  marks?: boolean;
  /** Kamera-Ausschnitt in Feldern, folgt dem Spieler (mobil) */
  view?: { cols: number; rows: number };
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function PixelMap({ run: G, fog = false, player = true, marks = true, view, label, className = "", style }: PixelMapProps) {
  const pctX = (x: number) => `${(x / G.w) * 100}%`;
  const pctY = (y: number) => `${(y / G.h) * 100}%`;
  const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
    left: pctX(x),
    top: pctY(y),
    width: `calc(${pctX(w)} + 0.5px)`,
    height: `calc(${pctY(h)} + 0.5px)`,
  });

  const tiles = [];
  const fogs = [];
  for (let r = 0; r < G.h; r++)
    for (let c = 0; c < G.w; c++) {
      const t = tileFor(G, r, c);
      tiles.push(
        <div
          key={`${r},${c}`}
          className={`absolute ${t.block ? "brightness-75 saturate-90" : ""}`}
          style={{ ...box(c, r, 1, 1), ...pixelBg(`/dungeon/tiles/${t.img}.png`), transform: `rotate(${t.rot}deg)` }}
        />,
      );
      if (fog) {
        const v = visibility(G as Run, r, c);
        if (v < 2)
          fogs.push(
            <div key={`f${r},${c}`} className={`absolute z-10 ${v ? "bg-zinc-950/40" : "bg-zinc-950/85"}`} style={box(c, r, 1, 1)} />,
          );
      }
    }

  const sprites = decor(G).filter(
    (s) => !fog || visibility(G as Run, Math.min(G.h - 1, Math.floor(s.y)), Math.min(G.w - 1, Math.floor(s.x))) > 0,
  );

  const p = laneXY(G);
  let layerStyle: CSSProperties = { inset: 0 };
  let frameStyle: CSSProperties = { aspectRatio: `${G.w} / ${G.h}` };
  if (view) {
    const ox = Math.max(0, Math.min(G.w - view.cols, p.x - view.cols / 2));
    const oy = Math.max(0, Math.min(G.h - view.rows, p.y - view.rows / 2));
    frameStyle = { aspectRatio: `${view.cols} / ${view.rows}` };
    layerStyle = {
      left: 0,
      top: 0,
      width: `${(G.w / view.cols) * 100}%`,
      height: `${(G.h / view.rows) * 100}%`,
      transform: `translate(${(-ox / G.w) * 100}%, ${(-oy / G.h) * 100}%)`,
    };
  }

  return (
    <div
      role="img"
      aria-label={label ?? "Pixel-Stadtkarte"}
      className={`relative w-full overflow-hidden bg-zinc-950 ${className}`}
      style={{ ...frameStyle, ...style }}
    >
      <div className="absolute transition-transform duration-300 ease-linear" style={layerStyle}>
        {tiles}
        {sprites.map((s, i) => (
          <div key={i} className="absolute z-5" style={{ ...box(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h), ...pixelBg(s.src) }} />
        ))}
        {fogs}
        {marks &&
          Object.entries(G.events).map(([k, e]) => {
            if (!e.st) return null;
            const [r, c] = k.split(",").map(Number);
            return (
              <div
                key={k}
                className={`absolute z-20 grid place-items-center ring-2 ring-zinc-950 ${e.st === "ok" ? "bg-green-400" : "bg-red-500"}`}
                style={box(c + 0.62, r + 0.06, 0.3, 0.3)}
              >
                <PixelIcon rows={e.st === "ok" ? CHECK : CROSS} className="h-3/5 w-3/5" />
              </div>
            );
          })}
        {player && (
          <div
            aria-hidden="true"
            className="absolute z-15 drop-shadow-md drop-shadow-cyan-300 transition-all duration-300 ease-linear"
            style={{
              ...box(p.x - 0.16, p.y - 0.22, 0.32, 0.44),
              ...pixelBg("/dungeon/cars/auto_spieler.png"),
              transform: `rotate(${DEG[G.dir]}deg)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
