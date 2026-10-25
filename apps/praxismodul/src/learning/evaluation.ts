// Auswertung einer Fahrt: Tempoprofil, Note, Übungsliste und Tipp.
import type { Route } from '../data/routes'
import { cumulativeDistances, distanceAt, type DrivePoint } from './drivePoints'
import type { PointKind } from './learningPoints'
import { GENERAL_CRITERIA, type GeneralRating } from './generalBehavior'

/** gemacht / nicht gemacht / nicht gesehen */
export type Answer = 'done' | 'missed' | 'unseen'
/** Antworten je Punkt-id und Prüfpunkt-id */
export type Answers = Record<string, Record<string, Answer>>

export interface SpeedSample {
  km: number
  allowed: number
  actual: number
}

const BIN_M = 25 // Auflösung des Tempoprofils
/** so viel über dem Limit gilt noch als eingehalten (Toleranz der Tempo-Regel) */
export const SPEED_TOLERANCE_KMH = 3
const MOVING_KMH = 3
const DEFAULT_LIMIT = 50
const NO_LIMIT = 130 // Richtgeschwindigkeit auf der Autobahn
const WALKING_PACE = 7
// Simuliertes Fahrverhalten (siehe simulatedSpeed)
const DRIVER_VARIATION = 0.12 // Schwankung um das Ziel-Tempo
const TARGET_SHARE = 0.96 // Ziel-Tempo beim freien Fahren als Anteil des Limits
const CRUISING_SHARE = 0.6 // ab diesem Anteil des Limits gilt das Routing-Tempo als freie Fahrt
/** Anteil des allgemeinen Fahrverhaltens an der Gesamtnote; den Rest bilden die Fahraufgaben */
const GENERAL_WEIGHT = 0.5
/** Tempo-Regel der App: Überschreitung zählt erst, wenn sie länger als 3 s über +3 km/h liegt */
export const SPEED_TOLERANCE_S = 3
/** ab so viel über dem Limit weist die App auf einen möglichen schweren Fehler hin */
export const SEVERE_OVER_KMH = 5

/** Erlaubtes Tempo entlang der Strecke aus den Tempo- und Spielstraßen-Ereignissen */
function speedLimits(route: Route, along: number[]) {
  const changes: { at: number; limit: number }[] = []
  let beforeLivingStreet = DEFAULT_LIMIT
  let current = DEFAULT_LIMIT
  for (const event of route.events) {
    let limit: number | undefined
    if (event.kind === 'tempo') {
      const match = event.text.match(/(\d+) km\/h/)
      limit = /ohne Tempolimit/.test(event.text)
        ? NO_LIMIT
        : /Schritt/.test(event.text)
          ? WALKING_PACE
          : Number(match?.[1])
    }
    if (event.kind === 'spielstrasse') {
      beforeLivingStreet = current
      limit = WALKING_PACE
    }
    if (event.kind === 'spielstrasse-ende') limit = beforeLivingStreet
    if (limit === undefined || Number.isNaN(limit)) continue
    current = limit
    changes.push({ at: distanceAt(route, along, event.t), limit })
  }
  const first = changes[0]?.limit ?? DEFAULT_LIMIT
  return (meters: number) => {
    let limit = first
    for (const change of changes) if (change.at <= meters) limit = change.limit
    return limit
  }
}

/** Weiche, reproduzierbare Schwankung −1 … 1 je Fahrt */
function wave(seed: number, meters: number) {
  return 0.65 * Math.sin(meters / 140 + seed * 1.7) + 0.35 * Math.sin(meters / 57 + seed * 3.1)
}

/**
 * Simuliertes Fahrverhalten. Die Routing-Zeiten halten Tempolimits fast immer ein; echte Fahrer
 * orientieren sich beim freien Fahren am Limit und liegen mal knapp darunter, mal darüber.
 * In Kurven, an Kreuzungen und beim Anhalten bleibt das (langsamere) Routing-Tempo.
 */
function simulatedSpeed(routing: number, allowed: number, seed: number, meters: number) {
  const cruising = routing >= CRUISING_SHARE * allowed
  return cruising ? allowed * (TARGET_SHARE + DRIVER_VARIATION * wave(seed, meters)) : routing
}

