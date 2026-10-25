// Geometrie-Hilfen für kleine Distanzen (lokale Projektion, genau genug für Stadtgebiete).

export type LngLat = [lng: number, lat: number]

export interface Point {
  lng: number
  lat: number
}

const METERS_PER_DEGREE_LAT = 110540
const METERS_PER_DEGREE_LNG_EQUATOR = 111320
const EARTH_CIRCUMFERENCE = 40075016.686
const TILE_SIZE = 512

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/** Meter je Längengrad auf der Breite `lat` */
export const metersPerDegreeLng = (lat: number) => METERS_PER_DEGREE_LNG_EQUATOR * Math.cos(toRad(lat))

/** Lokale Projektion in Meter relativ zum Längen-/Breitengrad 0 (für Flächen und Abstände) */
export function toMeters({ lng, lat }: Point, referenceLat = lat) {
  return { x: lng * metersPerDegreeLng(referenceLat), y: lat * METERS_PER_DEGREE_LAT }
}

export function distanceMeters(a: Point, b: Point) {
  return Math.hypot((b.lng - a.lng) * metersPerDegreeLng(a.lat), (b.lat - a.lat) * METERS_PER_DEGREE_LAT)
}

/** Richtung von a nach b in Grad, 0 = Norden, im Uhrzeigersinn */
export function bearingDegrees(a: Point, b: Point) {
  const dx = (b.lng - a.lng) * metersPerDegreeLng(a.lat)
  const dy = (b.lat - a.lat) * METERS_PER_DEGREE_LAT
  return (toDeg(Math.atan2(dx, dy)) + 360) % 360
}

/** Punkt `meters` in Richtung `bearing` von `from` aus */
export function moveAlong(from: Point, bearing: number, meters: number): Point {
  const b = toRad(bearing)
  return {
    lng: from.lng + (Math.sin(b) * meters) / metersPerDegreeLng(from.lat),
    lat: from.lat + (Math.cos(b) * meters) / METERS_PER_DEGREE_LAT,
  }
}

/** Bodenauflösung der Karte (512-px-Kacheln wie in MapLibre) */
export function metersPerPixel(lat: number, zoom: number) {
  return (EARTH_CIRCUMFERENCE * Math.cos(toRad(lat))) / (TILE_SIZE * 2 ** zoom)
}

/** Kürzeste Drehung von `from` nach `to` in Grad (−180 … 180) */
export function shortestTurn(from: number, to: number) {
  return ((to - from + 540) % 360) - 180
}

/** Winkel auf dem kürzesten Weg interpolieren, Ergebnis 0 … 360 */
export function lerpAngle(from: number, to: number, k: number) {
  return (from + shortestTurn(from, to) * k + 360) % 360
}

const DIRECTIONS = ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwesten', 'Westen', 'Nordwesten']

/** „Nordosten“ usw. für Textbeschreibungen */
export function directionName(bearing: number) {
  return DIRECTIONS[Math.round(bearing / 45) % 8]
}

/** Web-Mercator-Koordinaten 0 … 1 (für Zoom-Berechnungen) */
export function toMercator({ lng, lat }: Point) {
  const s = Math.sin(toRad(lat))
  return { x: (lng + 180) / 360, y: 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI) }
}

export function fromMercator(x: number, y: number): Point {
  return { lng: x * 360 - 180, lat: toDeg(Math.atan(Math.sinh(Math.PI * (1 - 2 * y)))) }
}

export const MERCATOR_TILE_SIZE = TILE_SIZE
