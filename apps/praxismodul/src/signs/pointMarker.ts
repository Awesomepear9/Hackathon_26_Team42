import { outlineGlyph } from '../icons/tabler'
import { signUrl, type TrafficSignId } from './trafficSigns'

export const POINT_MARKER_SIZE = 40

// neutrales Icon, wenn es kein amtliches Zeichen gibt
const NO_SIGN =
  `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">` +
  outlineGlyph('road', '#1d99a8', 3, 3, 18, 2.2) +
  `</svg>`

/**
 * Karten-Marker für einen Lernpunkt wie im Entwurf: Zeichen im weißen Kreis, Nummer als
 * dunkles Abzeichen oben rechts, der aktuelle Punkt mit cyan Ring.
 */
export function pointMarkerHtml(sign: TrafficSignId | undefined, number: number, active: boolean) {
  const ring = active ? 'ring-4 ring-cyan-500' : 'ring-1 ring-navy-100'
  const image = sign ? `<img src="${signUrl(sign)}" alt="" class="size-full object-contain" />` : NO_SIGN
  return (
    `<div class="relative size-full rounded-full bg-white p-1.5 shadow-card ${ring}">` +
    `<div class="size-full">${image}</div>` +
    `<span class="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-navy-900 text-caption leading-none text-white ring-2 ring-white">${number}</span>` +
    `</div>`
  )
}
