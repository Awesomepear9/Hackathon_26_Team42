import { distanceMeters } from './geo'
import type { TrackPoint } from './useRouteReplay'

// Hilfen für das Abspielen simulierter Fahrten: Wartezeiten (zwei Track-Punkte mit gleicher
// Position und unterschiedlicher Zeit) kürzen und erkennen.

const STAND_M = 0.5 // darunter gilt ein Abschnitt als Stand (wie in useRouteReplay)

function isStand(track: TrackPoint[], index: number) {
  const a = track[index]
  const b = track.at(index + 1)
  return (
    a !== undefined && b !== undefined && distanceMeters({ lng: a[0], lat: a[1] }, { lng: b[0], lat: b[1] }) < STAND_M
  )
}

/**
 * Kürzt jede Wartezeit auf höchstens `maxS` Sekunden; die Zeiten danach rücken entsprechend vor.
 * Positionen und Indizes bleiben gleich, damit Strecken-Berechnungen auf dem Original weiter passen.
 */
export function capWaits(track: TrackPoint[], maxS: number): TrackPoint[] {
  let saved = 0
  return track.map(([lng, lat, t], i) => {
    if (i > 0 && isStand(track, i - 1)) saved += Math.max(0, t - track[i - 1][2] - maxS)
    return [lng, lat, t - saved]
  })
}

/** Restliche Wartezeit in Sekunden, wenn der Abschnitt `index` zur Zeit `t` ein Stand ist */
export function remainingWait(track: TrackPoint[], index: number, t: number): number | undefined {
  if (!isStand(track, index)) return undefined
  const remaining = track[index + 1][2] - t
  return remaining > 0 ? remaining : undefined
}
