import { useEffect, useRef } from 'react'
import { DriveResultScreen } from '../screens/result/DriveResultScreen'
import { DriveScreen } from '../screens/drive/DriveScreen'
import { DrivesScreen } from '../screens/DrivesScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { LevelSelectScreen } from '../screens/LevelSelectScreen'
import { BottomNav } from '../ui/BottomNav'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { NavigationContext, type Screen } from './navigation'
import { screenToHash, screenTitle, START, useHashRouter } from './router'

function ScreenView({ screen }: { screen: Screen }) {
  switch (screen.name) {
    case 'home':
      return <HomeScreen />
    case 'levels':
      return <LevelSelectScreen />
    case 'drives':
      return <DrivesScreen />
    case 'drive':
      return <DriveScreen key={`${screen.levelId}-${screen.slot}`} levelId={screen.levelId} slot={screen.slot} />
    case 'result':
      return <DriveResultScreen driveId={screen.driveId} />
  }
}

/** Ersatz für einen Screen, der einen Fehler hatte – statt einer leeren Seite */
function ScreenError({ onHome }: { onHome: () => void }) {
  return (
    <section role="alert" className="rounded-3xl bg-white p-5 shadow-card dark:bg-navy-900">
      <h1 className="text-h3 font-bold">Hier ist etwas schiefgelaufen</h1>
      <p className="mt-2 text-body text-navy-600 dark:text-navy-300">
        Der Screen konnte nicht angezeigt werden. Deine gespeicherten Fahrten sind davon nicht betroffen.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onHome}
          className="rounded-full bg-cyan-500 px-5 py-2 font-bold text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
        >
          Zur Startseite
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full px-5 py-2 font-semibold text-navy-700 ring-1 ring-navy-200 focus-visible:outline-2 focus-visible:outline-accent dark:text-navy-200 dark:ring-navy-600"
        >
          Neu laden
        </button>
      </div>
    </section>
  )
}

/** App-Rahmen: mobile Spalte, Screen-Verlauf, untere Navigation */
export function App() {
  const navigation = useHashRouter()
  const { screen, navigate } = navigation
  const title = screenTitle(screen)
  const address = screenToHash(screen)
  // Während der Fahrt ohne untere Navigation: mehr Platz für Karte und Aufgaben, Zurück gibt es oben
  const focused = screen.name === 'drive'

  useEffect(() => {
    document.title = `${title} · DigiFL`
  }, [title])

  // Beim Screenwechsel (nicht beim ersten Laden) nach oben scrollen und den Fokus auf die Überschrift
  // des neuen Screens setzen, damit Tastatur und Screenreader dort weitermachen statt auf dem alten Button
  const mainRef = useRef<HTMLElement>(null)
  const shownAddress = useRef(address)
  useEffect(() => {
    if (shownAddress.current === address) return
    shownAddress.current = address
    mainRef.current?.scrollTo({ top: 0 })
    const heading = document.querySelector<HTMLElement>('main h1')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
  }, [address])

  return (
    <NavigationContext.Provider value={navigation}>
      {/* App-Rahmen in Bildschirmhöhe: Nur der Inhalt scrollt, die Navigation steht darunter und
          liegt nie über dem Inhalt. Abstände inkl. Safe Area (Notch, Home-Indikator). */}
      <div className="flex h-dvh flex-col bg-surface font-sans text-navy-900 dark:bg-navy-950 dark:text-navy-50">
        <main
          ref={mainRef}
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pt-[calc(env(safe-area-inset-top)+1.5rem)] pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] ${
            focused ? 'pb-[calc(env(safe-area-inset-bottom)+1rem)]' : 'pb-4'
          }`}
        >
          <div className="mx-auto max-w-md">
            <ErrorBoundary
              resetKey={screen}
              fallback={() => <ScreenError onHome={() => navigate(START, { reset: true })} />}
            >
              <ScreenView screen={screen} />
            </ErrorBoundary>
          </div>
        </main>
        {!focused && (
          <footer className="shrink-0 pt-2 pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pl-[max(1rem,env(safe-area-inset-left))]">
            <BottomNav />
          </footer>
        )}
        <p aria-live="polite" className="sr-only">
          {title}
        </p>
      </div>
    </NavigationContext.Provider>
  )
}
