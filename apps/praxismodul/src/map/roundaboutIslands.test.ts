import { describe, expect, it } from 'vitest'
import { metersPerDegreeLng, type LngLat } from './geo'
import { findRoundaboutIslands, type RoadLine } from './roundaboutIslands'

const LAT = 50.55
const LNG = 9.68
const at = (x: number, y: number): LngLat => [LNG + x / metersPerDegreeLng(LAT), LAT + y / 110540]

/** geschlossener Ring aus `n` Punkten mit Radius `r` Metern um (cx, cy) */
function ring(r: number, n = 16, cx = 0, cy = 0): LngLat[] {
  const points = Array.from({ length: n }, (_, i) =>
    at(cx + r * Math.cos((2 * Math.PI * i) / n), cy + r * Math.sin((2 * Math.PI * i) / n)),
  )
  return [...points, points[0]]
}

const line = (coordinates: LngLat[], roadClass = 'tertiary'): RoadLine => ({ coordinates, roadClass })

/** vorzeichenbehaftete Fläche in Grad² (positiv = gegen den Uhrzeigersinn) */
const signedArea = (coordinates: GeoJSON.Position[]) =>
  coordinates
    .slice(0, -1)
    .reduce((sum, [x1, y1], i) => sum + x1 * coordinates[i + 1][1] - coordinates[i + 1][0] * y1, 0) / 2

describe('findRoundaboutIslands', () => {
  it('ohne Straßen keine Inseln', () => {
    expect(findRoundaboutIslands([]).features).toEqual([])
  })

  it('erkennt einen Kreisverkehr als Fläche und Randlinie', () => {
    const { features } = findRoundaboutIslands([line(ring(15))])
    expect(features.map((f) => f.geometry.type)).toEqual(['Polygon', 'LineString'])
    expect(features[0].properties.roadClass).toBe('tertiary')
  })

  it('auch mit Zufahrten, die am Ring hängen', () => {
    const circle = ring(15)
    const spokes = [0, 4, 8, 12].map((i) => {
      const [lng, lat] = circle[i]
      return line([circle[i], [LNG + (lng - LNG) * 4, LAT + (lat - LAT) * 4]], 'secondary')
    })
    const { features } = findRoundaboutIslands([line(circle), ...spokes])
    expect(features.filter((f) => f.geometry.type === 'Polygon')).toHaveLength(1)
  })

  it('gibt den Ring im Uhrzeigersinn aus (line-offset zeigt nach innen)', () => {
    const [polygon] = findRoundaboutIslands([line(ring(15))]).features
    if (polygon.geometry.type !== 'Polygon') throw new Error('Polygon erwartet')
    expect(signedArea(polygon.geometry.coordinates[0])).toBeLessThan(0)
  })

  it('übersieht Häuserblöcke (eckig, groß) und Kleinstflächen', () => {
    const block = [at(0, 0), at(100, 0), at(100, 100), at(0, 100), at(0, 0)]
    expect(findRoundaboutIslands([line(block)]).features).toEqual([])
    expect(findRoundaboutIslands([line(ring(1.5))]).features).toEqual([]) // < 15 m²
    expect(findRoundaboutIslands([line(ring(60))]).features).toEqual([]) // > 8000 m²
  })

  it('ignoriert Wendeschleifen auf Parkplätzen (service)', () => {
    expect(findRoundaboutIslands([line(ring(15), 'service')]).features).toEqual([])
  })

  it('übersteht doppelte Linien aus überlappenden Tiles', () => {
    const circle = ring(15)
    const { features } = findRoundaboutIslands([line(circle), line(circle), line([...circle].reverse())])
    expect(features.filter((f) => f.geometry.type === 'Polygon')).toHaveLength(1)
  })

  it('Grenzwerte lassen sich anpassen', () => {
    const block = [at(0, 0), at(30, 0), at(30, 30), at(0, 30), at(0, 0)]
    expect(findRoundaboutIslands([line(block)], { minCompactness: 0.7 }).features).toHaveLength(2)
  })
})
