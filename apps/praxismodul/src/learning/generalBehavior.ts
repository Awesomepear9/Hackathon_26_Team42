// Allgemeine Fahrverhaltensbewertung: einmal je Fahrt, getrennt von den Level-Checklisten
// (Katalog „Logik_Bewertung_NEU“, Abschnitt 3). Je Kriterium −1 bei Nichterfüllung, eine eigene
// Schwerfehler-Abfrage, dazu der Gesamteindruck in 1–5 Sternen ohne Fehlerwert.
import { parseAnswers } from './driveStorage'
import type { Answer } from './evaluation'

export interface GeneralCriterion {
  id: string
  area: string
  question: string
  /** Übungsauftrag in der Auswertung */
  practice: string
  /** bewertet die App selbst (Tempo-Regel), nicht die Begleitperson */
  auto?: boolean
}

export const SPEED_CRITERION = 'geschwindigkeit'

export const GENERAL_CRITERIA: GeneralCriterion[] = [
  {
    id: 'spur',
    area: 'Fahrzeugpositionierung',
    question: 'Spurhaltung und Fahrzeugpositionierung',
    practice: 'Spur halten',
  },
  {
    id: 'einordnen',
    area: 'Fahrzeugpositionierung',
    question: 'Korrektes Einordnen',
    practice: 'Rechtzeitig richtig einordnen',
  },
  {
    id: 'blick',
    area: 'Verkehrsbeobachtung',
    question: 'Spiegel- und Schulterblick',
    practice: 'Spiegel- und Schulterblick',
  },
  {
    id: 'achten',
    area: 'Verkehrsbeobachtung',
    question: 'Auf andere Verkehrsteilnehmer achten',
    practice: 'Auf andere achten',
  },
  {
    id: 'abstand-vorne',
    area: 'Abstände',
    question: 'Sicherheitsabstand nach vorne',
    practice: 'Sicherheitsabstand halten',
  },
  { id: 'abstand-seite', area: 'Abstände', question: 'Ausreichender Seitenabstand', practice: 'Seitenabstand halten' },
  {
    id: SPEED_CRITERION,
    area: 'Geschwindigkeit',
    question: 'Geschwindigkeit gemäß App-Bewertung',
    practice: 'Tempolimit einhalten',
    auto: true,
  },
]

/** Schwerfehler-Katalog (Abschnitt 4): Hilfe bei jeder Schwerfehler-Abfrage */
export const SEVERE_CATALOG: { title: string; trigger: string }[] = [
  { title: 'Vorfahrt genommen', trigger: 'Vorfahrt grob missachtet' },
  { title: 'Personen- oder Sachschaden', trigger: 'Schaden verursacht' },
  { title: 'Gefährdung', trigger: 'Beinaheunfall oder konkrete Gefährdung' },
  { title: 'Eingriff der Begleitperson', trigger: 'Ins Lenkrad gegriffen oder „STOPP“ gerufen' },
  { title: 'Geschwindigkeitsüberschreitung', trigger: 'Ab 5 km/h über dem erlaubten Limit gemäß App-Regel' },
  { title: 'Mindestabstand deutlich unterschritten', trigger: 'Erhebliche Unterschreitung des Sicherheitsabstands' },
]

export const STARS_MAX = 5

export interface GeneralRating {
  /** Antworten je Kriterium; das Tempo-Kriterium setzt die App */
  answers: Record<string, Answer>
  /** Schwerfehler-Abfrage der allgemeinen Bewertung */
  severe: boolean
  /** Gesamteindruck 1–5 Sterne, ohne Fehlerwert */
  stars?: number
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Gespeicherte Bewertung prüfen; undefined bei Fahrten von vor ihrer Einführung */
export function parseGeneral(value: unknown): GeneralRating | undefined {
  if (!isObject(value)) return undefined
  const known = new Set(GENERAL_CRITERIA.map((c) => c.id))
  const answers = Object.fromEntries(
    Object.entries(parseAnswers({ general: value.answers }).general ?? {}).filter(([id]) => known.has(id)),
  )
  const { stars } = value
  return {
    answers,
    severe: value.severe === true,
    stars:
      Number.isInteger(stars) && (stars as number) >= 1 && (stars as number) <= STARS_MAX
        ? (stars as number)
        : undefined,
  }
}
