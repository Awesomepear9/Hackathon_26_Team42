// Hash-Routing ohne Zusatzbibliothek: jeder Screen hat eine Adresse (#/fahrten, #/fahrt/2/A …),
// damit Browser-/System-Zurück in der App bleibt und Fahrt und Auswertung per Link erreichbar sind.
// Die Tiefe im App-Verlauf steht in history.state; bei Tiefe 0 führt „Zurück“ zur Startseite.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { levelById, LEVELS } from '../learning/levels'
import type { Navigation, Screen } from './navigation'

export const START: Screen = { name: 'home' }

interface HistoryState {
  depth: number
}

interface RouterState {
  screen: Screen
  /** Anzahl App-Screens vor diesem im Browser-Verlauf */
  depth: number
}

export function screenToHash(screen: Screen): string {
  switch (screen.name) {
    case 'home':
      return '#/'
    case 'levels':
      return '#/level'
    case 'drives':
      return '#/fahrten'
    case 'drive':
      return `#/fahrt/${screen.levelId}/${screen.slot}`
    case 'result':
      return `#/auswertung/${encodeURIComponent(screen.driveId)}`
  }
}

/** Titel des Screens für Seitentitel und Ansage */
export function screenTitle(screen: Screen): string {
  switch (screen.name) {
    case 'home':
      return 'Übersicht'
    case 'levels':
      return 'LvL Auswahl'
    case 'drives':
      return 'Fahrten'
    case 'drive':
      return `Fahrt Route ${screen.slot} · Level ${screen.levelId} ${levelById(screen.levelId).title}`
    case 'result':
      return 'Fahrt abgeschlossen'
  }
}

function decode(part: string) {
  try {
    return decodeURIComponent(part)
  } catch {
    return undefined // kaputte %-Folge
  }
}

/** Adresse → Screen; unbekannte oder ungültige Adressen führen zur Startseite */
export function hashToScreen(hash: string): Screen {
  const [name, ...params] = hash.replace(/^#?\/?/, '').split('/')
  if (name === '' && params.length === 0) return START
  if (name === 'level' && params.length === 0) return { name: 'levels' }
  if (name === 'fahrten' && params.length === 0) return { name: 'drives' }
  if (name === 'fahrt' && params.length === 2) {
    const [levelPart, slot] = params
    const level = /^\d+$/.test(levelPart) ? LEVELS.find((l) => l.id === Number(levelPart)) : undefined
    const route = level?.routes.find((r) => r.slot === slot)
    if (level && route) return { name: 'drive', levelId: level.id, slot: route.slot }
  }
  if (name === 'auswertung' && params.length === 1) {
    const driveId = decode(params[0])
    if (driveId) return { name: 'result', driveId }
  }
  return START
}

function depthOf(state: unknown): number {
  const depth = (state as Partial<HistoryState> | null)?.depth
  return typeof depth === 'number' && Number.isInteger(depth) && depth >= 0 ? depth : 0
}

function readLocation(): RouterState {
  return { screen: hashToScreen(window.location.hash), depth: depthOf(window.history.state) }
}

function writeLocation(mode: 'push' | 'replace', { screen, depth }: RouterState) {
  const state: HistoryState = { depth }
  const url = screenToHash(screen)
  if (mode === 'push') window.history.pushState(state, '', url)
  else window.history.replaceState(state, '', url)
}

/** Navigation über die Adresse; Browser-Zurück und App-Zurück laufen durch denselben Verlauf */
export function useHashRouter(): Navigation {
  const [location, setLocation] = useState(readLocation)

  // Adresse vereinheitlichen (z. B. ungültiger Link → #/) und die Tiefe im Verlauf vermerken
  useEffect(() => {
    writeLocation('replace', readLocation())
  }, [])

  useEffect(() => {
    const sync = () => {
      const next = readLocation()
      writeLocation('replace', next) // auch von Hand eingegebene Adressen vereinheitlichen
      setLocation(next)
    }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const navigate = useCallback<Navigation['navigate']>((screen, options) => {
    const current = readLocation()
    let next: RouterState
    if (options?.replace) {
      next = { screen, depth: current.depth }
      writeLocation('replace', next)
    } else if (options?.reset) {
      // neuer Verlauf in der App (Tabs); Browser-Zurück führt trotzdem zum vorherigen Screen
      next = { screen, depth: 0 }
      writeLocation(screenToHash(screen) === screenToHash(current.screen) ? 'replace' : 'push', next)
    } else {
      next = { screen, depth: current.depth + 1 }
      writeLocation('push', next)
    }
    setLocation(next)
  }, [])

  const back = useCallback(() => {
    if (readLocation().depth > 0) {
      window.history.back() // popstate setzt den Screen
    } else {
      const next = { screen: START, depth: 0 }
      writeLocation('replace', next)
      setLocation(next)
    }
  }, [])

  const { screen, depth } = location
  return useMemo(() => ({ screen, navigate, back, canGoBack: depth > 0 }), [screen, navigate, back, depth])
}
