// Gefahrene Fahrten: Beispielverlauf + eigene Fahrten (lokal im Browser gespeichert).
import { useSyncExternalStore } from 'react'
import { routeById, type Route } from '../data/routes'
import { drivePoints, type DrivePoint } from './drivePoints'
import { driveScore, speedCheck, speedProfile, type Answer, type Answers } from './evaluation'
import { readDriveStorage, writeDriveStorage, type DriveRecord } from './driveStorage'
import { levelById, LEVELS, PASSING_SCORE, type Level, type RouteSlot } from './levels'
import { GENERAL_CRITERIA, SPEED_CRITERION, type GeneralRating } from './generalBehavior'

export type { DriveRecord }

export interface Drive extends DriveRecord {
  level: Level
  route: Route
  points: DrivePoint[]
  distanceKm: number
  durationMin: number
  /** Sterne 0–10 */
  score: number
  /** Fahraufgaben 0–1 */
  pointsShare: number
  /** allgemeines Fahrverhalten 0–1; fehlt bei älteren Fahrten */
  generalShare?: number
  /** schwerer Fehler in der Fahrt: zählt nicht zum Bestehen des Levels */
  hasSevere: boolean
  /** Level mit dieser Fahrt bestanden: ab PASSING_SCORE und ohne schweren Fehler */
  passed: boolean
  /** Anteil der Strecke im Tempolimit (nur zur Information, zählt nicht zur Note) */
  compliance: number
}

export const KM_GOAL = 1000

export function evaluateDrive(record: DriveRecord): Drive {
  const level = levelById(record.levelId)
  const route = routeById(record.routeId)
  const points = drivePoints(route, level)
  const { compliance } = speedProfile(route, record.driverSeed)
  const {
    score,
    points: pointsShare,
    general: generalShare,
    severe: hasSevere,
  } = driveScore(record.answers, record.severe, record.general)
  return {
    ...record,
    level,
    route,
    points,
    distanceKm: route.distanceM / 1000,
    durationMin: Math.max(1, Math.round(route.durationS / 60)),
    score,
    pointsShare,
    generalShare,
    hasSevere,
    passed: !hasSevere && score >= PASSING_SCORE,
    compliance,
  }
}

// --- Beispielverlauf -----------------------------------------------------------------------