/** Tempo über die Strecke (25-m-Abschnitte) und Anteil der Strecke im erlaubten Bereich */
export function speedProfile(route: Route, seed: number) {
  const along = cumulativeDistances(route)
  const limitAt = speedLimits(route, along)
  const total = along[along.length - 1]

  // Zeit über der Strecke; Punkte am selben Ort (Wartezeiten) zusammenfassen, letzte Zeit zählt.
  // Die Wartezeit fällt damit in den Abschnitt, der an der Haltestelle endet.
  const distances: number[] = []
  const times: number[] = []
  along.forEach((d, i) => {
    if (distances.length > 0 && d === distances[distances.length - 1]) times[times.length - 1] = route.track[i][2]
    else {
      distances.push(d)
      times.push(route.track[i][2])
    }
  })
  const timeAt = (meters: number) => {
    const i = distances.findIndex((d) => d >= meters)
    if (i <= 0) return times[Math.max(0, i)]
    const f = (meters - distances[i - 1]) / (distances[i] - distances[i - 1])
    return times[i - 1] + (times[i] - times[i - 1]) * f
  }

  const samples: SpeedSample[] = []
  let inside = 0
  let moving = 0
  for (let start = 0; start + BIN_M <= total; start += BIN_M) {
    const dt = timeAt(start + BIN_M) - timeAt(start)
    const routing = dt > 0 ? (BIN_M / dt) * 3.6 : 0
    const allowed = limitAt(start + BIN_M / 2)
    const actual = Math.round(simulatedSpeed(routing, allowed, seed, start) * 10) / 10
    samples.push({ km: (start + BIN_M / 2) / 1000, allowed, actual })
    if (actual > MOVING_KMH) {
      moving++
      if (actual <= allowed + SPEED_TOLERANCE_KMH) inside++
    }
  }
  return { samples, compliance: moving > 0 ? inside / moving : 1 }
}

/**
 * Score einer Fahraufgabe 0–1. Jedes nicht erfüllte Kriterium zählt −1, geteilt durch die bewerteten
 * Kriterien; „nicht gesehen“ (konnte nicht bewertet werden) und leere fallen heraus. Schwerer Fehler
 * = Ja setzt die Aktion auf 0, ohne die −1 zusätzlich zu zählen. undefined: nichts bewertet.
 */
export function pointScore(checks: Record<string, Answer> = {}, severe = false): number | undefined {
  if (severe) return 0
  const rated = Object.values(checks).filter((a) => a !== 'unseen')
  if (rated.length === 0) return undefined
  return 1 - rated.filter((a) => a === 'missed').length / rated.length
}

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

/** Fahraufgaben der Fahrt 0–1: Mittel der bewerteten Aktionen; ohne Bewertung 1 (Start bei 100 %) */
export function pointsScore(answers: Answers, severe: string[] = []): number {
  const ids = new Set([...Object.keys(answers), ...severe])
  const scores = [...ids]
    .map((id) => pointScore(answers[id], severe.includes(id)))
    .filter((score) => score !== undefined)
  return scores.length > 0 ? mean(scores) : 1
}

/** längste zusammenhängende Zeit (s) über `limit + over` im Tempoprofil */
function longestAbove(samples: SpeedSample[], over: number) {
  let longest = 0
  let current = 0
  for (const { allowed, actual } of samples) {
    if (actual > allowed + over) {
      current += BIN_M / (actual / 3.6)
      longest = Math.max(longest, current)
    } else current = 0
  }
  return longest
}

export interface SpeedCheck {
  /** Tempo-Kriterium nicht erfüllt: länger als 3 s über Limit + 3 km/h */
  violated: boolean
  /** höchste Überschreitung in km/h (0 = nie über dem Limit) */
  maxOverKmh: number
  /** länger als 3 s mindestens 5 km/h zu schnell: Hinweis bei der Schwerfehler-Abfrage */
  severeHint: boolean
}

/** Tempo-Kriterium der allgemeinen Bewertung nach der App-Regel (+3 km/h, 3 s Toleranz) */
export function speedCheck(samples: SpeedSample[]): SpeedCheck {
  const maxOver = Math.max(0, ...samples.map((s) => s.actual - s.allowed))
  return {
    violated: longestAbove(samples, SPEED_TOLERANCE_KMH) > SPEED_TOLERANCE_S,
    maxOverKmh: Math.round(maxOver * 10) / 10,
    severeHint: longestAbove(samples, SEVERE_OVER_KMH - 0.05) > SPEED_TOLERANCE_S,
  }
}

