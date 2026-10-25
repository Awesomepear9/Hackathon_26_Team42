import { useEffect, useMemo, useRef, useState } from 'react'
import type { Route } from '../../data/routes'
import { Icon } from '../../icons/Icon'
import {
  speedCheck,
  speedProfile,
  SEVERE_OVER_KMH,
  SPEED_TOLERANCE_KMH,
  SPEED_TOLERANCE_S,
  type Answer,
} from '../../learning/evaluation'
import { GENERAL_CRITERIA, SPEED_CRITERION, STARS_MAX, type GeneralRating } from '../../learning/generalBehavior'
import { Chip } from '../../ui/primitives'
import { ChecklistLegend, ChecklistRow } from './ChecklistRow'
import { SevereQuestion } from './SevereQuestion'

const formatKmh = (kmh: number) => kmh.toLocaleString('de-DE', { maximumFractionDigits: 1 })

/**
 * Allgemeine Fahrverhaltensbewertung am Ende der Fahrt (natives <dialog>): Kriterien der
 * Begleitperson, Tempo nach App-Regel, Gesamteindruck in Sternen und eigene Schwerfehler-Abfrage
 */
export function GeneralDialog({
  open,
  route,
  driverSeed,
  onSubmit,
  onCancel,
}: {
  open: boolean
  route: Route
  driverSeed: number
  onSubmit: (rating: GeneralRating) => void
  onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [stars, setStars] = useState<number>()
  const [severe, setSevere] = useState<boolean>()
  const speed = useMemo(() => speedCheck(speedProfile(route, driverSeed).samples), [route, driverSeed])
  const manual = GENERAL_CRITERIA.filter((c) => !c.auto)
  const complete = manual.every((c) => answers[c.id] !== undefined) && stars !== undefined && severe !== undefined

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const submit = () => {
    if (stars === undefined || severe === undefined) return
    onSubmit({ answers: { ...answers, [SPEED_CRITERION]: speed.violated ? 'missed' : 'done' }, severe, stars })
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="fahrverhalten-titel"
      onCancel={(e) => {
        e.preventDefault() // Escape: schließen übernimmt der Zustand
        onCancel()
      }}
      className="inset-x-4 inset-y-0 m-auto max-h-[calc(100dvh-2rem)] w-auto max-w-sm overflow-y-auto rounded-3xl bg-white p-5 text-navy-900 shadow-card backdrop:bg-navy-950/60 dark:bg-navy-900 dark:text-navy-50"
    >
      <h2 id="fahrverhalten-titel" className="text-h3 font-bold">
        Allgemeines Fahrverhalten
      </h2>
      <p className="mt-1 text-small text-navy-700 dark:text-navy-200">Einmal für die ganze Fahrt.</p>

      <ul className="mt-2">
        {manual.map((criterion) => (
          <ChecklistRow
            key={criterion.id}
            question={criterion.question}
            answer={answers[criterion.id]}
            onAnswer={(answer) =>
              setAnswers((a) => {
                const rest = Object.fromEntries(Object.entries(a).filter(([id]) => id !== criterion.id))
                return answer ? { ...rest, [criterion.id]: answer } : rest
              })
            }
          />
        ))}
        <li className="flex items-center gap-3 py-1.5">
          <span className="min-w-0 flex-1 text-small font-semibold">
            Geschwindigkeit
            <span className="block font-normal text-navy-600 dark:text-navy-300">
              von der App bewertet (+{SPEED_TOLERANCE_KMH} km/h, {SPEED_TOLERANCE_S} s Toleranz)
            </span>
          </span>
          <Chip tone={speed.violated ? 'red' : 'green'} className="shrink-0">
            {speed.violated ? `zu schnell (+${formatKmh(speed.maxOverKmh)} km/h)` : 'eingehalten'}
          </Chip>
        </li>
      </ul>
      <ChecklistLegend />

      <fieldset className="mt-4">
        <legend className="text-small font-bold">Gesamtleistung</legend>
        <div className="mt-1 flex gap-1">
          {Array.from({ length: STARS_MAX }, (_, i) => i + 1).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={stars === value}
              aria-label={`${value} von ${STARS_MAX} Sternen`}
              onClick={() => setStars(value)}
              className="flex size-11 items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Icon
                name="star"
                filled
                className={`size-8 ${stars !== undefined && value <= stars ? 'text-amber-500' : 'text-navy-200 dark:text-navy-700'}`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <SevereQuestion
        label="Schwerer Fehler im Fahrverhalten?"
        value={severe}
        onChange={setSevere}
        className="mt-4 border-t border-navy-100 pt-3 dark:border-navy-800"
      />
      {speed.severeHint && (
        <p
          role="note"
          className="mt-2 rounded-2xl bg-red-100 px-3 py-2 text-small text-red-800 dark:bg-red-950 dark:text-red-200"
        >
          Die App hat länger als {SPEED_TOLERANCE_S} s mindestens {SEVERE_OVER_KMH} km/h über dem Limit gemessen
          (höchstens +{formatKmh(speed.maxOverKmh)} km/h). Ob das ein schwerer Fehler war, entscheidet ihr.
        </p>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2.5 font-bold text-navy-700 ring-2 ring-navy-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:text-navy-200 dark:ring-navy-600"
        >
          Weiterfahren
        </button>
        <button
          type="button"
          disabled={!complete}
          onClick={submit}
          className="rounded-full bg-cyan-500 px-5 py-2.5 font-bold text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-navy-50"
        >
          Auswerten
        </button>
      </div>
    </dialog>
  )
}
