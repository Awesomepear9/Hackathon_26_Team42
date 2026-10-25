// Verkehrslage je Route. Austauschbare Quelle:
//   simulation  Beispielwerte der Fulda-Simulation (Standard)
//   osm         Schätzung aus OpenStreetMap-Straßendaten der Strecke (Produktivbetrieb ohne Verkehrsdienst)
// OpenStreetMap enthält keine Live-Verkehrsdaten. Die OSM-Quelle schätzt die übliche Belastung aus
// Straßenklassen und Ampeldichte; sie heißt in der Oberfläche darum „Verkehrslage“ statt „Live-Verkehr“.
// Ein echter Live-Dienst (z. B. TomTom Traffic Flow) passt über dieselbe Schnittstelle.
// Auswahl: VITE_TRAFFIC_SOURCE=simulation|osm
import type { Route } from '../data/routes'

export type TrafficLevel = 'low' | 'medium' | 'high'

export interface TrafficProvider {
  id: 'simulation' | 'osm'
  /** Überschrift der Routenliste */
  heading: string
  /** asynchron, damit auch ein Live-Dienst angebunden werden kann */
  trafficFor(route: Route): Promise<TrafficLevel>
}

export const TRAFFIC_LABEL: Record<TrafficLevel, string> = { low: 'ruhig', medium: 'mittel', high: 'voll' }

export function trafficNote(level: TrafficLevel, levelId: number) {
  if (level === 'low') return `Ruhig – ideal für Level ${levelId}`
  if (level === 'medium') return 'Etwas Verkehr – möglich'
  return 'Sehr voll – lieber später'
}

/** Beispielwerte der Simulation, je Strecke */
const SIMULATED: Record<string, TrafficLevel> = {
  altstadt: 'low',
  bronnzell: 'low',
  a7: 'low',
  suedend: 'medium',
  innenstadt: 'medium',
  magdeburger: 'high',
}

const simulation: TrafficProvider = {
  id: 'simulation',
  heading: 'Live-Verkehr',
  trafficFor: async (route) => SIMULATED[route.id] ?? 'medium',
}

// Gewicht je Straßenklasse für die übliche Verkehrsbelastung (0 = ruhig, 1 = stark befahren)
const ROAD_LOAD: Record<string, number> = {
  motorway: 1,
  motorway_link: 0.8,
  trunk: 1,
  trunk_link: 0.8,
  primary: 0.9,
  primary_link: 0.7,
  secondary: 0.7,
  secondary_link: 0.6,
  tertiary: 0.45,
  tertiary_link: 0.4,
  unclassified: 0.25,
  residential: 0.15,
  living_street: 0.05,
  service: 0.1,
}

/** Schätzung aus den OSM-Daten der Strecke: Straßenklassen und Ampeln je Kilometer */
export function estimateTrafficFromOsm(route: Route): TrafficLevel {
  const mix = Object.entries(route.roadMix).map(([cls, m]) => [cls, m ?? 0] as const)
  const total = mix.reduce((sum, [, m]) => sum + m, 0) || 1
  const roadLoad = mix.reduce((sum, [cls, m]) => sum + (ROAD_LOAD[cls] ?? 0.3) * m, 0) / total
  const signals = new Set(
    route.events.filter((e) => e.kind.startsWith('ampel')).map((e) => `${e.lng.toFixed(4)},${e.lat.toFixed(4)}`),
  ).size
  const signalsPerKm = signals / (route.distanceM / 1000)
  const score = roadLoad + Math.min(0.3, signalsPerKm * 0.06)
  if (score < 0.4) return 'low'
  if (score < 0.7) return 'medium'
  return 'high'
}

const osm: TrafficProvider = {
  id: 'osm',
  heading: 'Verkehrslage',
  trafficFor: async (route) => estimateTrafficFromOsm(route),
}

export const trafficProvider: TrafficProvider = import.meta.env.VITE_TRAFFIC_SOURCE === 'osm' ? osm : simulation
