import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigation } from '../../app/navigation'
import { SituationMap, type MapSymbol } from '../../components/SituationMap'
import { routeById, type Route, type RouteEventKind } from '../../data/routes'
import { useElementSize } from '../../hooks/useElementSize'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { distanceMeters, type LngLat, type Point } from '../../map/geo'
import { capWaits, remainingWait } from '../../map/replayTrack'
import { useNavCamera } from '../../map/useNavCamera'
import { useRouteReplay } from '../../map/useRouteReplay'
import { clearActiveDrive, readActiveDrive, saveActiveDrive } from '../../learning/activeDrive'
import { cumulativeDistances, drivePoints } from '../../learning/drivePoints'
import { addDrive } from '../../learning/drives'
import type { Answer, Answers } from '../../learning/evaluation'
import { levelById, type RouteSlot } from '../../learning/levels'
import type { GeneralRating } from '../../learning/generalBehavior'
import { pointMarkerHtml, POINT_MARKER_SIZE } from '../../signs/pointMarker'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { ClockPill, TopBar } from '../../ui/headers'
import { SectionLabel } from '../../ui/primitives'
import { distanceLabel } from '../../ui/format'
import { CurrentPointCard, PointListItem } from './PointCards'
import { ReplayControls, type Speed } from './ReplayControls'
import { GeneralDialog } from './GeneralDialog'

/** Zeitraffer zu Beginn: halbe echte Fahrzeit; zum Bewerten lässt sich die Fahrt anhalten */
const DEFAULT_SPEED: Speed = 2
/** mit „Bewegung reduzieren“ in Echtzeit */
const REDUCED_MOTION_SPEED: Speed = 1
/** so weit hinter einem Punkt bleibt er noch der aktuelle (Zeit zum Bewerten) */
const KEEP_AFTER_PASSING_M = 40
const INITIAL_MAP_SIZE = { width: 412, height: 200 }
/** simulierte Wartezeiten (Ampel bis 35 s) beim Abspielen auf so viele Sekunden kürzen */
const MAX_WAIT_S = 8
/** so nah muss ein Ereignis mit Wartezeit am Stand liegen, um als Grund zu gelten */
const WAIT_REASON_M = 30
const WAIT_REASON: Partial<Record<RouteEventKind, string>> = {
  'ampel-rot': 'Rote Ampel',
  zebrastreifen: 'Fußgänger queren',
  'rechts-vor-links': 'Vorfahrt von rechts',
  'spielstrasse-ende': 'Ende Spielstraße',
  stopp: 'Stoppschild',
  'vorfahrt-achten': 'Vorfahrt achten',
  bahnuebergang: 'Bahnübergang',
}

/** Grund für einen Halt an dieser Stelle (nächstes Ereignis mit Wartezeit) */
function waitReason(route: Route, at: Point) {
  const event = route.events
    .filter((e) => e.waitS !== undefined && distanceMeters(e, at) < WAIT_REASON_M)
    .sort((a, b) => distanceMeters(a, at) - distanceMeters(b, at))[0]
  return (event && WAIT_REASON[event.kind]) ?? 'Warten'
}

