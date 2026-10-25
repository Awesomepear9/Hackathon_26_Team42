import { useNavigation } from '../app/navigation'
import { PROFILE } from '../app/profile'
import { Icon } from '../icons/Icon'
import type { OutlineIconName } from '../icons/tabler'
import { activeLevel, KM_GOAL, levelAverage, levelProgress, useDrives, type LevelProgress } from '../learning/drives'
import { PASSING_SCORE } from '../learning/levels'
import { LevelShield } from '../ui/LevelShield'
import { LogoWordmark } from '../ui/Logo'
import { formatKm, formatScore } from '../ui/format'
import { StarRating } from '../ui/primitives'

/** Logo mit Schriftzug und Claim wie im Entwurf */
function Brand() {
  return (
    <div className="flex flex-col items-center">
      <LogoWordmark className="h-14" />
      <p className="mt-1 text-[0.625rem] leading-tight font-bold tracking-wider text-navy-700 uppercase dark:text-navy-200">
        Digitaler Fahrlehrer
      </p>
      <p className="text-[0.625rem] leading-tight text-navy-500 dark:text-navy-300">Lernen. Üben. Sicher ankommen.</p>
    </div>
  )
}

/** Hinweis, was zum nächsten Level fehlt */
function nextStep(progress: LevelProgress[], active: LevelProgress) {
  if (active.completed) return 'Alle verfügbaren Level abgeschlossen'
  const next = progress[progress.indexOf(active) + 1]
  if (!next) return `Für den Abschluss: 1 Fahrt ab ${PASSING_SCORE} Sternen ohne schweren Fehler`
  return next.level.routes.length > 0
    ? `Level ${next.level.id}: 1 Fahrt ab ${PASSING_SCORE} Sternen ohne schweren Fehler`
    : `Level ${next.level.id} ist bald verfügbar`
}

function StatTile({ icon, tone, value, label }: { icon: OutlineIconName; tone: string; value: string; label: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
      <p className="flex items-center gap-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
          <Icon name={icon} className="size-5" />
        </span>
        <span className="text-h3 font-extrabold">{value}</span>
      </p>
      <p className="mt-2 text-small text-navy-600 dark:text-navy-300">{label}</p>
    </div>
  )
}

function MenuButton({
  icon,
  label,
  highlighted = false,
  onClick,
}: {
  icon: OutlineIconName
  label: string
  highlighted?: boolean
  /** ohne Aktion: noch nicht verfügbar */
  onClick?: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed ${
          highlighted
            ? 'border-cyan-500 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-950 dark:hover:bg-cyan-900'
            : 'border-navy-200 bg-white enabled:hover:bg-navy-50 dark:border-navy-700 dark:bg-navy-900 dark:enabled:hover:bg-navy-800'
        }`}
      >
        <Icon name={icon} className="size-7 shrink-0" />
        <span className="flex-1 text-body font-bold">{label}</span>
        {!onClick && <span className="text-small text-navy-500 dark:text-navy-300">Bald verfügbar</span>}
      </button>
    </li>
  )
}

/** Startseite: Begrüßung, aktuelles Level, Kennzahlen und Einstiege */
export function HomeScreen() {
  const { navigate } = useNavigation()
  const drives = useDrives()
  const progress = levelProgress(drives)
  const active = activeLevel(progress)
  const average = levelAverage(drives, active.level.id)
  const totalKm = drives.reduce((sum, d) => sum + d.distanceKm, 0)

  return (
    <>
      <Brand />
      <h1 className="mt-6 text-h2 font-extrabold">Hallo {PROFILE.firstName}!</h1>
      <p className="mt-1 text-body text-navy-600 dark:text-navy-300">Bereit für die nächste Fahrt?</p>

      <section
        aria-labelledby="aktuelles-level"
        className="mt-5 rounded-3xl bg-navy-900 p-5 text-white shadow-card dark:bg-navy-800"
      >
        <div className="flex items-center gap-4">
          <LevelShield number={active.level.id} done={active.completed} size="lg" />
          <div>
            <p className="text-caption text-cyan-400 uppercase">Aktuelles Level</p>
            <h2 id="aktuelles-level" className="mt-1 text-h3 font-bold">
              {active.level.title}
            </h2>
          </div>
        </div>
        <p className="mt-5 text-small text-navy-200">Ø Sterne in diesem Level</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-display leading-none font-extrabold">
            {average !== undefined ? formatScore(average) : '–'}
          </p>
          <StarRating score={average ?? 0} className="size-5" align="start" emptyClassName="text-navy-600" />
        </div>
        <p className="mt-5 text-small text-navy-200">{nextStep(progress, active)}</p>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile
          icon="navigation"
          tone="bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
          value={`${formatKm(totalKm)} km`}
          label={`von ${formatKm(KM_GOAL)} km`}
        />
        <StatTile
          icon="circle-check"
          tone="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
          value={String(drives.length)}
          label="Fahrten absolviert"
        />
      </div>

      <ul className="mt-4 space-y-3">
        <MenuButton icon="stack-2" label="LvL Auswahl" highlighted onClick={() => navigate({ name: 'levels' })} />
        <MenuButton icon="navigation" label="Freie Fahrt" />
        <MenuButton icon="clock" label="Prüfungssimulation" />
      </ul>
    </>
  )
}
