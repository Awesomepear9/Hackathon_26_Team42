import { describe, expect, it } from 'vitest'
import { routeById, ROUTES } from '../data/routes'
import { eventAt, straightRoute } from '../test/routes'
import { cumulativeDistances, distanceAt, drivePoints } from './drivePoints'
import { LEVELS, type Level } from './levels'

const level = (points: Level['points']): Level => ({ id: 9, title: 'Test', topics: [], points, routes: [] })

describe('cumulativeDistances und distanceAt', () => {
  const route = straightRoute({ meters: 500 })
  const along = cumulativeDistances(route)

  it('beginnt bei 0 und endet bei der Streckenlänge', () => {
    expect(along[0]).toBe(0)
    expect(along).toHaveLength(route.track.length)
    expect(along.at(-1)).toBeCloseTo(500, 0)
  })

  it('liefert die Strecke zum Zeitpunkt t, danach das Ziel', () => {
    expect(distanceAt(route, along, 0)).toBe(0)
    expect(distanceAt(route, along, 10)).toBeCloseTo(100, 0) // 36 km/h = 10 m/s
    expect(distanceAt(route, along, 1e6)).toBe(along.at(-1))
  })

  it.each(ROUTES.map((r) => [r.id, r] as const))('passt zur angegebenen Länge der Strecke %s (±1 %%)', (_, r) => {
    expect(Math.abs((cumulativeDistances(r).at(-1) ?? 0) - r.distanceM) / r.distanceM).toBeLessThan(0.01)
  })
})

describe('drivePoints', () => {
  it('nimmt nur Punkte des Levels, nummeriert ab 1, je Ort einmal', () => {
    const route = straightRoute({
      events: [
        eventAt(0, 'start'),
        eventAt(100, 'rechts-vor-links'),
        eventAt(100, 'rechts-vor-links'), // doppelt am selben Ort
        eventAt(300, 'zebrastreifen'), // nicht im Level
        eventAt(600, 'stopp'),
      ],
    })
    const points = drivePoints(route, level(['rechts-vor-links', 'stopp']))
    expect(points.map((p) => [p.number, p.kind])).toEqual([
      [1, 'rechts-vor-links'],
      [2, 'stopp'],
    ])
    expect(points[0].along).toBeCloseTo(100, 0)
    expect(points[0].sign).toBe('102')
    expect(points[1].sign).toBe('206')
  })

  it('Kreisverkehr nur beim Einfahren, Ampel aus Rot und Grün', () => {
    const route = straightRoute({
      events: [
        eventAt(100, 'kreisverkehr', 'In den Kreisverkehr einfahren'),
        eventAt(150, 'kreisverkehr', 'Kreisverkehr verlassen'),
        eventAt(400, 'ampel-rot', 'Ampel rot'),
        eventAt(700, 'ampel-gruen', 'Ampel grün'),
      ],
    })
    expect(drivePoints(route, level(['kreisverkehr', 'ampel'])).map((p) => p.kind)).toEqual([
      'kreisverkehr',
      'ampel',
      'ampel',
    ])
  })

  it('Einfädeln zeigt das Autobahnzeichen nur auf der Autobahn', () => {
    const route = straightRoute({
      events: [
        eventAt(100, 'einfaedeln', 'Einfädeln auf die A 7'),
        eventAt(600, 'einfaedeln', 'Einfädeln auf die B 27'),
      ],
    })
    expect(drivePoints(route, level(['einfaedeln'])).map((p) => p.sign)).toEqual(['330.1', undefined])
  })

  it.each(LEVELS.flatMap((l) => l.routes.map((r) => [l.id, r.slot, l, r.routeId] as const)))(
    'Level %i Route %s: eindeutige ids, aufsteigend entlang der Strecke',
    (_, __, l, routeId) => {
      const points = drivePoints(routeById(routeId), l)
      expect(points.length).toBeGreaterThan(0)
      expect(new Set(points.map((p) => p.id)).size).toBe(points.length)
      expect(points.every((p, i) => i === 0 || p.along >= points[i - 1].along)).toBe(true)
      expect(points.every((p) => l.points.includes(p.kind))).toBe(true)
    },
  )
})
