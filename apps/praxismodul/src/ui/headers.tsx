import { useEffect, useState, type ReactNode } from 'react'
import { useNavigation } from '../app/navigation'
import { Icon } from '../icons/Icon'
import { Logo } from './Logo'

/** `onBack` ersetzt das normale Zurück, z. B. für eine Rückfrage */
export function BackButton({ onBack }: { onBack?: () => void }) {
  const { back } = useNavigation()
  return (
    <button
      type="button"
      onClick={onBack ?? back}
      aria-label="Zurück"
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-navy-900 shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-navy-900 dark:text-navy-50"
    >
      <Icon name="chevron-left" className="size-6" strokeWidth={2.5} />
    </button>
  )
}

/** Zurück-Button, Inhalt in der Mitte bzw. links, Logo rechts (LvL Auswahl, Fahrten, Fahrt, Auswertung) */
export function TopBar({
  children,
  centered = false,
  onBack,
}: {
  children?: ReactNode
  centered?: boolean
  onBack?: () => void
}) {
  return (
    <header className="flex items-center gap-3">
      <BackButton onBack={onBack} />
      <div className={`min-w-0 flex-1 ${centered ? 'flex justify-center' : ''}`}>{children}</div>
      <Logo className="size-10 shrink-0" />
    </header>
  )
}

function currentTime() {
  return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

/** Uhrzeit-Pille wie im Entwurf, aktualisiert sich minütlich */
export function ClockPill() {
  const [time, setTime] = useState(currentTime)
  useEffect(() => {
    const timer = setInterval(() => setTime(currentTime()), 15000)
    return () => clearInterval(timer)
  }, [])
  return (
    <time className="rounded-full bg-cyan-100 px-5 py-1.5 text-small font-semibold text-navy-900 tabular-nums dark:bg-cyan-950 dark:text-navy-50">
      {time}
    </time>
  )
}
