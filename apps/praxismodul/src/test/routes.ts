// Künstliche Strecken für Unit-Tests: gerade nach Osten, gleichmäßiges Tempo
import type { Route, RouteEvent } from '../data/routes'
import { metersPerDegreeLng } from '../map/geo'
import type { TrackPoint } from '../map/useRouteReplay'

const LAT = 50.55
const LNG = 9.68
const STEP_M = 10

/** Länge am Punkt `meters` östlich vom Start */
export const lngAt = (meters: number) => LNG + meters / metersPerDegreeLng(LAT)

/** Ereignis an der Stelle `meters` (Zeit passend zum Tempo der Strecke) */
export function eventAt(meters: number, kind: RouteEvent['kind'], text = '', speedKmh = 36): RouteEvent {
  return { t: meters / (speedKmh / 3.6), kind, text, lng: lngAt(meters), lat: LAT }
}

export function straightRoute({
  meters = 1000,
  speedKmh = 36,
  events = [],
  id = 'test',
}: {
  meters?: number
  speedKmh?: number
  events?: RouteEvent[]
  id?: string
} = {}): Route {
  const speed = speedKmh / 3.6
  const track: TrackPoint[] = []
  for (let m = 0; m <= meters; m += STEP_M) track.push([lngAt(m), LAT, m / speed])
  return {
    id,
    title: 'Teststrecke',
    startTime: '2026-01-01T08:00:00',
    durationS: meters / speed,
    distanceM: meters,
    roadMix: {},
    track,
    events,
  }
}
