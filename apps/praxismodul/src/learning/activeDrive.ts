// Laufende Fahrt im sessionStorage: übersteht das Neuladen des Tabs und endet mit ihm.
// Beim Öffnen derselben Fahrt (Level, Route) geht es an der gespeicherten Stelle weiter.
import { parseAnswers } from './driveStorage'
import type { Answers } from './evaluation'
import type { RouteSlot } from './levels'

export interface ActiveDrive {
  levelId: number
  slot: RouteSlot
  routeId: string
  /** Fahrzeit der Simulation in Sekunden */
  t: number
  answers: Answers
  /** Schwerfehler-Abfrage je Punkt-id: true = Ja, false = Nein */
  severeAnswers: Record<string, boolean>
}

const KEY = 'digifl.activeDrive'
const VERSION = 1

function parseSevereAnswers(value: unknown): Record<string, boolean> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'),
  )
}

/** gespeicherte Fahrt, wenn sie zu Level, Route und Strecke passt */
export function readActiveDrive(levelId: number, slot: RouteSlot, routeId: string): ActiveDrive | undefined {
  let data: unknown
  try {
    data = JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
  } catch {
    return undefined // gesperrt oder kaputt: neu beginnen
  }
  if (typeof data !== 'object' || data === null) return undefined
  const stored = data as Record<string, unknown>
  if (stored.version !== VERSION || stored.levelId !== levelId || stored.slot !== slot) return undefined
  if (stored.routeId !== routeId || typeof stored.t !== 'number' || !Number.isFinite(stored.t)) return undefined
  return {
    levelId,
    slot,
    routeId,
    t: Math.max(0, stored.t),
    answers: parseAnswers(stored.answers),
    severeAnswers: parseSevereAnswers(stored.severeAnswers),
  }
}

export function saveActiveDrive(drive: ActiveDrive) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ version: VERSION, ...drive }))
  } catch {
    // Speicher voll oder gesperrt: die Fahrt läuft trotzdem weiter
  }
}

export function clearActiveDrive() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // nichts zu tun
  }
}
