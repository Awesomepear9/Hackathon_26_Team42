import { useMemo } from 'react'
import { useNavigation } from '../../app/navigation'
import { Icon } from '../../icons/Icon'
import { KM_GOAL, useDrives } from '../../learning/drives'
import { PASSING_SCORE } from '../../learning/levels'
import { nextTip, practiceItems, speedProfile, type PracticeItem } from '../../learning/evaluation'
import { formatKm, formatScore } from '../../ui/format'
import { TopBar } from '../../ui/headers'
import { Card, Chip, SectionLabel, StarRating } from '../../ui/primitives'
import { RoadProgress } from './RoadProgress'
import { SpeedChart } from './SpeedChart'

const ANSWER_TEXT: Record<PracticeItem['answer'], string> = {
  severe: 'schwerer Fehler',
  missed: 'nicht gemacht',
  unseen: 'nicht bewertbar',
}
const ANSWER_STYLE: Record<PracticeItem['answer'], { icon: 'alert-triangle' | 'x' | 'question-mark'; tone: string }> = {
  severe: { icon: 'alert-triangle', tone: 'bg-red-500 text-navy-900' },
  missed: { icon: 'x', tone: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300' },
  unseen: { icon: 'question-mark', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' },
}
/** die wichtigsten Übungen; nicht Gemachtes zuerst */
const MAX_PRACTICE = 3

function PracticeRow({ item }: { item: PracticeItem }) {
  const style = ANSWER_STYLE[item.answer]
  return (
    <li className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-card dark:bg-navy-900">
      <span
        aria-hidden="true"
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${style.tone}`}
      >
        <Icon name={style.icon} className="size-5" strokeWidth={2.5} />
      </span>
      <span className="min-w-0">
        <span className="block text-body font-bold">{item.practice}</span>
        <span className="block text-small text-navy-500 dark:text-navy-300">
          {item.pointTitle} · {ANSWER_TEXT[item.answer]}
        </span>
      </span>
    </li>
  )
}

export function DriveResultScreen({ driveId }: { driveId: string }) {
  const { navigate } = useNavigation()
  const drives = useDrives()
  const drive = drives.find((d) => d.id === driveId)
  const profile = useMemo(() => (drive ? speedProfile(drive.route, drive.driverSeed) : undefined), [drive])

  if (!drive || !profile) {
    return (
      <Card className="p-5">
        <p className="text-body">Diese Fahrt gibt es nicht mehr.</p>
        <button
          type="button"
          onClick={() => navigate({ name: 'drives' }, { reset: true })}
          className="mt-3 font-bold text-cyan-800 dark:text-cyan-300"
        >
          Zu den Fahrten
        </button>
      </Card>
    )
  }

  // Kilometer bis einschließlich dieser Fahrt
  const totalKm = drives.filter((d) => d.date <= drive.date).reduce((sum, d) => sum + d.distanceKm, 0)
  const share = totalKm / KM_GOAL
  const practice = practiceItems(drive.points, drive.answers, drive.severe, drive.general).slice(0, MAX_PRACTICE)
  const severeCount = drive.severe.length + (drive.general?.severe ? 1 : 0)
  const tip = nextTip(drive.points, drive.answers)
  const compliance = Math.round(drive.compliance * 100)

  return (
    <>
      <TopBar />
      <section
        aria-labelledby="ergebnis"
        className="mt-4 rounded-3xl border-2 border-cyan-200 bg-cyan-100 px-4 pt-5 pb-6 text-center dark:border-cyan-900 dark:bg-cyan-950"
      >
        <h1 id="ergebnis" className="text-caption uppercase text-navy-700 dark:text-navy-200">
          Fahrt abgeschlossen
        </h1>
        <p className="mt-1 text-navy-900 dark:text-navy-50">
          <span className="text-display font-extrabold">{formatScore(drive.score)}</span>
          <span className="ml-2 text-h3 font-bold text-navy-700 dark:text-navy-200">/ 10</span>
        </p>
        <div className="mt-2">
          <StarRating score={drive.score} />
        </div>
        <p className="mt-3 text-small">
          Level {drive.level.id} · {drive.level.title} · {formatKm(drive.distanceKm)} km
        </p>
        <p className="mt-3 text-body font-bold">
          {drive.passed
            ? `Level ${drive.level.id} bestanden`
            : drive.hasSevere
              ? 'Nicht bestanden: schwerer Fehler'
              : `Nicht bestanden: ab ${formatScore(PASSING_SCORE)} Sternen`}
        </p>
        {/* Zusammensetzung der Note: 50 % Fahrverhalten, 50 % Fahraufgaben (ältere Fahrten nur Fahraufgaben) */}
        <p className="mt-3 flex flex-wrap justify-center gap-2">
          <Chip tone="white">Fahraufgaben {Math.round(drive.pointsShare * 100)} %</Chip>
          {drive.generalShare !== undefined && (
            <Chip tone="white">Fahrverhalten {Math.round(drive.generalShare * 100)} %</Chip>
          )}
          {severeCount > 0 && (
            <Chip tone="red">{severeCount === 1 ? '1 schwerer Fehler' : `${severeCount} schwere Fehler`}</Chip>
          )}
        </p>
        {drive.general?.stars !== undefined && (
          <div className="mt-3 flex items-center justify-center gap-2 text-small">
            Gesamtleistung
            <StarRating score={drive.general.stars} max={5} className="size-5" />
          </div>
        )}
      </section>

      <Card className="mt-4 p-4">
        <div className="flex items-center justify-between">
          <SectionLabel>Dein Weg zu {formatKm(KM_GOAL)} km</SectionLabel>
          <Chip>{Math.round(share * 100)} %</Chip>
        </div>
        <p className="mt-1">
          <span className="text-h1 font-extrabold">{formatKm(totalKm)} km</span>{' '}
          <span className="text-body text-navy-500 dark:text-navy-300">von {formatKm(KM_GOAL)} km</span>
        </p>
        <RoadProgress share={share} />
        <p className="flex justify-between text-small text-navy-700 dark:text-navy-200">
          <span>0 km</span>
          <span>Noch {formatKm(Math.max(0, KM_GOAL - totalKm))} km</span>
        </p>
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-body">
          Du hast dich zu <strong className="font-bold">{compliance} %</strong> an die vorgegebenen
          Geschwindigkeitsbegrenzungen gehalten.
        </p>
        <div className="mt-3">
          <SpeedChart samples={profile.samples} />
        </div>
      </Card>

      <SectionLabel className="mt-6">Hier nochmal üben</SectionLabel>
      {practice.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {practice.map((item) => (
            <PracticeRow key={item.key} item={item} />
          ))}
        </ul>
      ) : (
        <Card className="mt-2 px-4 py-3">
          <p className="text-body">Alles gemacht – stark!</p>
        </Card>
      )}

      {tip && (
        <>
          <SectionLabel className="mt-6">Tipp für nächstes Mal</SectionLabel>
          <Card className="mt-2 flex gap-3 px-4 py-4">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
            >
              <Icon name="bulb" className="size-5" />
            </span>
            <span>
              <span className="block text-body font-bold">{tip.title}</span>
              <span className="block text-small text-navy-700 dark:text-navy-200">{tip.text}</span>
            </span>
          </Card>
        </>
      )}
    </>
  )
}
