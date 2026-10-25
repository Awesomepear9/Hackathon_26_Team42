import type { VectorSourceSpecification } from 'maplibre-gl'

// Austauschbare Vektor-Tile-Quelle. Voraussetzung für alle Quellen: OpenMapTiles-Schema
// (Layer transportation, building, landcover, water …), sonst greifen die Filter in style.json nicht.
//
// Konfiguration über Umgebungsvariablen (.env.local, typisiert in src/vite-env.d.ts):
//   VITE_TILES_TYPE   tilejson | xyz | pmtiles          (Standard: tilejson)
//   VITE_TILES_URL    TileJSON-URL, XYZ-Vorlage oder .pmtiles-URL
//   VITE_TILES_CREDIT zusätzliche Quellennennung, z. B. "© MapTiler"

export type TileSourceConfig =
  | { type: 'tilejson'; url: string; credit?: string[] }
  | { type: 'xyz'; tiles: string[]; maxzoom?: number; credit?: string[] }
  | { type: 'pmtiles'; url: string; credit?: string[] }

export const OSM_ATTRIBUTION = '© OpenStreetMap contributors'
export const OSM_COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright'

export const OPENFREEMAP: TileSourceConfig = {
  type: 'tilejson',
  url: 'https://tiles.openfreemap.org/planet',
  // Das OpenMapTiles-Schema steht unter CC-BY 4.0 und verlangt diese Nennung
  credit: ['© OpenMapTiles'],
}

function fromEnv(): TileSourceConfig {
  const env = import.meta.env
  const url = env.VITE_TILES_URL
  if (!url) return OPENFREEMAP
  const credit = env.VITE_TILES_CREDIT ? [env.VITE_TILES_CREDIT] : undefined
  switch (env.VITE_TILES_TYPE) {
    case 'xyz':
      return { type: 'xyz', tiles: [url], maxzoom: Number(env.VITE_TILES_MAXZOOM ?? 14), credit }
    case 'pmtiles':
      return { type: 'pmtiles', url, credit }
    default:
      return { type: 'tilejson', url, credit }
  }
}

export const tileSource: TileSourceConfig = fromEnv()

let pmtilesReady: Promise<void> | undefined

/** Baut die MapLibre-Quelle; registriert bei Bedarf das pmtiles://-Protokoll (einmalig, lazy geladen). */
export async function toVectorSource(config: TileSourceConfig): Promise<VectorSourceSpecification> {
  const attribution = OSM_ATTRIBUTION
  if (config.type === 'xyz') {
    return { type: 'vector', tiles: config.tiles, maxzoom: config.maxzoom ?? 14, attribution }
  }
  if (config.type === 'pmtiles') {
    pmtilesReady ??= Promise.all([import('pmtiles'), import('maplibre-gl')]).then(([pmtiles, maplibre]) => {
      maplibre.addProtocol('pmtiles', new pmtiles.Protocol().tile)
    })
    await pmtilesReady
    return { type: 'vector', url: `pmtiles://${config.url}`, attribution }
  }
  return { type: 'vector', url: config.url, attribution }
}

export function creditsFor(config: TileSourceConfig): string[] {
  return [...(config.credit ?? []), OSM_ATTRIBUTION]
}
