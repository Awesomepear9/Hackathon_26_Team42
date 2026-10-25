import { describe, expect, it } from 'vitest'
import { eventAt, straightRoute } from '../test/routes'
import { drivePoints } from './drivePoints'
import {
  driveScore,
  nextTip,
  pointScore,
  pointsScore,
  practiceItems,
  speedProfile,
  SPEED_TOLERANCE_KMH,
  generalScore,
  speedCheck,
  type Answers,
} from './evaluation'
import type { Level } from './levels'

const LEVEL: Level = {
  id: 9,
  title: 'Test',
  topics: [],
  points: ['rechts-vor-links', 'stopp'],
  routes: [{ slot: 'A', routeId: 'test' }],
}

describe('pointScore', () => {
  it('zieht je „nicht gemacht“ 1 / Anzahl bewerteter Bedingungen ab', () => {
    expect(pointScore({ a: 'done', b: 'done', c: 'missed', d: 'done' })).toBe(0.75)
    expect(pointScore({ a: 'missed', b: 'missed' })).toBe(0)
  })

  it('„nicht gesehen“ und leere Bedingungen zählen nicht mit', () => {
    expect(pointScore({ a: 'done', b: 'missed', c: 'unseen' })).toBe(0.5) // 2 statt 3 Bedingungen
    expect(pointScore({ a: 'unseen' })).toBeUndefined()
    expect(pointScore({})).toBeUndefined()
  })

  it('ein schwerer Fehler zieht alles ab', () => {
    expect(pointScore({ a: 'done', b: 'done' }, true)).toBe(0)
    expect(pointScore({}, true)).toBe(0)
  })
})

describe('pointsScore', () => {
  it('mittelt die bewerteten Punkte, unbewertete zählen nicht', () => {
    const answers: Answers = { p1: { a: 'done', b: 'missed' }, p2: { a: 'done' }, p3: { a: 'unseen' } }
    expect(pointsScore(answers)).toBe(0.75)
  })

  it('schwerer Fehler auch an einem sonst unbewerteten Punkt', () => {
    expect(pointsScore({ p1: { a: 'done' } }, ['p2'])).toBe(0.5)
  })

  it('ohne Bewertung 100 %', () => {
    expect(pointsScore({})).toBe(1)
  })
})

describe('generalScore', () => {
  it('je nicht erfülltem Kriterium −1 geteilt durch die bewerteten', () => {
    expect(generalScore({ answers: { a: 'done', b: 'missed', c: 'done', d: 'unseen' }, severe: false })).toBeCloseTo(
      2 / 3,
    )
  })

  it('schwerer Fehler setzt das Fahrverhalten auf 0', () => {
    expect(generalScore({ answers: { a: 'done' }, severe: true })).toBe(0)
  })

  it('ältere Fahrten ohne Bewertung: undefined', () => {
    expect(generalScore(undefined)).toBeUndefined()
  })
})

describe('driveScore', () => {
  const general = (answers: Record<string, 'done' | 'missed'>, severe = false) => ({ answers, severe, stars: 3 })

  it('Sterne = 10 · (50 % Fahrverhalten + 50 % Fahraufgaben)', () => {
    const answers: Answers = { p1: { a: 'done', b: 'missed' } } // Fahraufgaben 0,5
    expect(driveScore(answers, [], general({ x: 'done' }))).toEqual({
      score: 7.5,
      points: 0.5,
      general: 1,
      severe: false,
    })
  })

  it('ohne Fahrverhalten (ältere Fahrten) zählen nur die Fahraufgaben', () => {
    expect(driveScore({ p1: { a: 'done', b: 'missed' } })).toEqual({
      score: 5,
      points: 0.5,
      general: undefined,
      severe: false,
    })
  })

  it('rundet auf halbe Sterne', () => {
    const answers: Answers = { p1: { a: 'done', b: 'done', c: 'missed' } } // 0,667
    expect(driveScore(answers, [], general({ x: 'done', y: 'done', z: 'done', w: 'missed' })).score).toBe(7) // 7,08
  })

  it('schwerer Fehler: Aktion auf 0 und als *0 markiert', () => {
    const result = driveScore({ p1: { a: 'done' }, p2: { a: 'done' } }, ['p2'], general({ x: 'done' }))
    expect(result).toMatchObject({ score: 7.5, severe: true })
  })

  it('schwerer Fehler im Fahrverhalten', () => {
    expect(driveScore({ p1: { a: 'done' } }, [], general({ x: 'done' }, true))).toMatchObject({
      score: 5,
      severe: true,
    })
  })
})

describe('speedCheck', () => {
  const sample = (allowed: number, actual: number) => ({ km: 0, allowed, actual })

  it('kurze Überschreitung innerhalb der Toleranz zählt nicht', () => {
    // 25 m bei 54 km/h ≈ 1,7 s über +3 km/h
    expect(speedCheck([sample(50, 45), sample(50, 54), sample(50, 45)]).violated).toBe(false)
  })

  it('länger als 3 s über +3 km/h: Kriterium nicht erfüllt', () => {
    expect(speedCheck([sample(50, 54), sample(50, 54), sample(50, 54)])).toMatchObject({
      violated: true,
      maxOverKmh: 4,
      severeHint: false,
    })
  })

  it('länger als 3 s ab +5 km/h: Hinweis auf schweren Fehler', () => {
    expect(speedCheck([sample(50, 56), sample(50, 56), sample(50, 56)]).severeHint).toBe(true)
  })
})