export function DriveScreen({ levelId, slot }: { levelId: number; slot: RouteSlot }) {
  const { navigate, back } = useNavigation()
  const level = levelById(levelId)
  const routeId = level.routes.find((r) => r.slot === slot)?.routeId ?? level.routes[0].routeId
  const route = routeById(routeId)
  const points = useMemo(() => drivePoints(route, level), [route, level])
  const along = useMemo(() => cumulativeDistances(route), [route])
  const routeLine = useMemo(() => route.track.map(([lng, lat]): LngLat => [lng, lat]), [route])

  // Nach dem Neuladen an der gespeicherten Stelle weiter, zunächst angehalten zum Orientieren
  const [resumed] = useState(() => readActiveDrive(levelId, slot, routeId))
  const [playing, setPlaying] = useState(!resumed)
  const reducedMotion = useReducedMotion()
  const [speed, setSpeed] = useState<Speed>(reducedMotion ? REDUCED_MOTION_SPEED : DEFAULT_SPEED)
  // Wartezeiten gekürzt, damit die Simulation nicht minutenlang steht; Indizes bleiben wie im Original
  const replayTrack = useMemo(() => capWaits(route.track, MAX_WAIT_S), [route])
  const replay = useRouteReplay(replayTrack, { speed, playing, loop: false, startAt: resumed?.t })
  const mapBoxRef = useRef<HTMLDivElement>(null)
  const size = useElementSize(mapBoxRef, INITIAL_MAP_SIZE)
  const camera = useNavCamera({
    view: 'perspective', // 3D wie im Navi: Neigung 60°, Fahrzeug im unteren Drittel
    position: replay,
    heading: replay.bearing,
    size,
    route: routeLine,
    resetKey: route.id,
  })

  const [answers, setAnswers] = useState<Answers>(() => resumed?.answers ?? {})
  const [severeAnswers, setSevereAnswers] = useState<Record<string, boolean>>(() => resumed?.severeAnswers ?? {})
  const severe = Object.keys(severeAnswers).filter((id) => severeAnswers[id])
  // Startwert des simulierten Fahrverhaltens: schon während der Fahrt fest, damit das Tempo-Kriterium
  // im Abschluss-Dialog zur gespeicherten Fahrt passt
  const [driverSeed] = useState(() => Math.floor(Math.random() * 1000))
  const [chosen, setChosen] = useState<{ pointId: string; whileAuto: number }>()
  const [resumeNotice, setResumeNotice] = useState(resumed !== undefined)

  // Fortschritt sichern: bei jeder Antwort und einmal je Sekunde Fahrzeit
  const savedT = Math.floor(replay.t)
  useEffect(() => {
    saveActiveDrive({ levelId, slot, routeId, t: savedT, answers, severeAnswers })
  }, [levelId, slot, routeId, savedT, answers, severeAnswers])

  // Gefahrene Strecke bis zur aktuellen Position
  const [trackLng, trackLat] = route.track[replay.index]
  const driven = along[replay.index] + distanceMeters({ lng: trackLng, lat: trackLat }, replay)

  // Aktueller Punkt: der nächste vor dem Fahrzeug (bzw. gerade passiert); eine Auswahl gilt,
  // bis die Fahrt den nächsten Punkt erreicht
  const autoIndex = Math.max(
    0,
    points.findIndex((p) => p.along > driven - KEEP_AFTER_PASSING_M),
  )
  const reachedAll = points.every((p) => p.along <= driven - KEEP_AFTER_PASSING_M)
  const auto = reachedAll ? points.length - 1 : autoIndex
  const chosenIndex = chosen && chosen.whileAuto === auto ? points.findIndex((p) => p.id === chosen.pointId) : -1
  const current = points[chosenIndex >= 0 ? chosenIndex : auto]
  const next = points.find((p) => p.along > driven)

  // Wechsel des aktuellen Punkts vorlesen; der Text bleibt bis zum nächsten Wechsel stehen,
  // damit die laufende Entfernung keine neuen Ansagen auslöst
  const [announcement, setAnnouncement] = useState<{ pointId?: string; text: string }>({ text: '' })
  if (current && announcement.pointId !== current.id) {
    const distance = distanceLabel(current.along - driven)
    setAnnouncement({
      pointId: current.id,
      text: `Punkt ${current.number} von ${points.length}: ${current.type.title}, ${/m$/.test(distance) ? `in ${distance}` : distance}`,
    })
  }

  const answer = (pointId: string, checkId: string, value: Answer | undefined) =>
    setAnswers((a) => {
      const others = Object.entries(a[pointId] ?? {}).filter(([id]) => id !== checkId)
      return { ...a, [pointId]: Object.fromEntries(value ? [...others, [checkId, value]] : others) }
    })

  const answerSevere = (pointId: string, value: boolean) => setSevereAnswers((a) => ({ ...a, [pointId]: value }))

  // Zurück in der App bricht die Fahrt ab; mit Bewertungen erst nach Rückfrage
  const [confirmingLeave, setConfirmingLeave] = useState(false)
  const rated = severe.length > 0 || Object.values(answers).some((checks) => Object.keys(checks).length > 0)
  const leave = () => {
    setPlaying(false) // bis zum Screenwechsel nichts mehr sichern
    clearActiveDrive()
    back()
  }

  // Beenden fragt zuerst das allgemeine Fahrverhalten ab, dann wird gespeichert und ausgewertet
  const [generalOpen, setGeneralOpen] = useState(false)
  const askGeneral = () => {
    setPlaying(false)
    setGeneralOpen(true)
  }

  const finish = (general: GeneralRating) => {
    clearActiveDrive()
    const id = `fahrt-${Date.now()}`
    addDrive({
      id,
      date: new Date().toISOString(),
      levelId,
      slot,
      routeId,
      answers,
      severe,
      general,
      driverSeed,
    })
    navigate({ name: 'result', driveId: id }, { replace: true })
  }

  const symbols = points.map((p): MapSymbol => ({
    id: p.id,
    lng: p.event.lng,
    lat: p.event.lat,
    size: POINT_MARKER_SIZE,
    html: pointMarkerHtml(p.sign, p.number, p.id === current?.id),
  }))
  // Im Stand den Grund und die restliche Wartezeit (in echten Sekunden beim gewählten Tempo) zeigen
  const wait = replay.finished ? undefined : remainingWait(replayTrack, replay.index, replay.t)
  const nextLabel = wait
    ? `${waitReason(route, replay)} · noch ${Math.ceil(wait / speed)} s`
    : next
      ? `Nächster Punkt · ${distanceLabel(next.along - driven)}`
      : replay.finished
        ? 'Ziel erreicht'
        : `Ziel · ${distanceLabel(along[along.length - 1] - driven)}`

  return (
    <>
      <h1 className="sr-only">
        Fahrt Route {slot} · Level {level.id} {level.title}
      </h1>
      {/* Sichtbare Höhe von <main> (ohne Navigation: Bildschirm minus Abstände): Karte, Steuerung und aktueller Punkt mit Aufgaben ohne Scrollen.
          Die Karte nimmt den freien Platz, mindestens 9rem; reicht die Höhe nicht, scrollt nur die
          Aufgabenkarte. Darunter folgen weitere Punkte und „Fahrt beenden“. */}
      <div className="flex h-[calc(100dvh-2.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-[30rem] flex-col">
        <TopBar centered onBack={() => (rated ? setConfirmingLeave(true) : leave())}>
          <ClockPill />
        </TopBar>
        <GeneralDialog
          open={generalOpen}
          route={route}
          driverSeed={driverSeed}
          onSubmit={finish}
          onCancel={() => setGeneralOpen(false)}
        />
        <ConfirmDialog
          open={confirmingLeave}
          title="Fahrt abbrechen?"
          message="Deine Bewertungen gehen verloren."
          confirmLabel="Fahrt abbrechen"
          cancelLabel="Weiterfahren"
          onConfirm={leave}
          onCancel={() => setConfirmingLeave(false)}
        />

        <div ref={mapBoxRef} className="relative mt-3 min-h-36 w-full flex-1">
          {/* absolut statt h-full: Safari löst Prozenthöhen in Flex-Elementen nicht zuverlässig auf */}
          <div className="absolute inset-0">
            <SituationMap
              center={[camera.lng, camera.lat]}
              zoom={camera.zoom}
              bearing={camera.bearing}
              pitch={camera.pitch}
              route={routeLine.slice(replay.index)}
              symbols={symbols}
              vehicles={[
                {
                  id: 'self',
                  type: 'self',
                  icon: 'navigation',
                  lng: replay.lng,
                  lat: replay.lat,
                  bearing: replay.bearing,
                },
              ]}
              ariaLabel={`Fahrt Route ${slot}, Level ${level.id} ${level.title}. ${nextLabel}.`}
              className="h-full w-full"
            />
          </div>
          <p className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-small font-semibold shadow-card dark:bg-navy-900">
            <span aria-hidden="true" className={`size-3 rounded-full ${wait ? 'bg-amber-500' : 'bg-cyan-500'}`} />
            {nextLabel}
          </p>
          {resumeNotice && !replay.finished && (
            <p
              role="status"
              className="absolute inset-x-3 top-3 rounded-2xl bg-white px-3 py-2 text-small shadow-card dark:bg-navy-900"
            >
              Deine Fahrt geht hier weiter. Tippe auf „Weiter“, wenn ihr bereit seid.
            </p>
          )}
        </div>

        <ReplayControls
          playing={playing}
          finished={replay.finished}
          speed={speed}
          onPlayingChange={(value) => {
            setPlaying(value)
            setResumeNotice(false)
          }}
          onSpeedChange={setSpeed}
        />
        {replay.finished && (
          <button
            type="button"
            onClick={askGeneral}
            className="mt-3 w-full shrink-0 rounded-2xl bg-cyan-500 py-3 text-body font-bold text-navy-900 hover:bg-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
          >
            Fahrt auswerten
          </button>
        )}

        <p aria-live="polite" className="sr-only">
          {announcement.text}
        </p>
        {current ? (
          <div className="mt-3 min-h-0 overflow-y-auto rounded-3xl">
            <CurrentPointCard
              point={current}
              total={points.length}
              distance={current.along - driven}
              answers={answers[current.id] ?? {}}
              onAnswer={(checkId, value) => answer(current.id, checkId, value)}
              severe={severeAnswers[current.id]}
              onSevereChange={(value) => answerSevere(current.id, value)}
            />
          </div>
        ) : (
          <p className="mt-3 shrink-0 rounded-3xl bg-white p-4 text-small shadow-card dark:bg-navy-900">
            Auf dieser Route gibt es keine Punkte für Level {level.id}.
          </p>
        )}
      </div>

      {points.length > 1 && (
        <>
          <SectionLabel className="mt-5">Weitere Punkte</SectionLabel>
          <ul className="mt-2 space-y-2">
            {points
              .filter((p) => p.id !== current?.id)
              .map((p) => (
                <PointListItem
                  key={p.id}
                  point={p}
                  passed={p.along <= driven - KEEP_AFTER_PASSING_M}
                  onSelect={() => setChosen({ pointId: p.id, whileAuto: auto })}
                />
              ))}
          </ul>
        </>
      )}

      {!replay.finished && (
        <button
          type="button"
          onClick={askGeneral}
          className="mt-5 w-full rounded-2xl bg-white py-3 text-body font-bold text-navy-900 ring-2 ring-cyan-500 hover:bg-cyan-100 dark:hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 dark:bg-navy-900 dark:text-navy-50"
        >
          Fahrt beenden
        </button>
      )}
    </>
  )
}
