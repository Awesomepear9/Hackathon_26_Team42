// Pixel-Stadtkarte. Alle Positionen in Prozent der Kartengröße, dadurch skaliert die Karte
// mit dem Container und braucht keine Messung (auch als Server-Komponente nutzbar).
import type { CSSProperties } from "react";
import { bbox, DEG, laneXY, SIGN_IMG, tileFor, visibility, type CityEvent } from "@/lib/dungeon/city";
import type { Agent, Blinker, Board, Vehicle } from "@/lib/dungeon/engine";
import { CHECK, CROSS } from "@/lib/dungeon/pixel";
import { PixelIcon } from "./pixel-icon";

export const pixelBg = (src: string): CSSProperties => ({
  backgroundImage: `url("${src}")`,
  backgroundSize: "100% 100%",
  imageRendering: "pixelated",
});

interface PixelMapProps {
  board: Board;
  player?: Agent;
  /** Blinker des eigenen Autos (steht im Frontend, nicht im GameState) */
  blinker?: Blinker;
  vehicles?: Vehicle[];
  events?: Record<string, CityEvent>;
  /** Nebel: nur die Umgebung des Autos ist sichtbar, erkundete Felder halb */
  fog?: { visited: [number, number][] };
  /** Kamera-Ausschnitt in Feldern, folgt dem Spieler (mobil) */
  view?: { cols: number; rows: number };
  label?: string;
  className?: string;
  style?: CSSProperties;
}

function Car({ a, kind, me, blinker, box, hidden }: { a: Agent; kind: string; me?: boolean; blinker: Blinker; box: CSSProperties; hidden?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute transition-all duration-300 ease-out ${me ? "z-15 drop-shadow-md drop-shadow-cyan-300" : "z-10"} ${hidden ? "opacity-0" : ""}`}
      style={{ ...box, ...pixelBg(`/dungeon/cars/${kind}.png`), transform: `rotate(${DEG[a.heading]}deg)` }}
    >
      {blinker === "Left" && <i className="absolute -left-1/12 -top-0.5 h-1/6 w-1/3 animate-pulse rounded-xs bg-amber-500" />}
      {blinker === "Right" && <i className="absolute -right-1/12 -top-0.5 h-1/6 w-1/3 animate-pulse rounded-xs bg-amber-500" />}
    </div>
  );
}

export function PixelMap({ board, player, blinker = "Straight", vehicles = [], events = {}, fog, view, label, className = "", style }: PixelMapProps) {
  const bb = bbox(board);
  const W = bb.x1 - bb.x0 + 1;
  const H = bb.y1 - bb.y0 + 1;
  const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
    left: `${((x - bb.x0) / W) * 100}%`,
    top: `${((y - bb.y0) / H) * 100}%`,
    width: `calc(${(w / W) * 100}% + 0.5px)`,
    height: `calc(${(h / H) * 100}% + 0.5px)`,
  });
  const vis = (x: number, y: number) => (fog && player ? visibility(player, fog.visited, x, y) : 2);

  const tiles = [];
  const fogs = [];
  for (let y = bb.y0; y <= bb.y1; y++)
    for (let x = bb.x0; x <= bb.x1; x++) {
      const t = tileFor(board, x, y);
      tiles.push(
        <div
          key={`${x},${y}`}
          className={`absolute ${t.block ? "brightness-75 saturate-90" : ""}`}
          style={{ ...box(x, y, 1, 1), ...pixelBg(`/dungeon/tiles/${t.img}.png`), transform: `rotate(${t.rot}deg)` }}
        />,
      );
      const v = vis(x, y);
      if (v < 2) fogs.push(<div key={`f${x},${y}`} className={`absolute z-20 ${v ? "bg-zinc-950/40" : "bg-zinc-950/85"}`} style={box(x, y, 1, 1)} />);
    }

  const signs = (board.signs?.sprites ?? []).filter((s) => vis(Math.floor(s.x), Math.floor(s.y)) > 0);
  const carBox = (a: Agent) => {
    const p = laneXY(a);
    return box(p.x - 0.15, p.y - 0.21, 0.3, 0.42);
  };

  let layerStyle: CSSProperties = { inset: 0 };
  let frameStyle: CSSProperties = { aspectRatio: `${W} / ${H}` };
  if (view && player) {
    const p = laneXY(player);
    const ox = Math.max(0, Math.min(W - view.cols, p.x - bb.x0 - view.cols / 2));
    const oy = Math.max(0, Math.min(H - view.rows, p.y - bb.y0 - view.rows / 2));
    frameStyle = { aspectRatio: `${view.cols} / ${view.rows}` };
    layerStyle = {
      left: 0,
      top: 0,
      width: `${(W / view.cols) * 100}%`,
      height: `${(H / view.rows) * 100}%`,
      transform: `translate(${(-ox / W) * 100}%, ${(-oy / H) * 100}%)`,
    };
  }

  return (
    <div role="img" aria-label={label ?? "Pixel-Stadtkarte"} className={`relative w-full overflow-hidden bg-zinc-950 ${className}`} style={{ ...frameStyle, ...style }}>
      <div className="absolute transition-transform duration-300 ease-out" style={layerStyle}>
        {tiles}
        {signs.map((s, i) => {
          const wide = s.type === "spiel" || s.type === "spielEnde" || s.type === "einbahn";
          const w = wide ? 0.36 : 0.24;
          return <div key={i} className="absolute z-5" style={{ ...box(s.x - w / 2, s.y - 0.23, w, 0.46), ...pixelBg(`/dungeon/signs/${SIGN_IMG[s.type]}.png`) }} />;
        })}
        {vehicles.map((v) => (
          <Car key={v.id} a={v} kind={v.kind} blinker={v.blinker} box={carBox(v)} hidden={vis(v.x, v.y) < 2} />
        ))}
        {fogs}
        {Object.entries(events).map(([k, e]) => {
          if (!e.st) return null;
          const [x, y] = k.split(",").map(Number);
          return (
            <div
              key={k}
              className={`absolute z-25 grid place-items-center ring-2 ring-zinc-950 ${e.st === "ok" ? "bg-green-400" : "bg-red-500"}`}
              style={box(x + 0.35, y + 0.35, 0.3, 0.3)}
            >
              <PixelIcon rows={e.st === "ok" ? CHECK : CROSS} className="h-3/5 w-3/5" />
            </div>
          );
        })}
        {player && <Car key="me" a={player} kind="auto_spieler" me blinker={blinker} box={carBox(player)} />}
      </div>
    </div>
  );
}
