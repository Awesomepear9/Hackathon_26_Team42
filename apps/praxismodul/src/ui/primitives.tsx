import type { ReactNode } from 'react'
import { Icon } from '../icons/Icon'
import { formatScore } from './format'

// Kleine Bausteine aus den App-Entwürfen (Karten, Abschnittstitel, Chips, Balken, Sterne).

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-3xl bg-white shadow-card dark:bg-navy-900 ${className}`}>{children}</section>
}

/** Versal-Überschrift mit Sperrung, z. B. „DEINE FAHRTEN“ */
export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-caption uppercase text-navy-500 dark:text-navy-300 ${className}`}>{children}</h2>
}

type Tone = 'cyan' | 'green' | 'amber' | 'red' | 'white'

const CHIP_TONE: Record<Tone, string> = {
  cyan: 'bg-cyan-100 text-navy-900 dark:bg-cyan-950 dark:text-cyan-100',
  green: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  red: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200',
  white: 'bg-white text-navy-900 dark:bg-navy-950 dark:text-navy-50',
}

export function Chip({
  tone = 'cyan',
  children,
  className = '',
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-small font-semibold ${CHIP_TONE[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

const DOT_TONE = { green: 'bg-green-500', amber: 'bg-amber-500', red: 'bg-red-500', cyan: 'bg-cyan-500' }

export function Dot({ tone }: { tone: keyof typeof DOT_TONE }) {
  return <span aria-hidden="true" className={`inline-block size-2.5 shrink-0 rounded-full ${DOT_TONE[tone]}`} />
}

export function ProgressBar({
  value,
  label,
  track = 'bg-navy-100 dark:bg-navy-700',
  className = 'h-2',
}: {
  /** 0 … 1 */
  value: number
  label: string
  track?: string
  className?: string
}) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`overflow-hidden rounded-full ${track} ${className}`}
    >
      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${percent}%` }} />
    </div>
  )
}

/** Sterne-Bewertung mit halben Sternen; leere Sterne blass */
export function StarRating({
  score,
  max = 10,
  className = 'size-7',
  align = 'center',
  emptyClassName = 'text-cyan-200 dark:text-cyan-900',
}: {
  score: number
  max?: number
  className?: string
  align?: 'center' | 'start'
  /** Farbe der leeren Sterne, z. B. für dunkle Flächen */
  emptyClassName?: string
}) {
  return (
    <div
      className={`flex gap-0.5 ${align === 'center' ? 'justify-center' : 'justify-start'}`}
      role="img"
      aria-label={`${formatScore(score)} von ${max} Sternen`}
    >
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.max(0, Math.min(1, score - i))
        return (
          <span key={i} className={`relative ${className}`}>
            <Icon name="star" filled className={`absolute inset-0 size-full ${emptyClassName}`} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Icon name="star" filled className={`${className} text-amber-500`} />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
