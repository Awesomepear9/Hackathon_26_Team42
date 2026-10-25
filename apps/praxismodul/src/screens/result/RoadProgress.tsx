import { Icon } from '../../icons/Icon'

// Geschwungene Straße als Fortschrittsanzeige („Dein Weg zu 1.000 km“)
type Point = [number, number]
type Cubic = [Point, Point, Point, Point]

const WIDTH = 320
const HEIGHT = 120
const ROAD: Cubic[] = [
  [
    [22, 88],
    [70, 88],
    [96, 40],
    [150, 44],
  ],
  [
    [150, 44],
    [210, 48],
    [228, 104],
    [298, 52],
  ],
]
const PATH = `M${ROAD[0][0].join(' ')} ${ROAD.map((c) => `C${c[1].join(' ')} ${c[2].join(' ')} ${c[3].join(' ')}`).join(' ')}`

function bezier([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]
}

// Punkte entlang der Straße mit kumulierter Länge, um den Pin bei einem Anteil zu platzieren
const SAMPLES = ROAD.flatMap((curve, i) =>
  Array.from({ length: 60 }, (_, k) => bezier(curve, (k + (i > 0 ? 1 : 0)) / 60)),
)
const LENGTHS = SAMPLES.reduce<number[]>(
  (acc, p, i) => [...acc, i === 0 ? 0 : acc[i - 1] + Math.hypot(p[0] - SAMPLES[i - 1][0], p[1] - SAMPLES[i - 1][1])],
  [],
)

function pointAt(share: number): Point {
  const target = share * LENGTHS[LENGTHS.length - 1]
  const i = Math.max(
    0,
    LENGTHS.findIndex((l) => l >= target),
  )
  return SAMPLES[i]
}

export function RoadProgress({ share }: { share: number }) {
  const clamped = Math.max(0, Math.min(1, share))
  const [pinX, pinY] = pointAt(clamped)
  const end = ROAD[1][3]
  return (
    <div className="relative" aria-hidden="true">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        <path
          d={PATH}
          fill="none"
          strokeLinecap="round"
          strokeWidth="26"
          className="stroke-navy-100 dark:stroke-navy-700"
        />
        <path
          d={PATH}
          fill="none"
          strokeLinecap="round"
          strokeWidth="26"
          pathLength={1}
          strokeDasharray={`${clamped} 1`}
          className="stroke-cyan-500"
        />
        <path d={PATH} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="7 7" strokeLinecap="round" />
        <circle cx={ROAD[0][0][0]} cy={ROAD[0][0][1]} r="5" className="fill-navy-900" />
      </svg>
      {/* Pin und Flagge als HTML, damit sie über der Straße stehen und scharf bleiben */}
      <span
        className="absolute -translate-x-1/2 -translate-y-full text-navy-900 dark:text-navy-50"
        style={{ left: `${(pinX / WIDTH) * 100}%`, top: `${(pinY / HEIGHT) * 100}%` }}
      >
        <Icon name="map-pin" filled className="size-9 drop-shadow-sm" />
      </span>
      <span
        className="absolute -translate-y-full text-navy-900 dark:text-navy-50"
        style={{ left: `${((end[0] - 4) / WIDTH) * 100}%`, top: `${((end[1] - 4) / HEIGHT) * 100}%` }}
      >
        <Icon name="flag" filled className="size-8" />
      </span>
    </div>
  )
}
