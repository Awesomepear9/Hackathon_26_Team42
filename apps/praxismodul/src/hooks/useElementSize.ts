import { useEffect, useState, type RefObject } from 'react'

export interface ElementSize {
  width: number
  height: number
}

/** Aktuelle Größe eines Elements (ResizeObserver); `fallback` gilt bis zur ersten Messung */
export function useElementSize(ref: RefObject<HTMLElement | null>, fallback: ElementSize): ElementSize {
  const [size, setSize] = useState(fallback)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return size
}
