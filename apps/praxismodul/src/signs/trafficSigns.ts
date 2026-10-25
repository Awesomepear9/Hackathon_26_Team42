// Amtliche deutsche Verkehrszeichen (StVO) als SVG von Wikimedia Commons, gemeinfrei als
// amtliche Werke (§ 5 Abs. 1 UrhG). Abgerufen mit `npm run signs` nach public/signs/;
// Quelle und Lizenz je Zeichen in signSources.json. Eingebunden nur per <img>.
import sources from './signSources.json'

export type TrafficSignId = keyof typeof sources

export interface TrafficSignInfo {
  /** amtliche Nummer nach Verkehrszeichenkatalog */
  number: string
  name: string
}

export const TRAFFIC_SIGNS: Record<TrafficSignId, TrafficSignInfo> = {
  '102': { number: '102', name: 'Kreuzung oder Einmündung mit Vorfahrt von rechts' },
  '131': { number: '131', name: 'Lichtzeichenanlage' },
  '151': { number: '151', name: 'Bahnübergang' },
  '205': { number: '205', name: 'Vorfahrt gewähren' },
  '206': { number: '206', name: 'Halt. Vorfahrt gewähren' },
  '215': { number: '215', name: 'Kreisverkehr' },
  '220': { number: '220', name: 'Einbahnstraße' },
  '325.1': { number: '325', name: 'Beginn eines verkehrsberuhigten Bereichs' },
  '325.2': { number: '325.2', name: 'Ende eines verkehrsberuhigten Bereichs' },
  '330.1': { number: '330', name: 'Autobahn' },
  '350': { number: '350', name: 'Fußgängerüberweg' },
}

/** URL der SVG-Datei eines Zeichens */
export function signUrl(id: TrafficSignId) {
  return `${import.meta.env.BASE_URL}signs/${sources[id].file}`
}

export const SIGN_SOURCES = sources
