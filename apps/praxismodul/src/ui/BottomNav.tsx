import { useEffect, useId, useRef, useState } from 'react'
import { useNavigation, type Screen } from '../app/navigation'
import { PROFILE } from '../app/profile'
import { DUNGEON_URL, WEBSITE_URL } from '../app/website'
import { Icon } from '../icons/Icon'
import type { OutlineIconName } from '../icons/tabler'

interface NavItem {
  screen: Screen
  label: string
  icon: OutlineIconName
  /** Screens, auf denen der Eintrag als aktiv gilt */
  section: Screen['name'][]
}

const ITEMS: NavItem[] = [
  { screen: { name: 'home' }, label: 'Übersicht', icon: 'layout-grid', section: ['home', 'levels'] },
  { screen: { name: 'drives' }, label: 'Fahrten', icon: 'route', section: ['drives', 'result'] },
]

/** Navigationsleiste unter dem Inhalt; der aktive Eintrag wird zur Pille mit Beschriftung */
export function BottomNav() {
  const { screen, navigate } = useNavigation()
  return (
    <nav
      aria-label="Hauptnavigation"
      className="mx-auto flex max-w-md items-center justify-between rounded-full bg-white p-2 shadow-card ring-1 ring-navy-100 dark:bg-navy-900 dark:ring-navy-800"
    >
      {ITEMS.map((item) => {
        const active = item.section.includes(screen.name)
        return (
          <button
            key={item.screen.name}
            type="button"
            aria-current={active ? 'page' : undefined}
            aria-label={active ? undefined : item.label}
            onClick={() => navigate(item.screen, { reset: true })}
            className={`flex h-14 items-center justify-center gap-3 rounded-full text-navy-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:text-navy-200 ${
              active
                ? 'bg-cyan-100 px-7 text-navy-900 dark:bg-cyan-950 dark:text-navy-50'
                : 'w-14 hover:bg-navy-50 dark:hover:bg-navy-800'
            }`}
          >
            <Icon name={item.icon} className="size-7" />
            {active && <span className="text-body font-bold">{item.label}</span>}
          </button>
        )
      })}
      <TheoryMenu />
      <span
        role="img"
        aria-label="Profil – bald verfügbar"
        title="Bald verfügbar"
        className="flex size-12 items-center justify-center rounded-full bg-navy-900 text-body font-bold text-white dark:bg-navy-50 dark:text-navy-900"
      >
        {PROFILE.initials}
      </span>
    </nav>
  )
}

const LINKS = [
  { href: DUNGEON_URL, label: 'Theorie-Dungeon spielen', icon: 'device-gamepad-2' },
  { href: WEBSITE_URL, label: 'Zur DigiFL-Website', icon: 'world' },
] as const

/** Schwerter: öffnen ein Menü mit Links zum Theorie-Dungeon und zur Website.
 * target="_top", damit die Links auch aus der eingebetteten App (iframe) das ganze Fenster wechseln. */
function TheoryMenu() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Theorie-Dungeon"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`flex size-14 items-center justify-center rounded-full text-navy-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:text-navy-200 ${
          open
            ? 'bg-cyan-100 text-navy-900 dark:bg-cyan-950 dark:text-navy-50'
            : 'hover:bg-navy-50 dark:hover:bg-navy-800'
        }`}
      >
        <Icon name="swords" className="size-7" />
      </button>
      {open && (
        <ul
          id={menuId}
          className="absolute right-0 bottom-full mb-3 w-64 rounded-3xl bg-white p-2 shadow-card ring-1 ring-navy-100 dark:bg-navy-900 dark:ring-navy-800"
        >
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_top"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-body font-semibold text-navy-900 hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:text-navy-50 dark:hover:bg-navy-800"
              >
                <Icon name={link.icon} className="size-6 text-cyan-700 dark:text-accent" />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
