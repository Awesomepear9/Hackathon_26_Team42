import { describe, expect, it } from 'vitest'
import { capWaits, remainingWait } from './replayTrack'
import type { TrackPoint } from './useRouteReplay'

// Fahrt – 30 s Stand – Fahrt – 4 s Stand – Fahrt
const TRACK: TrackPoint[] = [
  [9.68, 50.55, 0],
  [9.681, 50.55, 10],
  [9.681, 50.55, 40],
  [9.682, 50.55, 50],
  [9.682, 50.55, 54],
  [9.683, 50.55, 60],
]

describe('capWaits', () => {
  it('kürzt lange Wartezeiten und verschiebt die Zeiten danach', () => {
    expect(capWaits(TRACK, 8).map(([, , t]) => t)).toEqual([0, 10, 18, 28, 32, 38])
  })

  it('lässt Positionen, Punktzahl und kurze Wartezeiten unverändert', () => {
    const capped = capWaits(TRACK, 8)
    expect(capped).toHaveLength(TRACK.length)
    expect(capped.map(([lng, lat]) => [lng, lat])).toEqual(TRACK.map(([lng, lat]) => [lng, lat]))
    expect(capped[4][2] - capped[3][2]).toBe(4)
  })
})

describe('remainingWait', () => {
  it('liefert die Restzeit nur im Stand', () => {
    expect(remainingWait(TRACK, 1, 25)).toBe(15)
    expect(remainingWait(TRACK, 0, 5)).toBeUndefined()
    expect(remainingWait(TRACK, 5, 60)).toBeUndefined()
  })
})
