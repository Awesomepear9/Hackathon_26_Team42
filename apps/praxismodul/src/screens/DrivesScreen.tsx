import { useNavigation } from '../app/navigation'
import { Icon } from '../icons/Icon'
import { KM_GOAL, useDriveStore, type Drive } from '../learning/drives'
import { TopBar } from '../ui/headers'
import { formatKm, formatScore } from '../ui/format'
import { ProgressBar, SectionLabel } from '../ui/primitives'

const weekday = new Intl.DateTimeFormat('de-DE', { weekday: 'short' })
const longDate = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

/** Datums-Abzeichen: Wochentag (SA) über dem Tag (24) */
function DateBadge({ date }: { date: Date }) {
  return (
    <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-cyan-100 dark:bg-cyan-950">
      <span className="text-caption uppercase leading-none text-cyan-800 dark:text-cyan-300">
        {weekday.format(date).replace('.', '').slice(0, 2)}
      </span>
      <span className="text-h3 font-extrabold leading-tight">{date.getDate()}</span>
    </span>
  )
}

function DriveRow({ drive, latest }: { drive: Drive; latest: boolean }) {
  const { navigate } = useNavigation()
  const date = new Date(drive.date)
  return (
    <li>
      <button
        type="button"
        onClick={() => navigate({ name: 'result', driveId: drive.id })}
        aria-label={`${drive.level.title}, ${longDate.format(date)}, Note ${formatScore(drive.score)}`}
        className={`flex w-full items-center gap-3 rounded-3xl bg-white px-3 py-3 text-left shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-navy-900 ${
          latest ? 'ring-2 ring-cyan-500' : ''
        }`}
      >
        <DateBadge date={date} />
        <span className="min-w-0 flex-1">
          <span className="block text-body font-bold">{drive.level.title}</span>
          <span className="block text-small text-navy-500 dark:text-navy-300">
            Level {drive.level.id} · {formatKm(drive.distanceKm)} km · {drive.durationMin} Min
          </span>
        </span>
        <span className="flex items-center gap-1.5 pr-2 text-body font-bold">
          <Icon name="star" filled className="size-5 text-amber-500" />
          {formatScore(drive.score)}
        </span>
      </button>
    </li>
  )
}

export function DrivesScreen() {
  const { drives, issue } = useDriveStore()
  const totalKm = drives.reduce((sum, d) => sum + d.distanceKm, 0)
  const share = totalKm / KM_GOAL

  return (
    <>
      <TopBar>
        <h1 className="text-h2 font-extrabold">Fahrten</h1>
      </TopBar>

      {issue && (
        <p
          role="status"
          className="mt-4 rounded-2xl bg-amber-100 px-4 py-3 text-small text-amber-900 dark:bg-amber-950 dark:text-amber-100"
        >
          {issue === 'unreadable'
            ? 'Die gespeicherten Fahrten konnten nicht gelesen werden. Sie wurden gesichert; angezeigt werden Beispielfahrten.'
            : 'Einige gespeicherte Fahrten passen nicht mehr zu den aktuellen Strecken und werden nicht angezeigt.'}
        </p>
      )}

      <section
        aria-label="Gesamt"
        className="mt-5 rounded-3xl bg-navy-900 px-5 pt-4 pb-5 text-white dark:bg-navy-800 dark:ring-1 dark:ring-navy-700"
      >
        <p className="text-caption uppercase text-cyan-500">Gesamt</p>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-h1 font-extrabold">{formatKm(totalKm)} km</p>
          <p className="text-body text-navy-300">
            {drives.length} {drives.length === 1 ? 'Fahrt' : 'Fahrten'}
          </p>
        </div>
        <ProgressBar
          value={share}
          label={`Fortschritt zu ${formatKm(KM_GOAL)} km`}
          track="bg-navy-700"
          className="mt-3 h-2.5"
        />
        <p className="mt-2 text-small text-navy-300">
          von {formatKm(KM_GOAL)} km · {Math.round(share * 100)} %
        </p>
      </section>

      <SectionLabel className="mt-6">Deine Fahrten</SectionLabel>
      <ul className="mt-2 space-y-2">
        {drives.map((drive, i) => (
          <DriveRow key={drive.id} drive={drive} latest={i === 0} />
        ))}
      </ul>

      <p className="mt-8 text-center text-small">
        <a
          href={`${import.meta.env.BASE_URL}licenses.txt`}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-navy-600 underline-offset-2 hover:underline dark:text-navy-300"
        >
          Lizenzen und Quellen
        </a>
      </p>
    </>
  )
}
