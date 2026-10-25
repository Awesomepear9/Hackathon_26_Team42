// Pixel-Grafiken aus Zeichenrastern: jedes Zeichen ist ein Pixel, die Palette ordnet Farben zu.

export type PixelRows = readonly string[];
export type Palette = Record<string, string>;

export interface PixelRect {
  x: number;
  y: number;
  fill: string;
}

export function pixelRects(rows: PixelRows, palette: Palette): PixelRect[] {
  const out: PixelRect[] = [];
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (palette[ch]) out.push({ x, y, fill: palette[ch] });
    }),
  );
  return out;
}

/** Raster als SVG-Data-URI, z. B. für Sprites in der Ereignis-Szene */
export function svgURI(rows: PixelRows, palette: Palette): string {
  const rects = pixelRects(rows, palette)
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="1.02" height="1.02" fill="${r.fill}"/>`)
    .join("");
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges">${rects}</svg>`,
    )
  );
}

export const HEART: PixelRows = [".XX.XX.", "XoXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
export const CHECK: PixelRows = [".......X", "......XX", ".....XX.", "X...XX..", "XX.XX...", ".XXX....", "..X....."];
export const CROSS: PixelRows = ["X.....X", ".X...X.", "..X.X..", "...X...", "..X.X..", ".X...X.", "X.....X"];
