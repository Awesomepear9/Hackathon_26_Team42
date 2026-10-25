import { useEffect } from 'react'
import type { ColorScheme } from '../map/palette'
import { directionName, type LngLat } from '../map/geo'
import { useLivePosition, type LiveStatus } from '../map/useLivePosition'
import { SituationMap } from './SituationMap'

export interface LiveSituationMapProps {
  /** Ausschnitt, solange kein Standort vorliegt (Freigabe ausstehend, abgelehnt, kein GPS) */
  fallbackCenter: LngLat
  zoom?: number
  /** true: Karte dreht mit, Fahrtrichtung zeigt nach oben. false: Norden oben. */
  headingUp?: boolean
  showLabels?: boolean
  /** Grundbeschreibung; Fahrtrichtung bzw. fehlender Standort werden angehängt */
  ariaLabel?: string
  colorScheme?: ColorScheme | 'auto'
  className?: string
  /** Für eigene Hinweise in der App, z. B. wenn die Standortfreigabe fehlt */
  onStatusChange?: (status: LiveStatus) => void
}

/**
 * Zeigt die Straßensituation am aktuellen Standort. Das eigene Fahrzeug folgt der GPS-Position,
 * die Karte bleibt darauf zentriert. Nicht interaktiv: Verschieben würde sofort zurückspringen.
 */
export function LiveSituationMap({
  fallbackCenter,
  zoom = 18,
  headingUp = false,
  showLabels = false,
  ariaLabel = 'Aktuelle Verkehrssituation von oben.',
  colorScheme = 'auto',
  className = '',
  onStatusChange,
}: LiveSituationMapProps) {
  const { status, position } = useLivePosition()

  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  const center: LngLat = position ? [position.lng, position.lat] : fallbackCenter
  const label = position
    ? `${ariaLabel} Eigenes Fahrzeug in der Mitte, Fahrtrichtung ${directionName(position.bearing)}.`
    : `${ariaLabel} Aktueller Standort nicht verfügbar.`

  return (
    <SituationMap
      center={center}
      zoom={zoom}
      bearing={headingUp && position ? position.bearing : 0}
      vehicles={
        position
          ? [{ id: 'self', type: 'self', lng: position.lng, lat: position.lat, bearing: position.bearing, arrow: true }]
          : []
      }
      showLabels={showLabels}
      ariaLabel={label}
      colorScheme={colorScheme}
      className={className}
    />
  )
}
