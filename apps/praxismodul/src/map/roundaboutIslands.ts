// Leitet Kreisverkehr-Mittelinseln aus den Straßenlinien ab.
//
// Das OpenMapTiles-Schema überträgt junction=roundabout nicht. Ein Kreisverkehr ist im
// Straßennetz aber immer eine kleine, fast kreisrunde Masche. Deshalb wird das Netz als
// planarer Graph aufgebaut, seine Flächen (Faces) werden umlaufen, und kleine kompakte
// Flächen werden als Mittelinsel ausgegeben. Häuserblöcke fallen über Kompaktheit
// (Quadrat ≈ 0,785) und Größe heraus, Tropfeninseln an Zufahrten über die Kompaktheit.
import { toMeters, type LngLat } from './geo'

export interface RoadLine {
  coordinates: LngLat[]
  roadClass: string
}

export interface IslandOptions {
  /** Mindestfläche in m² */
  minArea?: number
  /** Höchstfläche in m² */
  maxArea?: number
  /** 4πA/U², Kreis = 1 */
  minCompactness?: number
}

interface IslandProperties {
  roadClass: string
}

export type IslandCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.LineString, IslandProperties>

interface GraphNode {
  key: string
  coordinate: LngLat
  x: number
  y: number
  /** nach Winkel sortiert, gegen den Uhrzeigersinn */
  neighbors: GraphNode[]
}

const MAX_FACE_EDGES = 400

const keyOf = ([lng, lat]: LngLat) => `${lng.toFixed(7)},${lat.toFixed(7)}`
const edgeKey = (a: GraphNode, b: GraphNode) => (a.key < b.key ? `${a.key}|${b.key}` : `${b.key}|${a.key}`)
const angle = (from: GraphNode, to: GraphNode) => Math.atan2(to.y - from.y, to.x - from.x)

function buildGraph(lines: RoadLine[]) {
  const referenceLat = lines[0].coordinates[0][1]
  const nodes = new Map<string, GraphNode>()
  const edgeClass = new Map<string, string>()

  const nodeAt = (coordinate: LngLat) => {
    const key = keyOf(coordinate)
    let node = nodes.get(key)
    if (!node) {
      const { x, y } = toMeters({ lng: coordinate[0], lat: coordinate[1] }, referenceLat)
      node = { key, coordinate, x, y, neighbors: [] }
      nodes.set(key, node)
    }
    return node
  }

  for (const { coordinates, roadClass } of lines) {
    for (let i = 0; i < coordinates.length - 1; i++) {
      const a = nodeAt(coordinates[i])
      const b = nodeAt(coordinates[i + 1])
      const key = edgeKey(a, b)
      if (a === b || edgeClass.has(key)) continue // doppelte Kanten aus überlappenden Tiles
      edgeClass.set(key, roadClass)
      a.neighbors.push(b)
      b.neighbors.push(a)
    }
  }
  for (const node of nodes.values()) node.neighbors.sort((p, q) => angle(node, p) - angle(node, q))

  return { nodes, edgeClass }
}

/** Alle geschlossenen Flächen des Graphen; an jedem Knoten in die nächste Kante im Uhrzeigersinn */
function* faces(nodes: Iterable<GraphNode>) {
  const visited = new Set<string>()
  const halfEdge = (from: GraphNode, to: GraphNode) => `${from.key}>${to.key}`
  for (const start of nodes) {
    for (const first of start.neighbors) {
      if (visited.has(halfEdge(start, first))) continue
      const ring: GraphNode[] = []
      let from = start
      let to = first
      for (let steps = 0; steps < MAX_FACE_EDGES; steps++) {
        if (visited.has(halfEdge(from, to))) {
          if (from === start && to === first && ring.length >= 3) yield ring
          break
        }
        visited.add(halfEdge(from, to))
        ring.push(from)
        const around = to.neighbors
        const next = around[(around.indexOf(from) - 1 + around.length) % around.length]
        from = to
        to = next
      }
    }
  }
}

function measure(ring: GraphNode[]) {
  let doubleArea = 0
  let perimeter = 0
  ring.forEach((a, i) => {
    const b = ring[(i + 1) % ring.length]
    doubleArea += a.x * b.y - b.x * a.y
    perimeter += Math.hypot(b.x - a.x, b.y - a.y)
  })
  const area = doubleArea / 2 // innere Flächen positiv, Außenfläche negativ
  return { area, compactness: (4 * Math.PI * area) / (perimeter * perimeter) }
}

function dominantClass(ring: GraphNode[], edgeClass: Map<string, string>) {
  const counts = new Map<string, number>()
  ring.forEach((a, i) => {
    const roadClass = edgeClass.get(edgeKey(a, ring[(i + 1) % ring.length])) ?? 'unknown'
    counts.set(roadClass, (counts.get(roadClass) ?? 0) + 1)
  })
  return [...counts].sort((p, q) => q[1] - p[1])[0][0]
}

export function findRoundaboutIslands(
  lines: RoadLine[],
  { minArea = 15, maxArea = 8000, minCompactness = 0.8 }: IslandOptions = {},
): IslandCollection {
  const collection: IslandCollection = { type: 'FeatureCollection', features: [] }
  if (lines.length === 0) return collection

  const { nodes, edgeClass } = buildGraph(lines)
  for (const ring of faces(nodes.values())) {
    const { area, compactness } = measure(ring)
    if (area < minArea || area > maxArea || compactness < minCompactness) continue
    const roadClass = dominantClass(ring, edgeClass)
    if (roadClass === 'service') continue // Wendeschleifen auf Parkplätzen u. Ä.

    // Im Uhrzeigersinn ausgeben: dann zeigt ein positiver line-offset ins Innere der Insel
    const coordinates = ring.map((node) => node.coordinate).reverse()
    coordinates.push(coordinates[0])
    collection.features.push(
      { type: 'Feature', properties: { roadClass }, geometry: { type: 'Polygon', coordinates: [coordinates] } },
      { type: 'Feature', properties: { roadClass }, geometry: { type: 'LineString', coordinates } },
    )
  }
  return collection
}
