import { creditsFor, OSM_ATTRIBUTION, OSM_COPYRIGHT_URL, tileSource } from '../map/tileSource'

/** Quellenangabe unten rechts; die OSM-Nennung ist Pflicht (ODbL) und verlinkt auf die Lizenz */
export function MapAttribution({ dark }: { dark: boolean }) {
  return (
    <p className={`absolute right-3 bottom-2 text-xs ${dark ? 'text-navy-300' : 'text-navy-500'}`}>
      {creditsFor(tileSource).map((credit, i) => (
        <span key={credit}>
          {i > 0 && ' '}
          {credit === OSM_ATTRIBUTION ? (
            <a href={OSM_COPYRIGHT_URL} target="_blank" rel="noreferrer" className="hover:underline">
              {credit}
            </a>
          ) : (
            credit
          )}
        </span>
      ))}
    </p>
  )
}
