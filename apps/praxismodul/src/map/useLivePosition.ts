import { useEffect, useRef, useState } from 'react'
import { bearingDegrees, distanceMeters, lerpAngle, type Point } from './geo'

// Aktueller Standort aus der Geolocation-API, geglättet für die Darstellung.
// Die Position verlässt das Gerät nicht; nur die Tiles der Umgebung werden geladen.

export type LiveStatus = 'pending' | 'live' | 'denied' | 'unavailable' | 'unsupported'

export interface LivePosition extends Point {
  /** Fahrtrichtung in Grad, 0 = Norden, im Uhrzeigersinn */
  bearing: number
  /** Genauigkeit in Metern */
  accuracy: number
}

const GLIDE_MS = 900 // etwas kürzer als das übliche GPS-Intervall von 1 s
const MIN_MOVE_FOR_BEARING_M = 3 // darunter bleibt die letzte Richtung stehen (Stand, GPS-Rauschen)
const MIN_SPEED_FOR_HEADING = 1 // m/s; langsamer ist coords.heading unzuverlässig

const isSupported = () => typeof navigator !== 'undefined' && 'geolocation' in navigator

export function useLivePosition(): { status: LiveStatus; position?: LivePosition } {
  const [status, setStatus] = useState<LiveStatus>(() => (isSupported() ? 'pending' : 'unsupported'))
  const [position, setPosition] = useState<LivePosition>()
  const shown = useRef<LivePosition>(undefined)
  const lastFix = useRef<Point>(undefined)

  useEffect(() => {
    if (!isSupported()) return
    let frame = 0

    const glideTo = (target: LivePosition) => {
      cancelAnimationFrame(frame)
      const from = shown.current
      if (!from) {
        shown.current = target
        setPosition(target)
        return
      }
      const start = performance.now()
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / GLIDE_MS)
        const next = {
          lng: from.lng + (target.lng - from.lng) * k,
          lat: from.lat + (target.lat - from.lat) * k,
          bearing: lerpAngle(from.bearing, target.bearing, k),
          accuracy: target.accuracy,
        }
        shown.current = next
        setPosition(next)
        if (k < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const fix = { lng: coords.longitude, lat: coords.latitude }
        const previous = lastFix.current
        const moved = previous ? distanceMeters(previous, fix) >= MIN_MOVE_FOR_BEARING_M : true
        let bearing = shown.current?.bearing ?? 0
        if (coords.heading !== null && !Number.isNaN(coords.heading) && (coords.speed ?? 0) > MIN_SPEED_FOR_HEADING) {
          bearing = coords.heading
        } else if (previous && moved) {
          bearing = bearingDegrees(previous, fix) // Desktop-Browser liefern kein heading
        }
        if (moved) lastFix.current = fix
        setStatus('live')
        glideTo({ ...fix, bearing, accuracy: coords.accuracy })
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
      cancelAnimationFrame(frame)
    }
  }, [])

  return { status, position }
}
