import type { TrackPoint } from '../map/useRouteReplay'
import data from './fulda.json'

// Simulierte Fahrten auf echten Straßen in Fulda, erzeugt mit `npm run routes`
// (scripts/build-routes.mjs: Strecke von OSRM, Verkehrszeichen und Tempolimits aus OpenStreetMap,
// Wartezeiten simuliert). Die Ereignisarten sind Werte des Datenformats und bleiben deutsch.

export type RouteEventKind =
  | 'start'
  | 'ziel'
  | 'ampel-rot'
  | 'ampel-gruen'
  | 'weiter'
  | 'stopp'
  | 'vorfahrt-achten'
  | 'rechts-vor-links'
  | 'zebrastreifen'
  | 'bahnuebergang'
  | 'tempo'
  | 'abbiegen'
  | 'kreisverkehr'
  | 'auffahrt'
  | 'einfaedeln'
  | 'spielstrasse'
  | 'spielstrasse-ende'
  | 'einbahnstrasse'

export interface RouteEvent {
  /** Sekunden seit Start */
  t: number
  kind: RouteEventKind
  text: string
  /** Wartezeit, die an dieser Stelle beginnt */
  waitS?: number
  lng: number
  lat: number
}

export interface Route {
  id: string
  title: string
  /** lokale Startzeit der Simulation, ISO ohne Zeitzone */
  startTime: string
  durationS: number
  distanceM: number
  /** Meter je OSM-Straßenklasse (für die Schätzung der Verkehrslage) */
  roadMix: Partial<Record<string, number>>
  track: TrackPoint[]
  events: RouteEvent[]
}

// JSON-Importe kennen keine Tupel ([lng, lat, t]); das Format schreibt scripts/build-routes.mjs
export const ROUTES = data.routes as unknown as Route[]
export const ROUTES_SOURCE = data.source

export function routeById(id: string): Route {
  const route = ROUTES.find((r) => r.id === id)
  if (!route) throw new Error(`Unbekannte Strecke: ${id}`)
  return route
}
