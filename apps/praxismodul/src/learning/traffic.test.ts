import { describe, expect, it } from 'vitest'
import type { Route } from '../data/routes'
import { eventAt, straightRoute } from '../test/routes'
import { estimateTrafficFromOsm, TRAFFIC_LABEL, trafficNote, trafficProvider } from './traffic'

const withRoads = (roadMix: Route['roadMix'], events: Route['events'] = []): Route => ({
  ...straightRoute({ meters: 2000, events }),
  roadMix,
})

describe('estimateTrafficFromOsm', () => {
  it('Wohnstraßen sind ruhig', () => {
    expect(estimateTrafficFromOsm(withRoads({ residential: 1500, living_street: 500 }))).toBe('low')
  })

  it('Hauptstraßen sind voll', () => {
    expect(estimateTrafficFromOsm(withRoads({ primary: 1500, trunk: 500 }))).toBe('high')
  })

  it('Ampeln erhöhen die Belastung, je Kreuzung einmal gezählt', () => {
    const mix = { tertiary: 2000 }
    const signalsAt = (meters: number[]) => meters.flatMap((m) => [eventAt(m, 'ampel-rot'), eventAt(m, 'ampel-gruen')])
    expect(estimateTrafficFromOsm(withRoads(mix))).toBe('medium')
    // 5 Kreuzungen mit Rot und Grün: 2,5 Ampeln/km (doppelt gezählt wären es 5/km → voll)
    expect(estimateTrafficFromOsm(withRoads(mix, signalsAt([0, 400, 800, 1200, 1600])))).toBe('medium')
    expect(
      estimateTrafficFromOsm(withRoads(mix, signalsAt([0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800]))),
    ).toBe('high')
  })

  it('unbekannte Straßenklassen zählen mittel, leere Mischung ist ruhig', () => {
    expect(estimateTrafficFromOsm(withRoads({ irgendwas: 1000 }))).toBe('low')
    expect(estimateTrafficFromOsm(withRoads({}))).toBe('low')
  })
})

describe('Texte und Quelle', () => {
  it('beschriftet jede Stufe', () => {
    expect(TRAFFIC_LABEL).toEqual({ low: 'ruhig', medium: 'mittel', high: 'voll' })
    expect(trafficNote('low', 2)).toBe('Ruhig – ideal für Level 2')
    expect(trafficNote('medium', 2)).toMatch(/möglich/)
    expect(trafficNote('high', 2)).toMatch(/später/)
  })

  it('nutzt ohne Konfiguration die Simulation', async () => {
    expect(trafficProvider.id).toBe('simulation')
    expect(await trafficProvider.trafficFor(straightRoute({ id: 'magdeburger' }))).toBe('high')
    expect(await trafficProvider.trafficFor(straightRoute({ id: 'unbekannt' }))).toBe('medium')
  })
})