/**
 * Allgemeines Fahrverhalten 0–1: wie ein Lernpunkt – je nicht erfülltem Kriterium −1, geteilt durch
 * die bewerteten Kriterien; ein schwerer Fehler setzt es auf 0. undefined bei älteren Fahrten.
 */
export function generalScore(rating: GeneralRating | undefined): number | undefined {
  if (!rating) return undefined
  return pointScore(rating.answers, rating.severe) ?? 1
}

export interface DriveScore {
  /** Gesamtnote 0–10 in halben Sternen */
  score: number
  /** Fahraufgaben (Lernpunkte) 0–1 */
  points: number
  /** allgemeines Fahrverhalten 0–1; fehlt bei älteren Fahrten */
  general?: number
  /** irgendwo ein schwerer Fehler (*0): Level damit nicht bestanden */
  severe: boolean
}

/** Sterne = 10 · (50 % Fahrverhalten + 50 % Fahraufgaben); ohne Fahrverhalten nur die Fahraufgaben */
export function driveScore(answers: Answers, severe: string[] = [], general?: GeneralRating): DriveScore {
  const points = pointsScore(answers, severe)
  const generalPart = generalScore(general)
  const overall = generalPart === undefined ? points : GENERAL_WEIGHT * generalPart + (1 - GENERAL_WEIGHT) * points
  return {
    score: Math.round(overall * 10 * 2) / 2,
    points,
    general: generalPart,
    severe: severe.length > 0 || general?.severe === true,
  }
}

export interface PracticeItem {
  key: string
  practice: string
  pointTitle: string
  /** schwerer Fehler, nicht erfüllt oder nicht bewertbar */
  answer: 'severe' | Exclude<Answer, 'done'>
}

const PRACTICE_ORDER: Record<PracticeItem['answer'], number> = { severe: 0, missed: 1, unseen: 2 }

/**
 * „Hier nochmal üben“: schwere Fehler zuerst, dann nicht erfüllte und nicht bewertbare Kriterien der
 * Fahraufgaben und des allgemeinen Fahrverhaltens, je Thema einmal
 */
export function practiceItems(
  points: DrivePoint[],
  answers: Answers,
  severe: string[] = [],
  general?: GeneralRating,
): PracticeItem[] {
  const items = new Map<string, PracticeItem>()
  const add = (item: PracticeItem) => {
    const existing = items.get(item.key)
    if (!existing || PRACTICE_ORDER[item.answer] < PRACTICE_ORDER[existing.answer]) items.set(item.key, item)
  }
  for (const point of points) {
    if (severe.includes(point.id)) {
      add({ key: `${point.kind}:schwer`, practice: point.type.title, pointTitle: point.type.hint, answer: 'severe' })
    }
    for (const check of point.type.checks) {
      const answer = answers[point.id]?.[check.id]
      if (answer !== 'missed' && answer !== 'unseen') continue
      add({ key: `${point.kind}:${check.id}`, practice: check.practice, pointTitle: point.type.title, answer })
    }
  }
  if (general?.severe) {
    add({ key: 'allgemein:schwer', practice: 'Allgemeines Fahrverhalten', pointTitle: 'Fahrt', answer: 'severe' })
  }
  for (const criterion of GENERAL_CRITERIA) {
    const answer = general?.answers[criterion.id]
    if (answer !== 'missed' && answer !== 'unseen') continue
    add({ key: `allgemein:${criterion.id}`, practice: criterion.practice, pointTitle: criterion.area, answer })
  }
  return [...items.values()].sort((a, b) => PRACTICE_ORDER[a.answer] - PRACTICE_ORDER[b.answer])
}

/** Tipp zum Thema mit den meisten Fehlern (sonst zum ersten Punkt der Fahrt) */
export function nextTip(points: DrivePoint[], answers: Answers): { title: string; text: string } | undefined {
  const misses = new Map<PointKind, number>()
  for (const point of points) {
    const count = Object.values(answers[point.id] ?? {}).filter((a) => a !== 'done').length
    misses.set(point.kind, (misses.get(point.kind) ?? 0) + count)
  }
  const worst = [...misses].sort((a, b) => b[1] - a[1])[0]
  const point = points.find((p) => p.kind === worst?.[0]) ?? points[0]
  return point ? { title: point.type.title, text: point.type.tip } : undefined
}
