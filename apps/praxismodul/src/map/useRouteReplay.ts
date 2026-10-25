import { useCallback, useEffect, useMemo, useState } from 'react'
import { bearingDegrees, distanceMeters, type Point } from './geo'

// Spielt eine aufgezeichnete bzw. simulierte Fahrt ab: Track-Punkte [lng, lat, t in s].
// Wartezeiten stecken als zwei Punkte mit gleicher Position und unterschiedlicher Zeit im Track.

export type TrackPoint = [lng: number, lat: number, t: number]

export interface ReplayState extends Point {
  /** Sekunden seit Start */
  t: number
  /** Fahrtrichtung in Grad, 0 = Norden */
  bearing: number
  /** Index des Track-Punkts, an dem der aktuelle Abschnitt beginnt */
  index: number
}

interface ReplayOptions {
  /** Zeitraffer, 1 = Echtzeit */
  speed?: number
  playing?: boolean
  /** am Ende von vorn beginnen (Standard) oder am Ziel stehen bleiben */
  loop?: boolean
  /** Startzeit in Sekunden, z. B. beim Fortsetzen einer Fahrt */
  startAt?: number
}

const END_PAUSE_S = 3 // am Ziel kurz stehen bleiben, dann von vorn
const MIN_MOVE_M = 0.5 // darunter gilt ein Abschnitt als Stand

const pointOf = ([lng, lat]: TrackPoint): Point => ({ lng, lat })

/** Richtung je Abschnitt; im Stand gilt die letzte Fahrtrichtung, am Start die der ersten Bewegung */
function segmentBearings(track: TrackPoint[]) {
  const bearings: (number | undefined)[] = []
  let last: number | undefined
  for (let i = 0; i < track.length - 1; i++) {
    const a = pointOf(track[i])
    const b = pointOf(track[i + 1])
    if (distanceMeters(a, b) > MIN_MOVE_M) last = bearingDegrees(a, b)
    bearings.push(last)
  }
  const first = bearings.find((b) => b !== undefined) ?? 0
  return bearings.map((b) => b ?? first)
}

/** Abschnitt, in dem die Zeit t liegt (Binärsuche) */
function segmentAt(track: TrackPoint[], t: number) {
  let lo = 0
  let hi = track.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (track[mid][2] <= t) lo = mid
    else hi = mid
  }
  return lo
}

export function useRouteReplay(
  track: TrackPoint[],
  { speed = 1, playing = true, loop = true, startAt = 0 }: ReplayOptions = {},
) {
  const duration = track.at(-1)?.[2] ?? 0
  const bearings = useMemo(() => segmentBearings(track), [track])

  // Zeit gehört zur Strecke: bei einer neuen Strecke noch im selben Render von vorn beginnen
  const [clock, setClock] = useState(() => ({ track, t: Math.max(0, Math.min(duration, startAt)) }))
  if (clock.track !== track) setClock({ track, t: 0 })
  const elapsed = clock.track === track ? clock.t : 0

  const seek = useCallback(
    (t: number) => setClock((c) => ({ ...c, t: Math.max(0, Math.min(duration, t)) })),
    [duration],
  )

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const dt = ((now - previous) / 1000) * speed
      previous = now
      setClock((c) => {
        const next = c.t + dt
        if (!loop) return next >= duration ? (c.t === duration ? c : { ...c, t: duration }) : { ...c, t: next }
        return { ...c, t: next > duration + END_PAUSE_S * speed ? 0 : next }
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, duration, loop])

  const state = useMemo<ReplayState>(() => {
    const t = Math.min(elapsed, duration)
    if (track.length === 0) return { t, lng: 0, lat: 0, bearing: 0, index: 0 }
    const index = segmentAt(track, t)
    const [lng1, lat1, t1] = track[index]
    const [lng2, lat2, t2] = track[Math.min(index + 1, track.length - 1)]
    const f = t2 > t1 ? Math.min(1, Math.max(0, (t - t1) / (t2 - t1))) : 0
    return { t, lng: lng1 + (lng2 - lng1) * f, lat: lat1 + (lat2 - lat1) * f, bearing: bearings[index] ?? 0, index }
  }, [elapsed, duration, track, bearings])

  return { ...state, duration, seek, finished: elapsed >= duration }
}
