import { useMemo, useRef } from 'react'
import { SituationMap, type MapSymbol } from '../components/SituationMap'
import type { Route } from '../data/routes'
import { useElementSize } from '../hooks/useElementSize'
import { drivePoints } from '../learning/drivePoints'
import type { Level } from '../learning/levels'
import { bearingDegrees, type LngLat } from '../map/geo'
import { overviewCamera } from '../map/navCamera'
import { pointMarkerHtml, POINT_MARKER_SIZE } from '../signs/pointMarker'

const INITIAL_SIZE = { width: 380, height: 168 }
const PREVIEW_MARKER_SIZE = POINT_MARKER_SIZE - 8

/** Vorschau einer Route: ganze Strecke eingepasst, nummerierte Lernpunkte, Fahrzeug am Start */
export function RoutePreview({ route, level }: { route: Route; level: Level }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const size = useElementSize(boxRef, INITIAL_SIZE)
  const line = useMemo(() => route.track.map(([lng, lat]): LngLat => [lng, lat]), [route])
  const camera = useMemo(() => overviewCamera(line, size), [line, size])
  const points = useMemo(() => drivePoints(route, level), [route, level])
  const symbols = useMemo(
    () =>
      points.map((p): MapSymbol => ({
        id: p.id,
        lng: p.event.lng,
        lat: p.event.lat,
        size: PREVIEW_MARKER_SIZE,
        html: pointMarkerHtml(p.sign, p.number, false),
      })),
    [points],
  )
  const [startLng, startLat] = line[0]
  const next = line.find(([lng, lat]) => lng !== startLng || lat !== startLat) ?? line[0]
  const startBearing = bearingDegrees({ lng: startLng, lat: startLat }, { lng: next[0], lat: next[1] })

  return (
    <div ref={boxRef} className="h-[168px] w-full">
      <SituationMap
        center={[camera.lng, camera.lat]}
        zoom={camera.zoom}
        route={line}
        symbols={symbols}
        vehicles={[
          { id: 'start', type: 'self', icon: 'navigation', lng: startLng, lat: startLat, bearing: startBearing },
        ]}
        ariaLabel={`Vorschau ${route.title}: ${points.length} Punkte für Level ${level.id}, Start beim Pfeil.`}
        className="h-full w-full"
      />
    </div>
  )
}
