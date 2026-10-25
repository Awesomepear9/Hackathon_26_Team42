import type { DrivePoint } from '../../learning/drivePoints'
import type { Answer } from '../../learning/evaluation'
import { TRAFFIC_SIGNS } from '../../signs/trafficSigns'
import { TrafficSign } from '../../signs/TrafficSign'
import { distanceLabel } from '../../ui/format'
import { Chip, SectionLabel } from '../../ui/primitives'
import { ChecklistLegend, ChecklistRow } from './ChecklistRow'
import { SevereQuestion } from './SevereQuestion'

/** „102 · Spielstraße“ bzw. nur der Titel, wenn es kein Zeichen gibt */
function signTitle(point: DrivePoint) {
  return point.sign ? `${TRAFFIC_SIGNS[point.sign].number} · ${point.type.title}` : point.type.title
}

export function CurrentPointCard({
  point,
  total,
  distance,
  answers,
  onAnswer,
  severe,
  onSevereChange,
}: {
  point: DrivePoint
  total: number
  /** Meter bis zum Punkt (negativ = vorbei) */
  distance: number
  answers: Record<string, Answer>
  onAnswer: (checkId: string, answer: Answer | undefined) => void
  /** Schwerfehler-Abfrage: Ja setzt die Aktion auf 0; undefined = noch nicht beantwortet */
  severe: boolean | undefined
  onSevereChange: (severe: boolean) => void
}) {
  const { type } = point
  const caption = point.sign ? `${TRAFFIC_SIGNS[point.sign].number} · Punkt` : 'Punkt'
  return (
    <section
      aria-labelledby={`punkt-${point.id}`}
      className="rounded-3xl border-2 border-cyan-200 bg-cyan-100 px-4 py-3 dark:border-cyan-900 dark:bg-cyan-950"
    >
      <header className="flex items-start gap-3">
        <TrafficSign sign={point.sign} className="size-11" />
        <div className="min-w-0 flex-1">
          <p className="text-caption uppercase text-navy-700 dark:text-navy-200">
            {caption} {point.number} von {total}
          </p>
          <h2 id={`punkt-${point.id}`} className="text-h3 font-extrabold">
            {type.title}
          </h2>
        </div>
        <Chip tone="white" className="shrink-0">
          {distanceLabel(distance)}
        </Chip>
      </header>

      <p className="mt-2 text-small">
        <strong className="font-bold">Regel</strong> {type.rule}
      </p>
      <p className="mt-1 text-small">
        <strong className="font-bold">Fahrschüler</strong> {type.student}
      </p>

      <SectionLabel className="mt-3 text-navy-700 dark:text-navy-200">Du achtest darauf</SectionLabel>
      <ul>
        {type.checks.map((check) => (
          <ChecklistRow
            key={check.id}
            question={check.question}
            answer={answers[check.id]}
            onAnswer={(answer) => onAnswer(check.id, answer)}
          />
        ))}
      </ul>
      <ChecklistLegend />
      {/* Schwerfehler-Abfrage je Aktion; bleibt unten sichtbar, wenn die Karte scrollt */}
      <SevereQuestion
        label="Schwerer Fehler bei dieser Aktion?"
        value={severe}
        onChange={onSevereChange}
        className="sticky bottom-0 -mx-4 -mb-3 mt-3 border-t border-cyan-200 bg-cyan-100 px-4 py-2 dark:border-cyan-900 dark:bg-cyan-950"
      />
    </section>
  )
}

/** Weitere Punkte der Fahrt; Tippen zeigt den Punkt oben an */
export function PointListItem({
  point,
  passed,
  onSelect,
}: {
  point: DrivePoint
  passed: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-3 rounded-3xl bg-white px-4 py-3 text-left shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-navy-900 ${
          passed ? 'opacity-60' : ''
        }`}
      >
        <TrafficSign sign={point.sign} className="size-10" />
        <span className="min-w-0 flex-1">
          <span className="block text-h3 font-bold">{signTitle(point)}</span>
          <span className="block text-small text-navy-500 dark:text-navy-300">{point.type.hint}</span>
        </span>
        <Chip tone={passed ? 'cyan' : 'amber'} className="shrink-0">
          {passed ? 'Vorbei' : `Punkt ${point.number}`}
        </Chip>
      </button>
    </li>
  )
}
