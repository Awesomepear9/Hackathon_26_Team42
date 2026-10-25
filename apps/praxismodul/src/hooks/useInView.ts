import { useEffect, useState, type RefObject } from 'react'

/** true, solange das Element im sichtbaren Bereich ist (IntersectionObserver) */
export function useInView(ref: RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return inView
}
