import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseRecord, readDriveStorage, writeDriveStorage, type DriveRecord } from './driveStorage'

/** localStorage-Ersatz für Node */
function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  }
}

const RECORD: DriveRecord = {
  id: 'fahrt-1',
  date: '2026-10-24T16:30:00.000Z',
  levelId: 2,
  slot: 'A',
  routeId: 'altstadt',
  answers: { 'rechts-vor-links@9.67000,50.55000': { blick: 'done', tempo: 'missed' } },
  severe: ['rechts-vor-links@9.67000,50.55000'],
  general: { answers: { spur: 'done', blick: 'missed', geschwindigkeit: 'done' }, severe: false, stars: 4 },
  driverSeed: 42,
}

let storage: Storage
beforeEach(() => {
  storage = memoryStorage()
  vi.stubGlobal('localStorage', storage)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('parseRecord', () => {
  it('übernimmt einen gültigen Eintrag', () => {
    expect(parseRecord(RECORD)).toEqual(RECORD)
  })

  it.each([
    ['kein Objekt', 'fahrt'],
    ['ohne id', { ...RECORD, id: 1 }],
    ['ungültiges Datum', { ...RECORD, date: 'gestern' }],
    ['unbekannte Route', { ...RECORD, slot: 'D' }],
    ['unbekannte Strecke', { ...RECORD, routeId: 'gibt-es-nicht' }],
    ['unbekanntes Level', { ...RECORD, levelId: 99 }],
    ['ungültiger Startwert', { ...RECORD, driverSeed: Number.NaN }],
  ])('verwirft: %s', (_, value) => {
    expect(parseRecord(value)).toBeUndefined()
  })

  it('Fahrten von vor dem Katalog: ohne schwere Fehler und ohne Fahrverhalten', () => {
    const old: Record<string, unknown> = { ...RECORD }
    delete old.severe
    delete old.general
    expect(parseRecord(old)).toEqual({ ...RECORD, severe: [], general: undefined })
  })

  it('verwirft ungültige Fahrverhaltens-Werte und schwere Fehler', () => {
    const parsed = parseRecord({
      ...RECORD,
      severe: ['p', 3, 'p'],
      general: { answers: { spur: 'done', blick: 'vielleicht', unbekannt: 'done' }, severe: 'ja', stars: 7 },
    })
    expect(parsed?.severe).toEqual(['p'])
    expect(parsed?.general).toEqual({ answers: { spur: 'done' }, severe: false, stars: undefined })
  })

  it('verwirft ungültige Antworten, behält den Rest', () => {
    const parsed = parseRecord({ ...RECORD, answers: { p: { a: 'done', b: 'vielleicht', c: 3 }, q: 'kaputt' } })
    expect(parsed?.answers).toEqual({ p: { a: 'done' } })
  })
})

describe('readDriveStorage / writeDriveStorage', () => {
  it('ohne gespeicherte Daten: keine Einträge (dann gelten die Beispielfahrten)', () => {
    expect(readDriveStorage()).toEqual({ skipped: 0, unreadable: false })
  })

  it('speichert versioniert und liest wieder', () => {
    writeDriveStorage([RECORD])
    expect(JSON.parse(storage.getItem('digifl.drives') ?? '')).toMatchObject({ version: 2 })
    expect(readDriveStorage()).toEqual({ records: [RECORD], skipped: 0, unreadable: false })
  })

  it('liest Format 1 (reines Array) und räumt es beim Speichern ab', () => {
    storage.setItem('digifl.drives.v1', JSON.stringify([RECORD]))
    expect(readDriveStorage().records).toEqual([RECORD])
    writeDriveStorage([RECORD])
    expect(storage.getItem('digifl.drives.v1')).toBeNull()
  })

  it('überspringt unbrauchbare Einträge und zählt sie', () => {
    writeDriveStorage([RECORD, { ...RECORD, routeId: 'alt' } as DriveRecord])
    expect(readDriveStorage()).toEqual({ records: [RECORD], skipped: 1, unreadable: false })
  })

  it.each([
    ['kaputtes JSON', '{"version":2,'],
    ['fremdes Format', '{"version":7,"records":[]}'],
    ['falscher Typ', '"text"'],
  ])('%s: meldet unlesbar und sichert die Rohdaten', (_, raw) => {
    storage.setItem('digifl.drives', raw)
    expect(readDriveStorage()).toEqual({ skipped: 0, unreadable: true })
    expect(JSON.parse(storage.getItem('digifl.drives.backup') ?? '')).toMatchObject({ raw })
    expect(storage.getItem('digifl.drives')).toBe(raw) // Original bleibt bis zum nächsten Speichern
  })

  it('gesperrter Speicher (privater Modus): kein Absturz', () => {
    const fail = () => {
      throw new DOMException('gesperrt', 'SecurityError')
    }
    vi.stubGlobal('localStorage', { ...storage, getItem: fail, setItem: fail, removeItem: fail })
    expect(readDriveStorage()).toEqual({ skipped: 0, unreadable: false })
    expect(() => writeDriveStorage([RECORD])).not.toThrow()
  })
})
