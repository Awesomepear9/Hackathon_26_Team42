import { filledGlyph } from '../icons/tabler'
import type { ColorScheme } from './palette'

export interface Vehicle {
  id: string
  lng: number
  lat: number
  /** Fahrtrichtung in Grad, 0 = Norden, im Uhrzeigersinn */
  bearing: number
  type: 'self' | 'other'
  /** Pfeil in Fahrtrichtung vor dem Fahrzeug zeigen */
  arrow?: boolean
  /** 'car' (Standard): Fahrzeug von oben; 'navigation': Navigationspfeil wie im Navi */
  icon?: 'car' | 'navigation'
}

const FILL = { self: '#26d9e8', other: '#ffb454' } // cyan-500 / amber-500
const INK = '#111c33' // navy-900
const INK_DARK = '#a7afbf' // navy-300: Pfeil bleibt auf #18233c sichtbar

// Quadratisches Element, Fahrzeug in der Mitte: so dreht MapLibre um den Fahrzeugmittelpunkt.
// Die Grafik zeigt nach Norden; die Drehung übernimmt Marker.setRotation(bearing).
const MARKER_SIZE = 80
const NAVIGATION_SIZE = 44
// Navigationspfeil in den Farben des Entwurfs (Zeichen-Blau, heller Hof)
const NAVIGATION_FILL = '#1f6fc4'
const NAVIGATION_HALO = { light: '#cfe0f4', dark: '#36425b' }

/** Navigationspfeil (Tabler navigation) mit weißem Rand in hellem Kreis, zeigt nach Norden */
function navigationArrowSvg(fill: string, halo: string) {
  const arrow = filledGlyph('navigation', fill, 11, 9, 26)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">` +
    `<circle cx="24" cy="24" r="22" fill="${halo}" fill-opacity="0.55"/>` +
    `<g stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round">${arrow}</g>${arrow}</svg>`
  )
}

export function createVehicleElement(vehicle: Vehicle, scheme: ColorScheme): HTMLElement {
  const el = document.createElement('div')
  el.className = 'pointer-events-none z-10' // über den Schildern am Straßenrand
  if (vehicle.icon === 'navigation') {
    el.style.width = el.style.height = `${NAVIGATION_SIZE}px`
    el.innerHTML = navigationArrowSvg(NAVIGATION_FILL, NAVIGATION_HALO[scheme])
    return el
  }
  const arrowInk = scheme === 'dark' ? INK_DARK : INK
  el.innerHTML = `
<svg width="${MARKER_SIZE}" height="${MARKER_SIZE}" viewBox="0 0 80 80" aria-hidden="true">
  ${
    vehicle.arrow
      ? `<g fill="none" stroke="${arrowInk}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 23 V6" /><path d="M34 12 L40 6 L46 12" />
  </g>`
      : ''
  }
  <rect x="33" y="27" width="14" height="26" rx="4" fill="${FILL[vehicle.type]}" />
  <path d="M40 31 V36" stroke="${INK}" stroke-width="2" stroke-linecap="round" />
</svg>`
  return el
}
