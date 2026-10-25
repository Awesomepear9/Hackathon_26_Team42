import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { lerpAngle, shortestTurn, type LngLat, type Point } from './geo'
import {
  blendCameras,
  cameraFor,
  easeInOut,
  overviewCamera,
  type Camera,
  type FollowOverrides,
  type NavView,
  type Size,
} from './navCamera'

interface NavCameraInput {
  view: NavView
  /** aktuelle Fahrzeugposition */
  position: Point
  /** aktuelle Fahrtrichtung (ungeglättet) */
  heading: number
  /** Größe des Kartenelements */
  size: Size
  /** ganze Strecke, für die Übersicht */
  route: LngLat[]
  /** ändert sich z. B. beim Szenario-Wechsel: Kamera springt ohne Übergang */
  resetKey: string
  /** z. B. weiter herauszoomen oder das Fahrzeug höher setzen */
  overrides?: FollowOverrides
}

interface Motion {
  view: NavView
  resetKey: string
  /** geglättete Fahrtrichtung der Kamera */
  heading: number
  /** Kamera zu Beginn eines Übergangs */
  from?: Camera
  /** Fortschritt des Übergangs 0 … 1 */
  progress: number
}

const HEADING_TIME_CONSTANT_MS = 400 // Glättung, damit die Karte in Kurven nicht ruckt
const HEADING_TIME_CONSTANT_REDUCED_MS = 1200 // „Bewegung reduzieren“: Karte dreht ruhiger mit
const TRANSITION_MS = 700
const MAX_FRAME_MS = 200 // nach Tab-Wechsel nicht springen
const HEADING_EPSILON = 0.05

function cameraOf(motion: Motion, input: NavCameraInput, overview: Camera) {
  const target = cameraFor(motion.view, input.position, motion.heading, input.size, overview, input.overrides)
  return motion.from ? blendCameras(motion.from, target, easeInOut(motion.progress)) : target
}

/**
 * Kamera wie im Navi. Die Ziel-Kamera wird in jedem Render aus der aktuellen Position berechnet
 * (das Fahrzeug sitzt dadurch exakt an seinem Platz); per Animation laufen nur die geglättete
 * Fahrtrichtung und der Übergang beim Wechsel der Ansicht, auch bei pausierter Wiedergabe.
 * Mit „Bewegung reduzieren“ wechselt die Ansicht ohne Übergang.
 */
export function useNavCamera(input: NavCameraInput): Camera {
  const { view, heading, size, route, resetKey } = input
  const overview = useMemo(() => overviewCamera(route, size), [route, size])
  const reducedMotion = useReducedMotion()
  const [motion, setMotion] = useState<Motion>({ view, resetKey, heading, progress: 1 })

  // Ansicht oder Szenario gewechselt: noch im selben Render den Übergang anlegen
  if (motion.view !== view || motion.resetKey !== resetKey) {
    const reset = motion.resetKey !== resetKey
    const instant = reset || reducedMotion
    setMotion({
      view,
      resetKey,
      heading: reset ? heading : motion.heading,
      from: instant ? undefined : cameraOf(motion, input, overview),
      progress: instant ? 1 : 0,
    })
  }

  // Die Animationsschleife liest das aktuelle Ziel über eine Ref (nur in Effekten beschrieben)
  const targetHeading = useRef(heading)
  useLayoutEffect(() => {
    targetHeading.current = heading
  }, [heading])

  useEffect(() => {
    const timeConstant = reducedMotion ? HEADING_TIME_CONSTANT_REDUCED_MS : HEADING_TIME_CONSTANT_MS
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(MAX_FRAME_MS, now - previous)
      previous = now
      setMotion((m) => {
        const turn = shortestTurn(m.heading, targetHeading.current)
        const settled = Math.abs(turn) < HEADING_EPSILON && !m.from
        if (settled) return m // nichts zu tun: kein neuer Render
        const progress = m.from ? Math.min(1, m.progress + dt / TRANSITION_MS) : 1
        return {
          ...m,
          heading: lerpAngle(m.heading, targetHeading.current, 1 - Math.exp(-dt / timeConstant)),
          progress,
          from: progress < 1 ? m.from : undefined,
        }
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reducedMotion])

  return cameraOf(motion, input, overview)
}
