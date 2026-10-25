import { Icon } from '../../icons/Icon'
import type { OutlineIconName } from '../../icons/tabler'
import type { Answer } from '../../learning/evaluation'

const OPTIONS: { answer: Answer; icon: OutlineIconName; label: string; selected: string }[] = [
  { answer: 'done', icon: 'check', label: 'gemacht', selected: 'border-green-500 bg-green-500 text-navy-900' },
  { answer: 'missed', icon: 'x', label: 'nicht gemacht', selected: 'border-red-500 bg-red-500 text-navy-900' },
  {
    answer: 'unseen',
    icon: 'question-mark',
    label: 'nicht gesehen',
    selected: 'border-amber-500 bg-amber-500 text-navy-900',
  },
]

/** Prüfpunkt mit drei Antworten; erneutes Tippen auf die gewählte Antwort hebt sie auf */
export function ChecklistRow({
  question,
  answer,
  onAnswer,
}: {
  question: string
  answer?: Answer
  onAnswer: (answer: Answer | undefined) => void
}) {
  return (
    <li className="flex items-center gap-3 border-b border-cyan-200 py-1.5 last:border-b-0 dark:border-cyan-900">
      <span className="min-w-0 flex-1 text-small font-semibold text-navy-900 dark:text-navy-50">{question}</span>
      <span role="group" aria-label={question} className="flex shrink-0 gap-1.5">
        {OPTIONS.map((option) => {
          const selected = option.answer === answer
          return (
            <button
              key={option.answer}
              type="button"
              aria-pressed={selected}
              aria-label={option.label}
              onClick={() => onAnswer(selected ? undefined : option.answer)}
              className={`flex size-11 items-center justify-center rounded-xl border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 ${
                selected
                  ? option.selected
                  : 'border-navy-200 bg-white text-navy-400 hover:border-navy-300 dark:border-navy-600 dark:hover:border-navy-400 dark:bg-navy-900 dark:text-navy-300'
              }`}
            >
              <Icon name={option.icon} className="size-5" strokeWidth={2.5} />
            </button>
          )
        })}
      </span>
    </li>
  )
}

export function ChecklistLegend() {
  return (
    <p className="mt-1.5 flex flex-wrap justify-between gap-x-3 gap-y-1 text-caption tracking-normal text-navy-700 dark:text-navy-200">
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2 rounded-full bg-green-500" /> gemacht
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2 rounded-full bg-red-500" /> nicht gemacht
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2 rounded-full bg-amber-500" /> nicht gesehen
      </span>
    </p>
  )
}
