/// <reference types="vite/client" />

import type { Map as MapLibreMap } from 'maplibre-gl'

declare global {
  interface ImportMetaEnv {
    /** tilejson | xyz | pmtiles (Standard: tilejson) */
    readonly VITE_TILES_TYPE?: 'tilejson' | 'xyz' | 'pmtiles'
    /** TileJSON-URL, XYZ-Vorlage oder .pmtiles-URL; ohne Angabe OpenFreeMap */
    readonly VITE_TILES_URL?: string
    /** zusätzliche Quellennennung, z. B. "© MapTiler" */
    readonly VITE_TILES_CREDIT?: string
    /** höchster Zoom der XYZ-Quelle (Standard 14) */
    readonly VITE_TILES_MAXZOOM?: string
    /** Verkehrslage der Routen: simulation (Standard) | osm (Schätzung aus OSM-Straßendaten) */
    readonly VITE_TRAFFIC_SOURCE?: 'simulation' | 'osm'
    /** Adresse der DigiFL-Website mit dem Theorie-Dungeon (Standard: "/", gleiche Herkunft wie die App) */
    readonly VITE_WEBSITE_URL?: string
  }

  interface Window {
    /** nur im Dev-Build: alle Karteninstanzen, für Browser-Tests */
    __maps?: MapLibreMap[]
  }
}
