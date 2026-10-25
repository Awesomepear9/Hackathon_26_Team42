import { SPEED_TOLERANCE_KMH, type SpeedSample } from '../../learning/evaluation'

// Tempo über die Strecke: erlaubt (Treppenlinie), gefahren, Überschreitungen rot

const WIDTH = 320
const HEIGHT = 150
const PAD = { left: 30, right: 6, top: 10, bottom: 26 }

const plotWidth = WIDTH - PAD.left - PAD.right
const plotHeight = HEIGHT - PAD.top - PAD.bottom

function niceKmTicks(maxKm: number) {
  const step = maxKm > 3 ? 1 : maxKm > 1.5 ? 0.5 : 0.25
  const ticks: number[] = []
  for (let km = 0; km <= maxKm + 1e-9; km += step) ticks.push(Math.round(km * 100) / 100)
  return ticks.length > 6 ? ticks.filter((_, i) => i % 2 === 0) : ticks
}

export function SpeedChart({ samples }: { samples: SpeedSample[] }) {
  if (samples.length < 2) return null
  const maxKm = samples[samples.length - 1].km
  const limits = [...new Set(samples.map((s) => s.allowed))].sort((a, b) => a - b)
  const maxSpeed = Math.max(...limits, ...samples.map((s) => s.actual)) * 1.1
  const x = (km: number) => PAD.left + (km / maxKm) * plotWidth
  const y = (kmh: number) => PAD.top + plotHeight - (kmh / maxSpeed) * plotHeight

  const allowedPath = samples
    .map((s, i) => {
      const previous = samples[i - 1]
      const step = previous && previous.allowed !== s.allowed ? `L${x(s.km)} ${y(previous.allowed)} ` : ''
      return `${i === 0 ? 'M' : `${step}L`}${x(s.km)} ${y(s.allowed)}`
    })
    .join(' ')
  const actualPath = samples.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.km)} ${y(s.actual)}`).join(' ')
  const over = samples
    .map((s, i) => ({ s, previous: samples[i - 1] }))
    .filter(({ s, previous }) => previous && s.actual > s.allowed + SPEED_TOLERANCE_KMH)
    .map(({ s, previous }) => `M${x(previous.km)} ${y(previous.actual)} L${x(s.km)} ${y(s.actual)}`)
    .join(' ')
  const kmTicks = niceKmTicks(maxKm)

  return (
    <figure>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Tempo über die Strecke">
        {limits.map((limit) => (
          <g key={limit}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(limit)}
              y2={y(limit)}
              className="stroke-navy-100 dark:stroke-navy-700"
            />
            <text x={PAD.left - 6} y={y(limit)} dy="0.35em" textAnchor="end" className="fill-navy-500 text-caption">
              {limit}
            </text>
          </g>
        ))}
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={PAD.top + plotHeight}
          y2={PAD.top + plotHeight}
          className="stroke-navy-200 dark:stroke-navy-600"
        />
        {kmTicks.map((km) => (
          <text key={km} x={x(km)} y={HEIGHT - 6} textAnchor="middle" className="fill-navy-500 text-caption">
            {km.toLocaleString('de-DE')}
            {km === kmTicks[kmTicks.length - 1] ? ' km' : ''}
          </text>
        ))}
        <path d={allowedPath} fill="none" strokeWidth="2.5" className="stroke-navy-900 dark:stroke-navy-50" />
        <path d={actualPath} fill="none" strokeWidth="2.5" strokeLinejoin="round" className="stroke-cyan-500" />
        <path d={over} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-red-500" />
      </svg>
      <figcaption className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-small text-navy-700 dark:text-navy-200">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1 w-5 rounded-full bg-navy-900 dark:bg-navy-50" /> Erlaubt
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1 w-5 rounded-full bg-cyan-500" /> Dein Tempo
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1 w-5 rounded-full bg-red-500" /> Über dem Limit
        </span>
      </figcaption>
    </figure>
  )
}
