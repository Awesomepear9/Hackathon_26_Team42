import { createContext, useContext } from 'react'
import type { RouteSlot } from '../learning/levels'

/** Screens der App; Parameter stecken im Objekt */
export type Screen =
  | { name: 'home' }
  | { name: 'levels' }
  | { name: 'drives' }
  | { name: 'drive'; levelId: number; slot: RouteSlot }
  | { name: 'result'; driveId: string }

export interface Navigation {
  screen: Screen
  /**
   * neuen Screen öffnen; `replace` ersetzt den aktuellen (z. B. Fahrt → Auswertung),
   * `reset` beginnt einen neuen Verlauf (Tabs der unteren Navigation)
   */
  navigate: (screen: Screen, options?: { replace?: boolean; reset?: boolean }) => void
  /** zurück; ohne Verlauf zur Startseite */
  back: () => void
  canGoBack: boolean
}

export const NavigationContext = createContext<Navigation | null>(null)

export function useNavigation(): Navigation {
  const navigation = useContext(NavigationContext)
  if (!navigation) throw new Error('useNavigation braucht <App>')
  return navigation
}
