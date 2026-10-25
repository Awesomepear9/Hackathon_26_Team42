import {
  Map as MapLibreMap,
  setWorkerUrl,
  type FilterSpecification,
  type GeoJSONSource,
  type StyleSpecification,
  type VectorSourceSpecification,
} from 'maplibre-gl'
import type { LngLat } from './geo'
import { withColorScheme, type ColorScheme } from './palette'
import { findRoundaboutIslands, type RoadLine } from './roundaboutIslands'
import baseStyle from './style.json'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// MapLibre 6 lädt seinen Web Worker als eigene Datei; bei Bundlern muss die URL gesetzt werden
setWorkerUrl(workerUrl)

export interface SituationMapOptions {
  container: HTMLElement
  source: VectorSourceSpecification
  scheme: ColorScheme
  showLabels: boolean
  interactive: boolean
  center: LngLat
  zoom: number
  bearing: number
  pitch: number
}

const GLYPHS_URL = `${location.origin}${import.meta.env.BASE_URL}fonts/{fontstack}/{range}.pbf`

function buildStyle({ source, scheme, showLabels }: SituationMapOptions): StyleSpecification {
  const style = withColorScheme(baseStyle as StyleSpecification, scheme)
  style.sources.openmaptiles = source
  style.glyphs = GLYPHS_URL
  const label = style.layers.find((layer) => layer.id === 'road-label')
  if (label) label.layout = { ...label.layout, visibility: showLabels ? 'visible' : 'none' }
  return style
}

/** Straßenlinien aller geladenen Tiles, mit dem Filter des Straßen-Layers */
function collectRoadLines(map: MapLibreMap): RoadLine[] {
  const filter = map.getFilter('road') as FilterSpecification | undefined
  const features = map.querySourceFeatures('openmaptiles', { sourceLayer: 'transportation', filter })
  const lines: RoadLine[] = []
  for (const { geometry, properties } of features) {
    const roadClass = String(properties.class)
    if (geometry.type === 'LineString') lines.push({ coordinates: geometry.coordinates as LngLat[], roadClass })
    if (geometry.type === 'MultiLineString') {
      for (const coordinates of geometry.coordinates) lines.push({ coordinates: coordinates as LngLat[], roadClass })
    }
  }
  return lines
}

/** Mittelinseln neu berechnen, sobald neue Tiles da sind (einmal je Ruhephase der Karte) */
function trackRoundaboutIslands(map: MapLibreMap) {
  let dirty = true
  let lastSignature = ''
  map.on('sourcedata', (e) => {
    if (e.sourceId === 'openmaptiles' && e.tile) dirty = true
  })
  map.on('idle', () => {
    if (!dirty) return
    dirty = false
    const lines = collectRoadLines(map)
    const signature = `${lines.length}:${lines.reduce((sum, line) => sum + line.coordinates.length, 0)}`
    if (signature === lastSignature) return
    lastSignature = signature
    map.getSource<GeoJSONSource>('roundabout-islands')?.setData(findRoundaboutIslands(lines))
  })
}

export function createSituationMap(options: SituationMapOptions): MapLibreMap {
  const { container, interactive, center, zoom, bearing, pitch } = options
  const map = new MapLibreMap({
    container,
    style: buildStyle(options),
    center,
    zoom,
    bearing,
    pitch,
    maxZoom: 20,
    // Statisch: keine Handler, kein Greif-Cursor. Interaktiv: nur Pan und Pinch-Zoom.
    interactive,
    attributionControl: false, // eigene, dezente Attribution unten rechts
    fadeDuration: 0,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    keyboard: false,
    doubleClickZoom: false,
    boxZoom: false,
  })
  if (interactive) map.touchZoomRotate.disableRotation()

  // Container-Größe kann sich nach dem Start ändern (Layout, Webfonts, Breakpoints)
  const resizeObserver = new ResizeObserver(() => map.resize())
  resizeObserver.observe(container)
  map.once('remove', () => resizeObserver.disconnect())

  map.on('error', (e) => console.error('[SituationMap]', e.error))
  trackRoundaboutIslands(map)
  if (import.meta.env.DEV) window.__maps = [...(window.__maps ?? []), map] // für Browser-Tests
  return map
}
