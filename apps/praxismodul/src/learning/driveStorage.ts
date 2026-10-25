// Speicherformat der Fahrten im Browser (localStorage), versioniert und beim Lesen geprüft.
// Unbrauchbare Einträge (z. B. eine Strecke, die es nach einem Neuerzeugen nicht mehr gibt) werden
// übersprungen statt die App abstürzen zu lassen; unlesbare Rohdaten werden gesichert.
import { ROUTES } from '../data/routes'
import type { Answer, Answers } from './evaluation'
import { LEVELS, type RouteSlot } from './levels'
import { parseGeneral, type GeneralRating } from './generalBehavior'

export interface DriveRecord {
  id: string
  /** Zeitpunkt der Fahrt (ISO) */
  date: string
  levelId: number
  slot: RouteSlot
  routeId: string
  answers: Answers
  /** Punkt-ids mit schwerem Fehler */
  severe: string[]
  /** allgemeine Fahrverhaltensbewertung am Ende; fehlt bei Fahrten von vor ihrer Einführung */
  general?: GeneralRating
  /** Startwert für das simulierte Fahrverhalten (Tempoprofil) */
  driverSeed: number
}

interface StoredDrivesV2 {
  version: 2
  records: unknown[]
}

export interface StorageResult {
  /** undefined: noch nichts gespeichert (dann gelten die Beispielfahrten) */
  records?: DriveRecord[]
  /** übersprungene, unbrauchbare Einträge */
  skipped: number
  /** Speicherinhalt war gar nicht lesbar und wurde gesichert */
  unreadable: boolean
}

const KEY = 'digifl.drives'
const LEGACY_KEY_V1 = 'digifl.drives.v1' // Format 1: reines Array ohne Versionsangabe
const BACKUP_KEY = 'digifl.drives.backup'

const SLOTS = new Set<string>(['A', 'B', 'C'])
const ANSWERS = new Set<string>(['done', 'missed', 'unseen'])
const ROUTE_IDS = new Set(ROUTES.map((r) => r.id))

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Antworten übernehmen, ungültige Werte verwerfen */
export function parseAnswers(value: unknown): Answers {
  const answers: Answers = {}
  if (!isObject(value)) return answers
  for (const [pointId, checks] of Object.entries(value)) {
    if (!isObject(checks)) continue
    const valid = Object.entries(checks).filter(
      (entry): entry is [string, Answer] => typeof entry[1] === 'string' && ANSWERS.has(entry[1]),
    )
    answers[pointId] = Object.fromEntries(valid)
  }
  return answers
}

/** Punkt-ids mit schwerem Fehler übernehmen; alles andere verwerfen */
export function parseSevere(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string'))] : []
}

/** Einen gespeicherten Eintrag prüfen; undefined, wenn er nicht (mehr) verwendbar ist */
export function parseRecord(value: unknown): DriveRecord | undefined {
  if (!isObject(value)) return undefined
  const { id, date, levelId, slot, routeId, answers, severe, general, driverSeed } = value
  if (typeof id !== 'string' || typeof date !== 'string' || Number.isNaN(Date.parse(date))) return undefined
  if (typeof slot !== 'string' || !SLOTS.has(slot)) return undefined
  if (typeof routeId !== 'string' || !ROUTE_IDS.has(routeId)) return undefined
  const level = LEVELS.find((l) => l.id === levelId)
  if (!level || typeof driverSeed !== 'number' || !Number.isFinite(driverSeed)) return undefined
  return {
    id,
    date,
    levelId: level.id,
    slot: slot as RouteSlot,
    routeId,
    answers: parseAnswers(answers),
    severe: parseSevere(severe),
    general: parseGeneral(general),
    driverSeed,
  }
}

function parseList(list: unknown[]) {
  const records = list.map(parseRecord).filter((r): r is DriveRecord => r !== undefined)
  return { records, skipped: list.length - records.length }
}

function backup(raw: string) {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify({ savedAt: new Date().toISOString(), raw }))
  } catch {
    // Sicherung nicht möglich: Rohdaten bleiben zumindest unter dem alten Schlüssel liegen
  }
}

export function readDriveStorage(): StorageResult {
  let raw: string | null
  try {
    raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY_V1)
  } catch {
    return { skipped: 0, unreadable: false } // Speicher gesperrt (z. B. privater Modus)
  }
  if (raw === null) return { skipped: 0, unreadable: false }

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    backup(raw)
    return { skipped: 0, unreadable: true }
  }
  if (Array.isArray(data)) return { ...parseList(data), unreadable: false } // Format 1
  if (isObject(data) && data.version === 2 && Array.isArray(data.records)) {
    return { ...parseList(data.records), unreadable: false }
  }
  backup(raw)
  return { skipped: 0, unreadable: true }
}

export function writeDriveStorage(records: DriveRecord[]) {
  const stored: StoredDrivesV2 = { version: 2, records }
  try {
    localStorage.setItem(KEY, JSON.stringify(stored))
    localStorage.removeItem(LEGACY_KEY_V1)
  } catch {
    // Speichern nicht möglich: Fahrt bleibt bis zum Neuladen im Speicher
  }
}