describe('speedProfile', () => {
  it('teilt die Strecke in 25-m-Abschnitte', () => {
    const { samples } = speedProfile(straightRoute({ meters: 1000 }), 1)
    expect(samples).toHaveLength(40)
    expect(samples[0].km).toBeCloseTo(0.0125, 6)
    expect(samples.every((s) => s.allowed === 50)).toBe(true) // ohne Tempo-Ereignis innerorts 50
  })

  it('folgt Tempolimits und Spielstraßen', () => {
    const route = straightRoute({
      meters: 1000,
      events: [
        eventAt(0, 'tempo', 'Höchstgeschwindigkeit 30 km/h'),
        eventAt(400, 'spielstrasse', 'Spielstraße'),
        eventAt(600, 'spielstrasse-ende', 'Ende der Spielstraße'),
      ],
    })
    const allowedAt = (km: number) => speedProfile(route, 1).samples.find((s) => s.km > km)?.allowed
    expect(allowedAt(0.1)).toBe(30)
    expect(allowedAt(0.5)).toBe(7)
    expect(allowedAt(0.8)).toBe(30)
  })

  it('übernimmt langsames Routing-Tempo (Kurven, Kreuzungen) unverändert', () => {
    const { samples, compliance } = speedProfile(straightRoute({ speedKmh: 20 }), 3)
    expect(samples.every((s) => Math.abs(s.actual - 20) < 0.2)).toBe(true)
    expect(compliance).toBe(1)
  })

  it('schwankt beim freien Fahren um das Limit, reproduzierbar je Startwert', () => {
    const route = straightRoute({ meters: 3000, speedKmh: 50 })
    const a = speedProfile(route, 7)
    expect(speedProfile(route, 7)).toEqual(a)
    expect(speedProfile(route, 8).samples).not.toEqual(a.samples)
    const actual = a.samples.map((s) => s.actual)
    expect(Math.max(...actual)).toBeGreaterThan(50)
    expect(Math.min(...actual)).toBeLessThan(50)
    expect(a.compliance).toBeGreaterThan(0)
    expect(a.compliance).toBeLessThanOrEqual(1)
    const inside = a.samples.filter((s) => s.actual <= s.allowed + SPEED_TOLERANCE_KMH).length
    expect(a.compliance).toBeCloseTo(inside / a.samples.length, 10)
  })
})

describe('practiceItems und nextTip', () => {
  const route = straightRoute({
    events: [eventAt(200, 'rechts-vor-links'), eventAt(500, 'stopp'), eventAt(800, 'rechts-vor-links')],
  })
  const [first, stop, second] = drivePoints(route, LEVEL)

  it('listet nicht Gemachtes vor nicht Gesehenem, je Prüfpunkt-Thema einmal', () => {
    const answers: Answers = {
      [first.id]: { blick: 'unseen', tempo: 'done' },
      [stop.id]: { stillstand: 'unseen' },
      [second.id]: { blick: 'missed' },
    }
    const items = practiceItems([first, stop, second], answers)
    expect(items.map((i) => [i.key, i.answer])).toEqual([
      ['rechts-vor-links:blick', 'missed'],
      ['stopp:stillstand', 'unseen'],
    ])
    expect(items[0].pointTitle).toBe('Rechts vor Links')
  })

  it('schwere Fehler zuerst, dann Fahrverhalten', () => {
    const general = { answers: { blick: 'missed' as const, spur: 'done' as const }, severe: true }
    const items = practiceItems([first, stop], { [first.id]: { tempo: 'missed' } }, [stop.id], general)
    expect(items.map((i) => [i.key, i.answer])).toEqual([
      ['stopp:schwer', 'severe'],
      ['allgemein:schwer', 'severe'],
      ['rechts-vor-links:tempo', 'missed'],
      ['allgemein:blick', 'missed'],
    ])
  })

  it('ohne Fehler keine Übungen', () => {
    expect(practiceItems([first], { [first.id]: { blick: 'done' } })).toEqual([])
  })

  it('gibt den Tipp zum Thema mit den meisten Fehlern', () => {
    const answers: Answers = { [stop.id]: { stillstand: 'missed', verkehr: 'unseen' }, [first.id]: { blick: 'missed' } }
    expect(nextTip([first, stop, second], answers)?.title).toBe('Halt. Vorfahrt gewähren')
  })

  it('ohne Antworten zum ersten Punkt, ohne Punkte keinen Tipp', () => {
    expect(nextTip([stop, first], {})?.title).toBe('Halt. Vorfahrt gewähren')
    expect(nextTip([], {})).toBeUndefined()
  })
})
