import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ErrorEvent, GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useColorScheme } from '../hooks/useColorScheme'
import { createSituationMap } from '../map/createSituationMap'
import type { LngLat } from '../map/geo'
import { applyColorScheme, type ColorScheme } from '../map/palette'
import { tileSource, toVectorSource } from '../map/tileSource'
import { useMarkerLayer, type MarkerSpec } from '../map/useMarkerLayer'
import { createVehicleElement, type Vehicle } from '../map/vehicleMarker'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { MapAttribution } from './MapAttribution'

export type { Vehicle }

/** Schild oder Symbol am Straßenrand, liegt unter den Fahrzeugen */
export interface MapSymbol {
  id: string
  lng: number
  lat: number
  /** HTML- bzw. SVG-Markup des Markers (z. B. ein Verkehrszeichen) */
  html: string
  /** Versatz in px vom Punkt */
  offset?: [number, number]
  /** Kantenlänge in px (Standard 24) */
  size?: number
}

export interface SituationMapProps {
  center: LngLat
  zoom?: number
  bearing?: number
  /** Neigung in Grad (0 = Draufsicht, bis 60 für eine Navi-Perspektive) */
  pitch?: number
  /** Noch zu fahrende Route als Linie (Navi-Ansicht) */
  route?: LngLat[]
  vehicles?: Vehicle[]
  /** Schilder/Symbole am Straßenrand */
  symbols?: MapSymbol[]
  /** false (Standard): statische Illustration. true: Pan und Pinch-Zoom. */
  interactive?: boolean
  showLabels?: boolean
  /** Textbeschreibung der Situation für Screenreader */
  ariaLabel: string
  /** 'auto' (Standard) folgt der Tailwind-Klasse .dark an einem Vorfahren */
  colorScheme?: ColorScheme | 'auto'
  className?: string
}

const DEFAULT_SYMBOL_SIZE = 24
const NO_VEHICLES: Vehicle[] = []
const NO_SYMBOLS: MapSymbol[] = []

function symbolElement(html: string, size: number) {
  const element = document.createElement('div')
  element.className = 'pointer-events-none drop-shadow-sm'
  element.style.width = element.style.height = `${size}px`
  element.innerHTML = html
  return element
}

/** Karte mit eigener Fehlergrenze: ein Kartenfehler betrifft nur die Karte, nicht den Screen */
export function SituationMap(props: SituationMapProps) {
  return (
    <ErrorBoundary fallback={(retry) => <MapFallback className={props.className} onRetry={retry} />}>
      <SituationMapView {...props} />
    </ErrorBoundary>
  )
}