/** Deterministischer Zufall, damit der Beispielverlauf bei jedem Start gleich ist */
function seededRandom(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Antworten einer Beispielfahrt; `skill` ist die Wahrscheinlichkeit für „gemacht“ */
function sampleAnswers(record: Pick<DriveRecord, 'driverSeed' | 'routeId' | 'levelId'>, skill: number): Answers {
  const random = seededRandom(record.driverSeed)
  const answers: Answers = {}
  for (const point of drivePoints(routeById(record.routeId), levelById(record.levelId))) {
    answers[point.id] = {}
    for (const check of point.type.checks) {
      const r = random()
      const answer: Answer = r < skill ? 'done' : r < skill + (1 - skill) * 0.65 ? 'missed' : 'unseen'
      answers[point.id][check.id] = answer
    }
  }
  return answers
}

/** Allgemeines Fahrverhalten einer Beispielfahrt: Kriterien wie die Fahraufgaben, Tempo nach App-Regel */
function sampleGeneral(record: Pick<DriveRecord, 'driverSeed' | 'routeId'>, skill: number): GeneralRating {
  const random = seededRandom(record.driverSeed + 1)
  const { samples } = speedProfile(routeById(record.routeId), record.driverSeed)
  const answers: Record<string, Answer> = {}
  for (const criterion of GENERAL_CRITERIA) {
    if (criterion.id === SPEED_CRITERION) answers[criterion.id] = speedCheck(samples).violated ? 'missed' : 'done'
    else answers[criterion.id] = random() < skill + 0.15 ? 'done' : 'missed'
  }
  return { answers, severe: false, stars: Math.max(1, Math.min(5, Math.round(skill * 5 + (random() - 0.5)))) }
}

// Tage vor heute, Level, Route, Können (Anteil „gemacht“)
const SAMPLE_PLAN: [daysAgo: number, levelId: number, slot: RouteSlot, skill: number][] = [
  [0, 2, 'A', 0.5],
  [2, 2, 'B', 0.55],
  [5, 1, 'C', 0.96],
  [8, 1, 'A', 0.8],
  [10, 1, 'B', 0.62],
  [11, 1, 'A', 0.7],
  [13, 1, 'B', 0.58],
  [16, 1, 'C', 0.66],
  [19, 1, 'A', 0.6],
  [22, 1, 'B', 0.52],
  [26, 1, 'A', 0.55],
  [30, 1, 'B', 0.45],
]

export function sampleDrives(today = new Date()): DriveRecord[] {
  return SAMPLE_PLAN.map(([daysAgo, levelId, slot, skill], i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(16, 30, 0, 0)
    const routeId = levelById(levelId).routes.find((r) => r.slot === slot)?.routeId ?? 'suedend'
    const base = { id: `beispiel-${i + 1}`, date: date.toISOString(), levelId, slot, routeId, driverSeed: 101 + i * 7 }
    return { ...base, answers: sampleAnswers(base, skill), severe: [], general: sampleGeneral(base, skill) }
  })
}

// --- Speicher -----------------------------------------------------------------------------

export interface DriveStore {
  /** alle Fahrten, neueste zuerst */
  drives: Drive[]
  /** Hinweis, wenn gespeicherte Fahrten nicht gelesen werden konnten */
  issue?: 'skipped' | 'unreadable'
}

const listeners = new Set<() => void>()
let cache: DriveStore | undefined

function snapshot(): DriveStore {
  if (!cache) {
    const { records, skipped, unreadable } = readDriveStorage()
    const drives = (records ?? sampleDrives()).map(evaluateDrive).sort((a, b) => b.date.localeCompare(a.date))
    cache = { drives, issue: unreadable ? 'unreadable' : skipped > 0 ? 'skipped' : undefined }
  }
  return cache
}

export function addDrive(record: DriveRecord) {
  writeDriveStorage([record, ...snapshot().drives.map(toRecord)])
  cache = undefined
  listeners.forEach((listener) => listener())
}

function toRecord({ id, date, levelId, slot, routeId, answers, severe, general, driverSeed }: Drive): DriveRecord {
  return { id, date, levelId, slot, routeId, answers, severe, general, driverSeed }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useDriveStore(): DriveStore {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

/** Alle Fahrten, neueste zuerst */
export function useDrives(): Drive[] {
  return useDriveStore().drives
}

// --- Fortschritt -------------------------------------------------------------------------

export interface LevelProgress {
  level: Level
  /** 0–100: beste Note des Levels × 10 */
  percent: number
  completed: boolean
  unlocked: boolean
}

/** Ø Sterne aller Fahrten eines Levels; undefined, solange es dort keine Fahrt gibt */
export function levelAverage(drives: Drive[], levelId: number): number | undefined {
  const scores = drives.filter((d) => d.levelId === levelId).map((d) => d.score)
  return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : undefined
}

/** Level, an dem gerade gearbeitet wird: das erste offene, sonst das letzte freigeschaltete */
export function activeLevel(progress: LevelProgress[]): LevelProgress {
  return progress.find((p) => p.unlocked && !p.completed) ?? progress.filter((p) => p.unlocked).at(-1) ?? progress[0]
}

export function levelProgress(drives: Drive[]): LevelProgress[] {
  let previousCompleted = true
  return LEVELS.map((level) => {
    const levelDrives = drives.filter((d) => d.levelId === level.id)
    const best = Math.max(0, ...levelDrives.map((d) => d.score))
    const completed = levelDrives.some((d) => d.passed)
    const progress = {
      level,
      percent: completed ? 100 : Math.round(best * 10),
      completed,
      unlocked: previousCompleted && level.routes.length > 0,
    }
    previousCompleted = completed
    return progress
  })
}
