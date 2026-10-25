import { useEffect, useRef } from 'react'
import { Marker, type Map as MapLibreMap, type MarkerOptions } from 'maplibre-gl'
import type { LngLat } from './geo'

/** Beschreibung eines HTML-Markers; `look` entscheidet, ob das Element neu gebaut werden muss */
export interface MarkerSpec {
  id: string
  lngLat: LngLat
  /** ändert sich das Aussehen, wird das Element neu erzeugt; sonst nur verschoben/gedreht */
  look: string
  create: () => HTMLElement
  rotation?: number
  offset?: [number, number]
  options?: Omit<MarkerOptions, 'element'>
}

interface Entry {
  marker: Marker
  look: string
}

/**
 * Hält MapLibre-Marker synchron zu einer Liste. Marker werden je id wiederverwendet, damit
 * Positionen sich jeden Frame ändern können, ohne DOM-Elemente neu zu erzeugen.
 */
export function useMarkerLayer(map: MapLibreMap | null, specs: MarkerSpec[]) {
  const registry = useRef(new Map<string, Entry>())

  // Neue Karteninstanz (oder Unmount): alle Marker der alten Karte entfernen
  useEffect(() => {
    const entries = registry.current
    return () => {
      for (const { marker } of entries.values()) marker.remove()
      entries.clear()
    }
  }, [map])

  useEffect(() => {
    if (!map) return
    const entries = registry.current
    const seen = new Set<string>()
    for (const spec of specs) {
      seen.add(spec.id)
      let entry = entries.get(spec.id)
      if (entry && entry.look !== spec.look) {
        entry.marker.remove()
        entry = undefined
      }
      if (!entry) {
        const marker = new Marker({ ...spec.options, element: spec.create() }).setLngLat(spec.lngLat).addTo(map)
        entry = { marker, look: spec.look }
        entries.set(spec.id, entry)
      }
      entry.marker.setLngLat(spec.lngLat)
      if (spec.rotation !== undefined) entry.marker.setRotation(spec.rotation)
      if (spec.offset) entry.marker.setOffset(spec.offset)
    }
    for (const [id, { marker }] of entries) {
      if (seen.has(id)) continue
      marker.remove()
      entries.delete(id)
    }
  }, [map, specs])
}
