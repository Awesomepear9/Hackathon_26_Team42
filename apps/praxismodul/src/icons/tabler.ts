// Tabler Icons (MIT, https://tabler.io/icons) als SVG-Text, damit sie in React und in
// Karten-Markern (HTML-Strings) gleich verwendet werden können.
import alertTriangle from '@tabler/icons/outline/alert-triangle.svg?raw'
import check from '@tabler/icons/outline/check.svg?raw'
import chevronDown from '@tabler/icons/outline/chevron-down.svg?raw'
import chevronLeft from '@tabler/icons/outline/chevron-left.svg?raw'
import chevronUp from '@tabler/icons/outline/chevron-up.svg?raw'
import circleCheck from '@tabler/icons/outline/circle-check.svg?raw'
import clock from '@tabler/icons/outline/clock.svg?raw'
import deviceGamepad2 from '@tabler/icons/outline/device-gamepad-2.svg?raw'
import flag from '@tabler/icons/outline/flag.svg?raw'
import bulb from '@tabler/icons/outline/bulb.svg?raw'
import home from '@tabler/icons/outline/home.svg?raw'
import infoCircle from '@tabler/icons/outline/info-circle.svg?raw'
import layoutGrid from '@tabler/icons/outline/layout-grid.svg?raw'
import lock from '@tabler/icons/outline/lock.svg?raw'
import navigation from '@tabler/icons/outline/navigation.svg?raw'
import questionMark from '@tabler/icons/outline/question-mark.svg?raw'
import road from '@tabler/icons/outline/road.svg?raw'
import stack2 from '@tabler/icons/outline/stack-2.svg?raw'
import rotate from '@tabler/icons/outline/rotate.svg?raw'
import route from '@tabler/icons/outline/route.svg?raw'
import swords from '@tabler/icons/outline/swords.svg?raw'
import trafficLights from '@tabler/icons/outline/traffic-lights.svg?raw'
import train from '@tabler/icons/outline/train.svg?raw'
import walk from '@tabler/icons/outline/walk.svg?raw'
import world from '@tabler/icons/outline/world.svg?raw'
import x from '@tabler/icons/outline/x.svg?raw'
import flagFilled from '@tabler/icons/filled/flag.svg?raw'
import mapPinFilled from '@tabler/icons/filled/map-pin.svg?raw'
import navigationFilled from '@tabler/icons/filled/navigation.svg?raw'
import playerPauseFilled from '@tabler/icons/filled/player-pause.svg?raw'
import playerPlayFilled from '@tabler/icons/filled/player-play.svg?raw'
import shieldFilled from '@tabler/icons/filled/shield.svg?raw'
import starFilled from '@tabler/icons/filled/star.svg?raw'

/** Kontur-Icons: Strich in currentColor */
export const OUTLINE_ICONS = {
  'alert-triangle': alertTriangle,
  check,
  'chevron-down': chevronDown,
  'chevron-left': chevronLeft,
  'chevron-up': chevronUp,
  'circle-check': circleCheck,
  clock,
  'device-gamepad-2': deviceGamepad2,
  flag,
  bulb,
  home,
  'info-circle': infoCircle,
  'layout-grid': layoutGrid,
  lock,
  navigation,
  'question-mark': questionMark,
  road,
  rotate,
  route,
  'stack-2': stack2,
  swords,
  'traffic-lights': trafficLights,
  train,
  walk,
  world,
  x,
}

/** Flächige Icons: Füllung in currentColor */
export const FILLED_ICONS = {
  flag: flagFilled,
  'map-pin': mapPinFilled,
  navigation: navigationFilled,
  'player-pause': playerPauseFilled,
  'player-play': playerPlayFilled,
  shield: shieldFilled,
  star: starFilled,
}

export type OutlineIconName = keyof typeof OUTLINE_ICONS
export type FilledIconName = keyof typeof FILLED_ICONS

/** Innenteil eines Tabler-SVG (Pfade) ohne Hülle und ohne die unsichtbare 24×24-Hilfsfläche */
export function iconPaths(svg: string) {
  return svg
    .slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'))
    .replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, '')
    .trim()
}

/** Glyph für eingebettete SVGs: verschoben und skaliert, Strich- bzw. Füllfarbe gesetzt */
export function outlineGlyph(name: OutlineIconName, color: string, x: number, y: number, size: number, stroke = 2) {
  const scale = size / 24
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${iconPaths(OUTLINE_ICONS[name])}</g>`
}

export function filledGlyph(name: FilledIconName, color: string, x: number, y: number, size: number) {
  const scale = size / 24
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${color}">${iconPaths(FILLED_ICONS[name])}</g>`
}
