import { describe, expect, it } from 'vitest'
import { distanceMeters, type LngLat } from './geo'
import { blendCameras, cameraFor, easeInOut, followCamera, overviewCamera, type Camera } from './navCamera'

const ROUTE: LngLat[] = [
  [9.68, 50.55],
  [9.69, 50.555],
  [9.7, 50.552],
]
const finite = (camera: Camera) => Object.values(camera).every(Number.isFinite)

describe('overviewCamera', () => {
  it('setzt die Strecke in die Mitte', () => {
    const camera = overviewCamera(ROUTE, { width: 400, height: 300 })
    expect(camera.lng).toBeCloseTo(9.69, 5)
    expect(camera.lat).toBeGreaterThan(50.55)
    expect(camera.lat).toBeLessThan(50.555)
    expect(camera).toMatchObject({ bearing: 0, pitch: 0 })
  })

  it.each([
    { width: 0, height: 0 },
    { width: 10, height: 10 },
    { width: 0, height: 300 },
  ])('liefert auch bei %o einen endlichen Zoom', (size) => {
    const camera = overviewCamera(ROUTE, size)
    expect(finite(camera)).toBe(true)
    expect(camera.zoom).toBeGreaterThanOrEqual(3)
  })

  it('begrenzt den Zoom bei einem einzelnen Punkt', () => {
    const camera = overviewCamera([[9.68, 50.55]], { width: 400, height: 300 })
    expect(finite(camera)).toBe(true)
    expect(camera.zoom).toBe(17)
  })

  it('zoomt für eine längere Strecke weiter heraus', () => {
    const size = { width: 400, height: 300 }
    const short = overviewCamera(ROUTE.slice(0, 2), size)
    const long = overviewCamera([...ROUTE, [9.8, 50.6]], size)
    expect(long.zoom).toBeLessThan(short.zoom)
  })
})

describe('followCamera', () => {
  const position = { lng: 9.68, lat: 50.55 }
  const size = { width: 412, height: 288 }

  it('blickt in Fahrtrichtung und setzt die Mitte vor das Fahrzeug', () => {
    const camera = followCamera('heading', position, 90, size)
    expect(camera).toMatchObject({ bearing: 90, pitch: 0, zoom: 17.2 })
    expect(camera.lng).toBeGreaterThan(position.lng) // nach Osten verschoben
    expect(camera.lat).toBeCloseTo(position.lat, 6)
  })

  it('neigt die 3D-Ansicht und übernimmt Abweichungen', () => {
    const camera = followCamera('perspective', position, 0, size, { zoom: 16 })
    expect(camera).toMatchObject({ pitch: 60, zoom: 16 })
    expect(camera.lat).toBeGreaterThan(position.lat)
  })

  it('bleibt bei 0 px Höhe auf dem Fahrzeug', () => {
    const camera = followCamera('perspective', position, 45, { width: 0, height: 0 })
    expect(finite(camera)).toBe(true)
    expect(distanceMeters(camera, position)).toBeCloseTo(0, 6)
  })

  it('cameraFor wählt für die Übersicht die Übersichtskamera', () => {
    const overview = overviewCamera(ROUTE, size)
    expect(cameraFor('overview', position, 30, size, overview)).toBe(overview)
    expect(cameraFor('heading', position, 30, size, overview).bearing).toBe(30)
  })
})

describe('Übergänge', () => {
  it('easeInOut beginnt bei 0, endet bei 1 und ist symmetrisch', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(0.5)).toBe(0.5)
    expect(easeInOut(1)).toBe(1)
    expect(easeInOut(0.25) + easeInOut(0.75)).toBeCloseTo(1, 10)
  })

  it('blendCameras mischt linear und dreht auf dem kürzesten Weg', () => {
    const from: Camera = { lng: 9, lat: 50, zoom: 14, bearing: 350, pitch: 0 }
    const to: Camera = { lng: 10, lat: 51, zoom: 16, bearing: 10, pitch: 60 }
    expect(blendCameras(from, to, 0)).toEqual(from)
    expect(blendCameras(from, to, 1)).toMatchObject({ lng: 10, lat: 51, zoom: 16, pitch: 60 })
    const half = blendCameras(from, to, 0.5)
    expect(half).toMatchObject({ lng: 9.5, lat: 50.5, zoom: 15, pitch: 30 })
    expect(half.bearing).toBeCloseTo(0, 10) // über Norden, nicht über Süden
  })
})
