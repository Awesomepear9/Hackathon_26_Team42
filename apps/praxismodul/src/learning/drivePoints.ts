import type { Route, RouteEvent } from '../data/routes'
import { distanceMeters } from '../map/geo'
import type { TrafficSignId } from '../signs/trafficSigns'
import { LEARNING_POINTS, pointKindOf, type LearningPointType, type PointKind } from './learningPoints'
import type { Level } from './levels'

/** Ein Lernpunkt auf einer konkreten Strecke */
export interface DrivePoint {
  /** stabil je Strecke, Schlüssel für die Antworten */
  id: string
  /** 1-basiert, wie in „Punkt 1 von 3“ */
  number: number
  kind: PointKind
  type: LearningPointType
  /** amtliches Zeichen; fehlt, wenn es keins gibt (z. B. Einfädeln auf eine Bundesstraße) */
  sign?: TrafficSignId
  event: RouteEvent
  /** Strecke bis zum Punkt in Metern */
  along: number
}

/** Kumulierte Strecke je Track-Punkt in Metern */
export function cumulativeDistances(route: Route) {
  const along = [0]
  for (let i = 1; i < route.track.length; i++) {
    const [lng1, lat1] = route.track[i - 1]
    const [lng2, lat2] = route.track[i]
    along.push(along[i - 1] + distanceMeters({ lng: lng1, lat: lat1 }, { lng: lng2, lat: lat2 }))
  }
  return along
}

/** Strecke in Metern zum Zeitpunkt t */
export function distanceAt(route: Route, along: number[], t: number) {
  const i = route.track.findIndex(([, , pt]) => pt >= t)
  return i < 0 ? along[along.length - 1] : along[i]
}

function signFor(kind: PointKind, event: RouteEvent): TrafficSignId | undefined {
  if (kind === 'einfaedeln') return /\bA \d/.test(event.text) ? '330.1' : undefined
  return LEARNING_POINTS[kind].sign
}

/** Lernpunkte einer Fahrt: alle Ereignisse der Strecke, die zum Level gehören, je Ort einmal */
export function drivePoints(route: Route, level: Level): DrivePoint[] {
  const along = cumulativeDistances(route)
  const seen = new Set<string>()
  const points: DrivePoint[] = []
  for (const event of route.events) {
    const kind = pointKindOf(event)
    if (!kind || !level.points.includes(kind)) continue
    const id = `${kind}@${event.lng.toFixed(5)},${event.lat.toFixed(5)}`
    if (seen.has(id)) continue
    seen.add(id)
    points.push({
      id,
      number: points.length + 1,
      kind,
      type: LEARNING_POINTS[kind],
      sign: signFor(kind, event),
      event,
      along: distanceAt(route, along, event.t),
    })
  }
  return points
}
