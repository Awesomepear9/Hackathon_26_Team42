import { useId } from "react";
import { HEART, pixelRects, type PixelRows } from "@/lib/dungeon/pixel";

export function PixelIcon({ rows, color = "#111", className }: { rows: PixelRows; color?: string; className?: string }) {
  return (
    <svg viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges" className={className} aria-hidden="true">
      {pixelRects(rows, { X: color }).map((r) => (
        <rect key={`${r.x},${r.y}`} x={r.x} y={r.y} width={1.02} height={1.02} fill={r.fill} />
      ))}
    </svg>
  );
}

/** Pixel-Herz, fill 0 bis 1 (halbe Herzen möglich) */
export function Heart({ fill, className }: { fill: number; className?: string }) {
  const id = useId();
  const draw = (pal: Record<string, string>) =>
    pixelRects(HEART, pal).map((r) => (
      <rect key={`${r.x},${r.y}`} x={r.x} y={r.y} width={1.02} height={1.02} fill={r.fill} />
    ));
  return (
    <svg viewBox="0 0 7 6" shapeRendering="crispEdges" className={className} aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x={0} y={0} width={fill * 7} height={6} />
        </clipPath>
      </defs>
      {draw({ X: "#3a3f47", o: "#3a3f47" })}
      <g clipPath={`url(#${id})`}>{draw({ X: "#e8302a", o: "#ffd9d6" })}</g>
    </svg>
  );
}
