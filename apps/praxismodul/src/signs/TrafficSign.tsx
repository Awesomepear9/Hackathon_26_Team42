import { Icon } from '../icons/Icon'
import { signUrl, type TrafficSignId } from './trafficSigns'

/**
 * Amtliches Verkehrszeichen als Bild (dekorativ, die Bedeutung steht im Text daneben).
 * Ohne Zeichen (z. B. Einfädeln auf eine Bundesstraße) steht ein neutrales Icon – kein Schild.
 */
export function TrafficSign({ sign, className = 'size-12' }: { sign?: TrafficSignId; className?: string }) {
  if (!sign) {
    return (
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 ${className}`}
      >
        <Icon name="road" className="size-3/5" />
      </span>
    )
  }
  return <img src={signUrl(sign)} alt="" aria-hidden="true" className={`shrink-0 object-contain ${className}`} />
}
