import { useEffect, useState } from 'react'
import { routeById } from '../data/routes'
import { trafficProvider, type TrafficLevel } from './traffic'

/** Verkehrslage je Strecken-id aus der eingestellten Quelle (asynchron) */
export function useTraffic(routeIds: string[]): Record<string, TrafficLevel> {
  const [traffic, setTraffic] = useState<Record<string, TrafficLevel>>({})
  const key = routeIds.join()
  useEffect(() => {
    let cancelled = false
    const ids = key.split(',').filter(Boolean)
    Promise.all(ids.map((id) => trafficProvider.trafficFor(routeById(id)))).then((levels) => {
      if (!cancelled) setTraffic(Object.fromEntries(ids.map((id, i) => [id, levels[i]])))
    })
    return () => {
      cancelled = true
    }
  }, [key])
  return traffic
}
