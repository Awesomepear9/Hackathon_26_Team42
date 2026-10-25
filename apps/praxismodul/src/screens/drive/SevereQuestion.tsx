import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../icons/Icon'
import { SEVERE_CATALOG } from '../../learning/generalBehavior'

/** Schwerfehler-Katalog als Hilfe (natives <dialog>) */
function SevereCatalogDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="schwerfehler-titel"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="inset-x-4 inset-y-0 m-auto max-h-[calc(100dvh-2rem)] w-auto max-w-sm overflow-y-auto rounded-3xl bg-white p-5 text-navy-900 shadow-card backdrop:bg-navy-950/60 dark:bg-navy-900 dark:text-navy-50"
    >
      <h2 id="schwerfehler-titel" className="text-h3 font-bold">
        Schwere Fehler
      </h2>
      <dl className="mt-3 space-y-2 text-small">
        {SEVERE_CATALOG.map(({ title, trigger }) => (
          <div key={title}>
            <dt className="font-bold">{title}</dt>
            <dd className="text-navy-700 dark:text-navy-200">{trigger}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-small text-navy-700 dark:text-navy-200">
        Nicht jeder kleine Fehler ist ein schwerer Fehler. Entscheidend ist, ob das Ereignis eine dieser Regeln erfüllt.
        Derselbe Vorfall zählt nur einmal.
      </p>
      <button
        type="button"
        autoFocus
        onClick={onClose}
        className="mt-4 w-full rounded-full bg-cyan-500 py-2.5 font-bold text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 dark:focus-visible:outline-navy-50"
      >
        Verstanden
      </button>
    </dialog>
  )
}

const OPTIONS = [
  { value: false, label: 'Nein', selected: 'border-green-500 bg-green-500 text-navy-900' },
  { value: true, label: 'Ja', selected: 'border-red-500 bg-red-500 text-navy-900' },
]

/** Schwerfehler-Abfrage einer Aktion: Ja setzt die Aktion auf 0 */
export function SevereQuestion({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string
  /** undefined: noch nicht beantwortet */
  value: boolean | undefined
  onChange: (value: boolean) => void
  className?: string
}) {
  const [catalogOpen, setCatalogOpen] = useState(false)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="min-w-0 flex-1 text-small font-bold">{label}</span>
      <button
        type="button"
        onClick={() => setCatalogOpen(true)}
        aria-label="Was ist ein schwerer Fehler?"
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-navy-600 focus-visible:outline-2 focus-visible:outline-accent dark:text-navy-300"
      >
        <Icon name="info-circle" className="size-5" />
      </button>
      <span role="group" aria-label={label} className="flex shrink-0 gap-1.5">
        {OPTIONS.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`h-11 min-w-14 rounded-xl border-2 px-3 text-small font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 ${
                selected
                  ? option.selected
                  : 'border-navy-200 bg-white text-navy-700 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-200'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </span>
      <SevereCatalogDialog open={catalogOpen} onClose={() => setCatalogOpen(false)} />
    </div>
  )
}
