import { Icon } from '../../icons/Icon'

/** wählbarer Zeitraffer der Simulation */
const SPEEDS = [1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

/** Pause/Weiter und Tempo der simulierten Fahrt (WCAG 2.2.2: bewegte Inhalte anhalten können) */
export function ReplayControls({
  playing,
  finished,
  speed,
  onPlayingChange,
  onSpeedChange,
}: {
  playing: boolean
  finished: boolean
  speed: Speed
  onPlayingChange: (playing: boolean) => void
  onSpeedChange: (speed: Speed) => void
}) {
  const running = playing && !finished
  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onPlayingChange(!playing)}
        disabled={finished}
        className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-body font-bold text-navy-900 shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 dark:bg-navy-900 dark:text-navy-50"
      >
        <Icon name={running ? 'player-pause' : 'player-play'} filled className="size-5" />
        {running ? 'Pause' : 'Weiter'}
      </button>
      <div role="group" aria-labelledby="tempo-label" className="flex items-center gap-2">
        <span id="tempo-label" className="text-caption uppercase text-navy-600 dark:text-navy-300">
          Tempo
        </span>
        <span className="flex rounded-full bg-white p-1 shadow-card dark:bg-navy-900">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === speed}
              onClick={() => onSpeedChange(s)}
              className={`h-9 min-w-11 rounded-full px-3 text-small font-bold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                s === speed
                  ? 'bg-cyan-500 text-navy-900'
                  : 'text-navy-700 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800'
              }`}
            >
              <span aria-hidden="true">{s}×</span>
              <span className="sr-only">{s}-fach</span>
            </button>
          ))}
        </span>
      </div>
    </div>
  )
}
