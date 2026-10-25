import type { PointKind } from './learningPoints'

export type RouteSlot = 'A' | 'B' | 'C'

export interface LevelRoute {
  slot: RouteSlot
  /** id der Strecke in src/data/fulda.json */
  routeId: string
}

export interface Level {
  id: number
  title: string
  /** Lernthemen-Chips in der Level-Auswahl */
  topics: string[]
  /** Lernpunkte, die in einer Fahrt dieses Levels bewertet werden */
  points: PointKind[]
  routes: LevelRoute[]
}

/**
 * Note, ab der eine Fahrt das Level abschließt und das nächste freischaltet – vorausgesetzt, es gab
 * keinen schweren Fehler („LvL bestanden, wenn kein *0“)
 */
export const PASSING_SCORE = 8

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Vorfahrt',
    topics: ['205 Vorfahrt gewähren', '206 Halt. Vorfahrt gewähren', '215 Kreisverkehr'],
    points: ['vorfahrt-achten', 'stopp', 'kreisverkehr'],
    routes: [
      { slot: 'A', routeId: 'bronnzell' },
      { slot: 'B', routeId: 'suedend' },
      { slot: 'C', routeId: 'magdeburger' },
    ],
  },
  {
    id: 2,
    title: 'Rechts vor Links',
    topics: ['102 Rechts vor Links', 'Ausnahmen', '325 Verkehrsberuhigter Bereich', '220 Einbahnstraße'],
    points: ['rechts-vor-links', 'spielstrasse', 'spielstrasse-ende', 'einbahnstrasse'],
    routes: [
      { slot: 'A', routeId: 'altstadt' },
      { slot: 'B', routeId: 'suedend' },
      { slot: 'C', routeId: 'magdeburger' },
    ],
  },
  {
    id: 3,
    title: 'Ampeln & Spuren',
    topics: ['Ampelkreuzung', 'Spurwechsel', '350 Fußgängerüberweg'],
    points: ['ampel', 'einfaedeln', 'zebrastreifen'],
    routes: [
      { slot: 'A', routeId: 'innenstadt' },
      { slot: 'B', routeId: 'a7' },
      { slot: 'C', routeId: 'magdeburger' },
    ],
  },
  {
    id: 4,
    title: 'Parken & Manöver',
    topics: [
      'Einparken',
      'Wenden',
      'Gefahrenbremsung',
      '151 Bahnübergang',
      'Abknickende Vorfahrt',
      '267 Verbot der Einfahrt',
    ],
    points: [], // noch ohne simulierte Strecken
    routes: [],
  },
  { id: 5, title: 'Kombifahrten', topics: ['Kombinationsfahrten'], points: [], routes: [] },
]

export function levelById(id: number): Level {
  const level = LEVELS.find((l) => l.id === id)
  if (!level) throw new Error(`Unbekanntes Level: ${id}`)
  return level
}
