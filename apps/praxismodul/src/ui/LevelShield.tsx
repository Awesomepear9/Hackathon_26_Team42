import { Icon } from '../icons/Icon'

/** Schild-Abzeichen mit Levelnummer: grün = abgeschlossen, cyan = aktiv */
export function LevelShield({ number, done, size = 'md' }: { number: number; done: boolean; size?: 'md' | 'lg' }) {
  const large = size === 'lg'
  return (
    <span
      aria-hidden="true"
      className={`relative flex shrink-0 items-center justify-center ${large ? 'size-16' : 'size-10'}`}
    >
      <Icon
        name="shield"
        filled
        className={`absolute inset-0 size-full ${done ? 'text-green-600' : large ? 'text-white' : 'text-cyan-500'}`}
      />
      <Icon
        name="shield"
        filled
        className={`absolute ${large ? 'inset-1.5 size-13' : 'inset-1 size-8'} ${done ? 'text-green-500' : 'text-cyan-400'}`}
      />
      <span
        className={`relative font-extrabold ${large ? 'text-h2' : 'text-small'} ${done ? 'text-white' : 'text-navy-900'}`}
      >
        {number}
      </span>
    </span>
  )
}
