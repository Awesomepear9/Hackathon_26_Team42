import { useCallback, useSyncExternalStore } from 'react'
import type { ColorScheme } from '../map/palette'

/** Beobachtet Klassenänderungen an <html> und <body>, dort setzen Apps üblicherweise .dark */
function subscribeToThemeClass(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

/**
 * Hell/Dunkel wie Tailwinds dark-Variante: 'auto' ist dunkel, sobald ein Vorfahre von `element`
 * die Klasse .dark trägt. 'light'/'dark' erzwingen das Schema.
 */
export function useColorScheme(element: HTMLElement | null, preference: ColorScheme | 'auto'): ColorScheme {
  const getSnapshot = useCallback((): ColorScheme => (element?.closest('.dark') ? 'dark' : 'light'), [element])
  const auto = useSyncExternalStore(subscribeToThemeClass, getSnapshot, (): ColorScheme => 'light')
  return preference === 'auto' ? auto : preference
}
