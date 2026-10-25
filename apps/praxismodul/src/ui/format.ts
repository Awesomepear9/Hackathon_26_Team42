// Zahlen und Entfernungen im deutschen Format

const decimal = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const integer = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })

/** Note mit einer Nachkommastelle: 7,5 */
export const formatScore = (score: number) => decimal.format(score)

/** Kilometer: unter 100 mit einer Nachkommastelle, darüber ganzzahlig */
export const formatKm = (km: number) => (km < 100 ? decimal.format(km) : integer.format(km))

const PASSED_M = 30

/** Entfernung zum Punkt als Text: „150 m“, „1,2 km“, „jetzt“, „vorbei“ */
export function distanceLabel(meters: number) {
  if (meters < -PASSED_M) return 'vorbei'
  if (meters <= PASSED_M) return 'jetzt'
  if (meters >= 1000) return `${(meters / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} km`
  return `${Math.round(meters / 10) * 10} m`
}
