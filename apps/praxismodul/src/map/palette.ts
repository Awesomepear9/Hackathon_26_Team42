import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'

export type ColorScheme = 'light' | 'dark'

type PaintProperty = Parameters<MapLibreMap['setPaintProperty']>[1]
type SchemeColors = Partial<Record<PaintProperty, { light: string; dark: string }>>

// Farben je Layer und Paint-Eigenschaft. style.json enthält die hellen Werte,
// diese Tabelle ist die einzige Stelle, an der der Dark Mode definiert ist.
const PALETTE: Record<string, SchemeColors> = {
  background: { 'background-color': { light: '#dcf2eb', dark: '#18233c' } }, // green-100 / navy-800
  'landcover-green': { 'fill-color': { light: '#93d6c0', dark: '#185f50' } }, // green-300 / green-800
  water: { 'fill-color': { light: '#baf3f8', dark: '#135060' } }, // cyan-200 / cyan-900
  waterway: { 'line-color': { light: '#baf3f8', dark: '#135060' } },
  building: { 'fill-color': { light: '#e7eaf0', dark: '#243049' } }, // navy-100 / navy-700
  'roundabout-island': { 'fill-color': { light: '#93d6c0', dark: '#185f50' } },
  road: { 'line-color': { light: '#7a8499', dark: '#535e76' } }, // navy-400 / navy-500
  'road-centerline': { 'line-color': { light: '#f5f7fa', dark: '#a7afbf' } }, // navy-50 / navy-300
  'roundabout-island-rim': { 'line-color': { light: '#f5f7fa', dark: '#a7afbf' } },
  'route-line': { 'line-color': { light: '#22bbca', dark: '#1d99a8' } }, // cyan-600 / cyan-700
  'road-label': {
    'text-color': { light: '#243049', dark: '#e7eaf0' }, // navy-700 / navy-100
    'text-halo-color': { light: '#ffffff', dark: '#18233c' },
  },
}

/** Kopie des Stils mit den Farben des gewünschten Schemas (für die Initialisierung ohne Farbsprung). */
export function withColorScheme(style: StyleSpecification, scheme: ColorScheme): StyleSpecification {
  const copy = structuredClone(style)
  for (const layer of copy.layers) {
    const colors = PALETTE[layer.id]
    if (!colors) continue
    const paint = ((layer as { paint?: Record<string, unknown> }).paint ??= {})
    for (const [prop, value] of Object.entries(colors)) if (value) paint[prop] = value[scheme]
  }
  return copy
}

/** Schema auf einer laufenden Karte umschalten, ohne den Stil neu zu laden. */
export function applyColorScheme(map: MapLibreMap, scheme: ColorScheme) {
  for (const [layerId, colors] of Object.entries(PALETTE)) {
    if (!map.getLayer(layerId)) continue
    for (const prop of Object.keys(colors) as PaintProperty[]) {
      const value = colors[prop]
      if (value) map.setPaintProperty(layerId, prop, value[scheme])
    }
  }
}
