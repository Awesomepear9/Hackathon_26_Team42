// Kameraführung wie in einem Navi: Ansichten als reine Funktionen (Ziel-Kamera je Ansicht)
// und Überblendung zwischen zwei Kameras. Die Animation steckt in useNavCamera.
import {
  fromMercator,
  lerpAngle,
  MERCATOR_TILE_SIZE,
  metersPerPixel,
  moveAlong,
  toMercator,
  type LngLat,
  type Point,
} from './geo'

export type NavView = 'heading' | 'perspective' | 'overview'

export const NAV_VIEWS: { id: NavView; label: string; description: string }[] = [
  { id: 'heading', label: 'Fahrtrichtung', description: 'Draufsicht, Fahrtrichtung oben' },
  { id: 'perspective', label: '3D', description: 'Perspektive hinter dem Fahrzeug' },
  { id: 'overview', label: 'Übersicht', description: 'Ganze Strecke' },
]

export interface Camera extends Point {
  zoom: number
  bearing: number
  pitch: number
}

export interface Size {
  width: number
  height: number
}

// Folgeansichten: Zoom, Neigung und wie weit das Fahrzeug unter der Bildmitte sitzt (Anteil der Höhe).
// In der Schrägansicht wirkt der Versatz durch die Perspektive stärker, darum ist er dort kleiner.
const FOLLOW: Record<Exclude<NavView, 'overview'>, { zoom: number; pitch: number; below: number }> = {
  heading: { zoom: 17.2, pitch: 0, below: 0.25 },
  perspective: { zoom: 17.6, pitch: 60, below: 0.32 },
}

const OVERVIEW_PADDING_PX = 28
const OVERVIEW_MAX_ZOOM = 17
const OVERVIEW_MIN_ZOOM = 3

/** Kamera, die die ganze Strecke mit Rand ins Bild setzt */
export function overviewCamera(points: LngLat[], { width, height }: Size): Camera {
  const projected = points.map(([lng, lat]) => toMercator({ lng, lat }))
  const xs = projected.map((p) => p.x)
  const ys = projected.map((p) => p.y)
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const scale = Math.min(
    // Element kann kurzzeitig 0 px groß gemessen werden: mindestens 1 px Platz annehmen
    Math.max(1, width - 2 * OVERVIEW_PADDING_PX) / Math.max((maxX - minX) * MERCATOR_TILE_SIZE, 1e-9),
    Math.max(1, height - 2 * OVERVIEW_PADDING_PX) / Math.max((maxY - minY) * MERCATOR_TILE_SIZE, 1e-9),
  )
  return {
    ...fromMercator((minX + maxX) / 2, (minY + maxY) / 2),
    zoom: Math.max(OVERVIEW_MIN_ZOOM, Math.min(OVERVIEW_MAX_ZOOM, Math.log2(scale))),
    bearing: 0,
    pitch: 0,
  }
}

/** Abweichungen von den Standardwerten einer Folgeansicht */
export interface FollowOverrides {
  zoom?: number
  /** Fahrzeugposition unter der Bildmitte als Anteil der Höhe */
  below?: number
}

/** Kamera hinter dem Fahrzeug, Fahrtrichtung oben, Fahrzeug im unteren Bildteil */
export function followCamera(
  view: Exclude<NavView, 'overview'>,
  position: Point,
  heading: number,
  size: Size,
  overrides: FollowOverrides = {},
): Camera {
  const { zoom, pitch, below } = { ...FOLLOW[view], ...overrides }
  const ahead = below * size.height * metersPerPixel(position.lat, zoom)
  return { ...moveAlong(position, heading, ahead), zoom, bearing: heading, pitch }
}

export function cameraFor(
  view: NavView,
  position: Point,
  heading: number,
  size: Size,
  overview: Camera,
  overrides?: FollowOverrides,
): Camera {
  return view === 'overview' ? overview : followCamera(view, position, heading, size, overrides)
}

/** Weicher Verlauf (ease-in-out) für Übergänge */
export const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2)

export function blendCameras(from: Camera, to: Camera, k: number): Camera {
  const mix = (a: number, b: number) => a + (b - a) * k
  return {
    lng: mix(from.lng, to.lng),
    lat: mix(from.lat, to.lat),
    zoom: mix(from.zoom, to.zoom),
    pitch: mix(from.pitch, to.pitch),
    bearing: lerpAngle(from.bearing, to.bearing, k),
  }
}