function MapFallback({ className = '', onRetry }: { className?: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-2 rounded-3xl bg-navy-100 p-4 text-center text-small text-navy-700 dark:bg-navy-800 dark:text-navy-200 ${className}`}
    >
      <p>Die Karte konnte nicht angezeigt werden.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-white px-4 py-1.5 font-semibold text-navy-900 shadow-card focus-visible:outline-2 focus-visible:outline-accent dark:bg-navy-900 dark:text-navy-50"
      >
        Erneut versuchen
      </button>
    </div>
  )
}

/** Hinweis, wenn Kartenkacheln fehlen; ohne geladene Kacheln über der ganzen Karte, sonst als Leiste */
function TilesError({ partial, dark, onRetry }: { partial: boolean; dark: boolean; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className={
        partial
          ? 'absolute inset-x-3 top-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-small shadow-card dark:bg-navy-900'
          : `absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-small ${
              dark ? 'bg-navy-800 text-navy-100' : 'bg-green-100 text-navy-800'
            }`
      }
    >
      <p>
        {partial ? 'Teile der Karte fehlen.' : 'Die Karte konnte nicht geladen werden. Prüfe die Internetverbindung.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-full bg-cyan-500 px-4 py-1.5 font-semibold text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
      >
        Erneut versuchen
      </button>
    </div>
  )
}

function SituationMapView({
  center,
  zoom = 18,
  bearing = 0,
  pitch = 0,
  route,
  vehicles = NO_VEHICLES,
  symbols = NO_SYMBOLS,
  interactive = false,
  showLabels = false,
  ariaLabel,
  colorScheme = 'auto',
  className = '',
}: SituationMapProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  /** Karte nach dem Laden des Stils; vorher dürfen Layer und Quellen nicht verändert werden */
  const [map, setMap] = useState<MapLibreMap | null>(null)
  /** erste Tiles gezeichnet: Skeleton ausblenden */
  const [loaded, setLoaded] = useState(false)
  /** Kacheln oder Quelle nicht erreichbar (z. B. offline); `partial`: einige Kacheln sind schon da */
  const [tilesError, setTilesError] = useState<{ partial: boolean }>()
  /** „Erneut versuchen“ baut die Karte neu auf */
  const [attempt, setAttempt] = useState(0)
  const scheme = useColorScheme(root, colorScheme)
  const dark = scheme === 'dark'
  const [lng, lat] = center

  // Startwerte für den (asynchronen) Kartenaufbau; spätere Änderungen laufen über die Effekte unten
  const initial = useRef({ center, zoom, bearing, pitch, scheme, showLabels })
  useLayoutEffect(() => {
    initial.current = { center: [lng, lat], zoom, bearing, pitch, scheme, showLabels }
  })

  useEffect(() => {
    let cancelled = false
    let instance: MapLibreMap | undefined
    let hasTiles = false
    toVectorSource(tileSource)
      .then((source) => {
        const container = containerRef.current
        if (cancelled || !container) return
        instance = createSituationMap({ container, source, interactive, ...initial.current })
        const created = instance
        created.on('load', () => setMap(created))
        created.on('idle', () => setLoaded(true))
        created.on('sourcedata', (e) => {
          if (e.sourceId === 'openmaptiles' && e.tile) hasTiles = true
        })
        created.on('error', (e: ErrorEvent & { sourceId?: string }) => {
          if (e.sourceId === 'openmaptiles') setTilesError((current) => current ?? { partial: hasTiles })
        })
      })
      .catch(() => {
        if (!cancelled) setTilesError({ partial: false }) // z. B. PMTiles-Protokoll nicht ladbar
      })
    return () => {
      cancelled = true
      instance?.remove()
      setMap(null)
      setLoaded(false)
      setTilesError(undefined)
    }
  }, [interactive, attempt])

  // Pinch-Zoom per Trackpad kommt als ctrl+Wheel an; normales Mausrad scrollt weiter die Seite.
  useEffect(() => {
    if (!root) return
    const passPlainWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) e.stopPropagation()
    }
    root.addEventListener('wheel', passPlainWheel, { capture: true })
    return () => root.removeEventListener('wheel', passPlainWheel, { capture: true })
  }, [root])

  useEffect(() => {
    // ungültige Werte (z. B. aus einer Messung bei 0 px) würden MapLibre zum Absturz bringen
    if (![lng, lat, zoom, bearing, pitch].every(Number.isFinite)) return
    map?.jumpTo({ center: [lng, lat], zoom, bearing, pitch })
  }, [map, lng, lat, zoom, bearing, pitch])

  useEffect(() => {
    if (map) applyColorScheme(map, scheme)
  }, [map, scheme])

  useEffect(() => {
    map?.setLayoutProperty('road-label', 'visibility', showLabels ? 'visible' : 'none')
  }, [map, showLabels])

  useEffect(() => {
    const coordinates = route ?? []
    map?.getSource<GeoJSONSource>('route')?.setData({
      type: 'FeatureCollection',
      features:
        coordinates.length > 1
          ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }]
          : [],
    })
  }, [map, route])

  // Schilder zuerst, Fahrzeuge darüber
  const markers = useMemo<MarkerSpec[]>(
    () => [
      ...symbols.map((s) => {
        const size = s.size ?? DEFAULT_SYMBOL_SIZE
        return {
          id: `symbol:${s.id}`,
          lngLat: [s.lng, s.lat] as LngLat,
          look: `${s.html}|${size}`,
          offset: s.offset,
          create: () => symbolElement(s.html, size),
        }
      }),
      ...vehicles.map((v) => ({
        id: `vehicle:${v.id}`,
        lngLat: [v.lng, v.lat] as LngLat,
        look: `${v.type}|${v.icon ?? 'car'}|${v.arrow ? 1 : 0}|${scheme}`,
        rotation: v.bearing,
        create: () => createVehicleElement(v, scheme),
        options: { rotationAlignment: 'map', pitchAlignment: 'map' } as const,
      })),
    ],
    [symbols, vehicles, scheme],
  )
  useMarkerLayer(map, markers)

  return (
    <div
      ref={setRoot}
      className={`relative overflow-hidden rounded-3xl ${dark ? 'bg-navy-800' : 'bg-green-100'} ${className}`}
    >
      {/* MapLibre setzt position: relative auf den Container, darum die zusätzliche Hülle */}
      <div className="absolute inset-0">
        <div ref={containerRef} role="img" aria-label={ariaLabel} className="h-full w-full" />
      </div>
      {!loaded && (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse motion-reduce:animate-none">
          <div className={`absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 ${dark ? 'bg-navy-700' : 'bg-green-200'}`} />
          <div
            className={`absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 ${dark ? 'bg-navy-700' : 'bg-green-200'}`}
          />
        </div>
      )}
      {tilesError && <TilesError partial={tilesError.partial} dark={dark} onRetry={() => setAttempt((a) => a + 1)} />}
      <MapAttribution dark={dark} />
    </div>
  )
}
