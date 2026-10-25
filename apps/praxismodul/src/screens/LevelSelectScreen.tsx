import { useState } from 'react'
import { useNavigation } from '../app/navigation'
import { routeById } from '../data/routes'
import { Icon } from '../icons/Icon'
import { activeLevel, levelProgress, useDrives, type LevelProgress } from '../learning/drives'
import { PASSING_SCORE, type RouteSlot } from '../learning/levels'
import { TRAFFIC_LABEL, trafficNote, trafficProvider, type TrafficLevel } from '../learning/traffic'
import { useTraffic } from '../learning/useTraffic'
import { TopBar } from '../ui/headers'
import { LevelShield } from '../ui/LevelShield'
import { formatKm, formatScore } from '../ui/format'
import { Chip, Dot, ProgressBar, SectionLabel } from '../ui/primitives'
import { RoutePreview } from './RoutePreview'

const TRAFFIC_TONE: Record<TrafficLevel, 'green' | 'amber' | 'red'> = { low: 'green', medium: 'amber', high: 'red' }

function LockedLevel({ progress, previous }: { progress: LevelProgress; previous?: number }) {
  return (
    <li className="flex items-center gap-3 rounded-3xl bg-navy-100 px-4 py-3 text-navy-500 ring-1 ring-navy-200 dark:bg-navy-900 dark:text-navy-300 dark:ring-navy-800">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-200/60 dark:bg-navy-800">
        <Icon name="lock" className="size-5" />
      </span>
      <div>
        <h3 className="text-body font-bold">
          Level {progress.level.id} · {progress.level.title}
        </h3>
        <p className="text-small">
          {progress.level.routes.length === 0
            ? 'Bald verfügbar'
            : `Beende erst 1 Fahrt aus Level ${previous} mit ${formatScore(PASSING_SCORE)} ohne schweren Fehler`}
        </p>
      </div>
    </li>
  )
}

function RouteChoice({
  slot,
  routeId,
  levelId,
  traffic,
  selected,
  onSelect,
}: {
  slot: RouteSlot
  routeId: string
  levelId: number
  traffic?: TrafficLevel
  selected: boolean
  onSelect: () => void
}) {
  const route = routeById(routeId)
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          selected
            ? 'border-cyan-500 bg-cyan-100 dark:bg-cyan-950'
            : 'border-navy-100 bg-navy-50 hover:border-navy-200 dark:border-navy-700 dark:bg-navy-800 dark:hover:border-navy-500'
        }`}
      >
        <span>
          <span className="block text-body font-bold">
            Route {slot} · {formatKm(route.distanceM / 1000)} km
          </span>
          <span className="block text-small text-navy-600 dark:text-navy-300">
            {traffic ? trafficNote(traffic, levelId) : route.title}
          </span>
        </span>
        {traffic && (
          <Chip tone={TRAFFIC_TONE[traffic]} className="shrink-0">
            <Dot tone={TRAFFIC_TONE[traffic]} />
            {TRAFFIC_LABEL[traffic]}
          </Chip>
        )}
      </button>
    </li>
  )
}

function OpenLevel({ progress, onToggle }: { progress: LevelProgress; onToggle: () => void }) {
  const { navigate } = useNavigation()
  const { level } = progress
  const traffic = useTraffic(level.routes.map((r) => r.routeId))
  const [slot, setSlot] = useState<RouteSlot>(level.routes[0].slot)
  const selectedRouteId = level.routes.find((r) => r.slot === slot)?.routeId ?? level.routes[0].routeId

  return (
    <li className="rounded-3xl border-2 border-cyan-500 bg-white p-4 shadow-card dark:bg-navy-900">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded="true"
        className="flex w-full items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <LevelShield number={level.id} done={progress.completed} />
        <span className="min-w-0 flex-1">
          <span className="block text-caption uppercase text-cyan-800 dark:text-cyan-400">Level {level.id}</span>
          <span className="block text-body font-bold">{level.title}</span>
          <ProgressBar value={progress.percent / 100} label={`Fortschritt Level ${level.id}`} className="mt-2 h-2" />
        </span>
        <span className="flex items-center gap-2 text-body font-bold">
          {progress.percent} %
          <Icon name="chevron-up" className="size-5 text-navy-500" />
        </span>
      </button>

      <SectionLabel className="mt-4">Lernthemen</SectionLabel>
      <ul className="mt-2 flex flex-wrap gap-2">
        {level.topics.map((topic) => (
          <li key={topic}>
            <Chip className="px-4.5 py-1.5">{topic}</Chip>
          </li>
        ))}
      </ul>

      <SectionLabel className="mt-4 flex items-center gap-2">
        <Dot tone="green" /> Routen · {trafficProvider.heading}
      </SectionLabel>
      <ul className="mt-2 space-y-2">
        {level.routes.map((route) => (
          <RouteChoice
            key={route.slot}
            {...route}
            levelId={level.id}
            traffic={traffic[route.routeId]}
            selected={route.slot === slot}
            onSelect={() => setSlot(route.slot)}
          />
        ))}
      </ul>

      <SectionLabel className="mt-4">Vorschau Route {slot}</SectionLabel>
      <div className="mt-2">
        <RoutePreview route={routeById(selectedRouteId)} level={level} />
      </div>

      <button
        type="button"
        onClick={() => navigate({ name: 'drive', levelId: level.id, slot })}
        className="mt-3 w-full rounded-2xl bg-cyan-500 py-3 text-body font-bold text-navy-900 hover:bg-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
      >
        Route {slot} starten
      </button>
    </li>
  )
}

function ClosedLevel({ progress, onToggle }: { progress: LevelProgress; onToggle: () => void }) {
  const { level, completed, percent } = progress
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded="false"
        className="flex w-full items-center gap-3 rounded-3xl bg-white px-4 py-3 text-left shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-navy-900"
      >
        <LevelShield number={level.id} done={completed} />
        <span className="min-w-0 flex-1">
          <span className="block text-body font-bold">
            Level {level.id} · {level.title}
          </span>
          <span className="block text-small text-navy-500 dark:text-navy-300">
            {completed ? 'Abgeschlossen' : 'Begonnen'}
          </span>
        </span>
        <Chip tone={completed ? 'green' : 'cyan'}>{percent} %</Chip>
      </button>
    </li>
  )
}

export function LevelSelectScreen() {
  const drives = useDrives()
  const progress = levelProgress(drives)
  const active = activeLevel(progress)
  const [open, setOpen] = useState<number | undefined>(active.level.id)

  return (
    <>
      <TopBar>
        <h1 className="text-h2 font-extrabold">LvL Auswahl</h1>
      </TopBar>
      <ul className="mt-5 space-y-3">
        {progress.map((p, i) => {
          if (!p.unlocked) return <LockedLevel key={p.level.id} progress={p} previous={progress[i - 1]?.level.id} />
          const toggle = () => setOpen((id) => (id === p.level.id ? undefined : p.level.id))
          return open === p.level.id ? (
            <OpenLevel key={p.level.id} progress={p} onToggle={toggle} />
          ) : (
            <ClosedLevel key={p.level.id} progress={p} onToggle={toggle} />
          )
        })}
      </ul>
    </>
  )
}
