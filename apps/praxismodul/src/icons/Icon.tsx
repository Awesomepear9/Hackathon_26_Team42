import { FILLED_ICONS, iconPaths, OUTLINE_ICONS, type FilledIconName, type OutlineIconName } from './tabler'

type IconProps =
  | { name: OutlineIconName; filled?: false; className?: string; strokeWidth?: number }
  | { name: FilledIconName; filled: true; className?: string; strokeWidth?: never }

/** Tabler-Icon; Größe und Farbe über Tailwind (size-*, text-*), dekorativ (aria-hidden) */
export function Icon(props: IconProps) {
  const paths = iconPaths(props.filled ? FILLED_ICONS[props.name] : OUTLINE_ICONS[props.name])
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={props.className ?? 'size-6'}
      fill={props.filled ? 'currentColor' : 'none'}
      stroke={props.filled ? 'none' : 'currentColor'}
      strokeWidth={props.strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  )
}
