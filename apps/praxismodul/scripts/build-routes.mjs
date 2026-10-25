// Erzeugt die Beispielstrecken in Fulda als simulierte Fahrten mit Ereignissen.
//   Strecke:     OSRM (router.project-osrm.org), Profil Auto
//   Ereignisse:  OSM-Daten über Overpass (Ampeln, Stopp, Vorfahrt achten, Zebrastreifen,
//                Bahnübergänge, Tempolimits) + Abbiegemanöver aus OSRM
//   Zeitachse:   OSRM-Fahrzeiten je Abschnitt + simulierte Wartezeiten (deterministisch,
//                gleiche Eingabe ⇒ gleiche Ausgabe)
// Ausgabe: src/demo/routes/fulda.json. Aufruf: npm run routes (braucht Internet, ca. 1 min)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'src', 'data', 'fulda.json')
const UA = 'DigiFL-Kartenmodul/0.1 (Demo-Strecken, einmalige Generierung)'
const OSRM = 'https://router.project-osrm.org/route/v1/driving/'
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']

// Wegpunkte als [lng, lat]
const HAUPTBAHNHOF = [9.6838, 50.5547]
const DOM = [9.6703, 50.5544]
const HOCHSCHULE = [9.6874, 50.5655]
const UNIVERSITAETSPLATZ = [9.6782, 50.5517]
const SUEDEND_NORD = [9.6745, 50.548]
const SUEDEND_SUED = [9.6835, 50.542]
const KELTENSTRASSE = [9.688, 50.533]
const BRONNZELL = [9.676, 50.515]
const OSTEND = [9.71, 50.554]
const A7_RICHTUNG_WUERZBURG = [9.73022, 50.53905] // Südfahrbahn der A7 hinter der Anschlussstelle Fulda-Mitte
const PETERSGASSE = [9.68121, 50.55073]
const PETERSTOR = [9.6793, 50.5504] // Zwischenpunkt: OSRM meidet verkehrsberuhigte Bereiche sonst
const BRAUHAUSSTRASSE = [9.677, 50.5495]

const ROUTES = [
  { id: 'innenstadt', title: 'Hauptbahnhof → Dom', start: '2026-10-26T07:45:00', waypoints: [HAUPTBAHNHOF, DOM] },
  {
    id: 'magdeburger',
    title: 'Hochschule → Universitätsplatz',
    start: '2026-10-26T08:10:00',
    waypoints: [HOCHSCHULE, UNIVERSITAETSPLATZ],
  },
  { id: 'suedend', title: 'Wohngebiet Südend', start: '2026-10-26T09:30:00', waypoints: [SUEDEND_NORD, SUEDEND_SUED] },
  {
    id: 'bronnzell',
    title: 'Keltenstraße → Bronnzell über die B 27',
    start: '2026-10-26T11:05:00',
    waypoints: [KELTENSTRASSE, BRONNZELL],
  },
  {
    id: 'a7',
    title: 'Ostend → A7 Fulda-Mitte',
    start: '2026-10-26T14:20:00',
    waypoints: [OSTEND, A7_RICHTUNG_WUERZBURG],
  },
  {
    id: 'altstadt',
    title: 'Petersgasse → Brauhausstraße',
    start: '2026-10-26T15:40:00',
    waypoints: [PETERSGASSE, PETERSTOR, BRAUHAUSSTRASSE],
  },
]

const CAR_ROADS = new Set([
  'motorway',
  'motorway_link',
  'trunk',
  'trunk_link',
  'primary',
  'primary_link',
  'secondary',
  'secondary_link',
  'tertiary',
  'tertiary_link',
  'unclassified',
  'residential',
  'living_street',
])
const RANK = {
  motorway: 7,
  trunk: 6,
  primary: 5,
  secondary: 4,
  tertiary: 3,
  unclassified: 2,
  residential: 1,
  living_street: 0,
}
const rank = (hw) => RANK[hw?.replace('_link', '')] ?? 0
const RESIDENTIAL = new Set(['residential', 'living_street'])
const ONEWAY_STREETS = new Set(['residential', 'living_street', 'unclassified', 'tertiary'])

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function overpass(query) {
  for (let attempt = 0; attempt < 6; attempt++) {
    for (const url of OVERPASS) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'User-Agent': UA },
        body: new URLSearchParams({ data: query }),
      }).catch(() => undefined)
      const text = res?.ok ? await res.text() : ''
      if (text.startsWith('{')) return JSON.parse(text).elements
    }
    await sleep(4000 * (attempt + 1))
  }
  throw new Error('Overpass nicht erreichbar')
}

// Räumlicher Index über die Straßenabschnitte (Raster ca. 50 m)
const CELL = 0.0005
const cellKey = (lng, lat) => `${Math.floor(lng / CELL)}|${Math.floor(lat / CELL)}`

function buildWayIndex(ways) {
  const cells = new Map()
  for (const way of ways) {
    const g = way.geometry ?? []
    for (let i = 0; i < g.length - 1; i++) {
      const a = [g[i].lon, g[i].lat]
      const b = [g[i + 1].lon, g[i + 1].lat]
      const steps = Math.max(1, Math.ceil(meters(a, b) / 25))
      const keys = new Set()
      for (let s = 0; s <= steps; s++) {
        const f = s / steps
        keys.add(cellKey(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
      }
      for (const key of keys) {
        if (!cells.has(key)) cells.set(key, [])
        cells.get(key).push({ way, a, b })
      }
    }
  }
  return cells
}

/** Abstand Punkt–Strecke in Metern (lokale Projektion) */
function distanceToSegment(p, a, b) {
  const mx = 111320 * Math.cos((p[1] * Math.PI) / 180)
  const [px, py, ax, ay, bx, by] = [p[0] * mx, p[1] * 110540, a[0] * mx, a[1] * 110540, b[0] * mx, b[1] * 110540]
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy || 1e-9
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** Nächster Straßenabschnitt zu einem Routenabschnitt, mit Fahrtrichtung relativ zum Weg */
function nearestWay(cells, from, to) {
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
  const [cx, cy] = [Math.floor(mid[0] / CELL), Math.floor(mid[1] / CELL)]
  let best
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (const candidate of cells.get(`${cx + dx}|${cy + dy}`) ?? []) {
        const d = distanceToSegment(mid, candidate.a, candidate.b)
        if (d < 6 && (!best || d < best.d)) best = { ...candidate, d }
      }
    }
  }
  if (!best) return undefined
  const dot = (to[0] - from[0]) * (best.b[0] - best.a[0]) + (to[1] - from[1]) * (best.b[1] - best.a[1])
  return { way: best.way, forward: dot >= 0 }
}

async function osrm(waypoints) {
  const url = `${OSRM}${waypoints.map((p) => p.join(',')).join(';')}?overview=full&geometries=geojson&steps=true&annotations=nodes,duration,distance`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  const json = await res.json()
  if (json.code !== 'Ok') throw new Error(`OSRM: ${json.code}`)
  return json.routes[0]
}

// Deterministischer Zufall je Strecke und Knoten
function random(seed) {
  let h = 2166136261
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function meters(a, b) {
  const mx = 111320 * Math.cos((a[1] * Math.PI) / 180)
  return Math.hypot((b[0] - a[0]) * mx, (b[1] - a[1]) * 110540)
}

function parseMaxspeed(tags) {
  const v = tags?.maxspeed ?? tags?.['zone:maxspeed'] ?? tags?.['source:maxspeed']
  if (!v) return undefined
  if (/^\d+$/.test(v)) return Number(v)
  if (/zone:?30/i.test(v)) return 30
  if (/zone:?20/i.test(v)) return 20
  if (/urban/i.test(v)) return 50
  if (/rural/i.test(v)) return 100
  if (/living_street|walk/i.test(v)) return 7
  if (v === 'none') return 0
  return undefined
}

const TURN = {
  left: 'links abbiegen',
  right: 'rechts abbiegen',
  'slight left': 'leicht links halten',
  'slight right': 'leicht rechts halten',
  'sharp left': 'scharf links abbiegen',
  'sharp right': 'scharf rechts abbiegen',
  uturn: 'wenden',
  straight: 'geradeaus weiterfahren',
}
const roadName = (step) => [step.name, step.ref].filter(Boolean).join(' / ')
const inRoad = (step) => (roadName(step) ? ` in ${roadName(step)}` : '')
const inParens = (step) => (roadName(step) ? ` (${roadName(step)})` : '')
const capital = (s) => s[0].toUpperCase() + s.slice(1)

async function buildRoute(def) {
  const route = await osrm(def.waypoints)
  const coords = []
  const nodes = []
  const durations = []
  route.legs.forEach((leg, li) => {
    if (li === 0) coords.push(...route.geometry.coordinates) // overview=full: eine Geometrie für alle Legs
    nodes.push(...leg.annotation.nodes.slice(li === 0 ? 0 : 1))
    durations.push(...leg.annotation.duration)
  })
  if (coords.length !== nodes.length)
    throw new Error(`${def.id}: Geometrie (${coords.length}) ≠ Knoten (${nodes.length})`)

  // OSM-Daten zu allen Knoten der Strecke, den Wegen daran und Schildern in der Umgebung
  const lats = coords.map((c) => c[1])
  const lngs = coords.map((c) => c[0])
  const bbox = [
    Math.min(...lats) - 0.001,
    Math.min(...lngs) - 0.001,
    Math.max(...lats) + 0.001,
    Math.max(...lngs) + 0.001,
  ].join(',')
  const elements = await overpass(
    `[out:json][timeout:60];node(id:${nodes.join(',')})->.r;.r out;way(bn.r)[highway];out body;` +
      `node["highway"~"^(traffic_signals|stop|give_way)$"](${bbox});out;`,
  )
  const nodeTags = new Map()
  const ways = []
  for (const e of elements) {
    if (e.type === 'node') nodeTags.set(e.id, { tags: e.tags ?? {}, pos: [e.lon, e.lat] })
    else ways.push(e)
  }
  // Straßen mit Geometrie für die geometrische Zuordnung (siehe nearestWay)
  const roadPattern = [...CAR_ROADS].join('|')
  const geometryWays = await overpass(
    `[out:json][timeout:60];way["highway"~"^(${roadPattern})$"](${bbox});out tags geom;`,
  )
  const wayIndex = buildWayIndex(geometryWays)
  const signNodes = [...nodeTags.values()].filter((n) =>
    ['traffic_signals', 'stop', 'give_way'].includes(n.tags.highway),
  )

  // Wege je Knoten und je Abschnitt
  const waysAt = new Map()
  const wayOfSegment = new Map()
  for (const w of ways) {
    w.nodes.forEach((id, i) => {
      if (!waysAt.has(id)) waysAt.set(id, [])
      waysAt.get(id).push({ way: w, index: i })
      if (i > 0) {
        wayOfSegment.set(`${w.nodes[i - 1]}|${id}`, { way: w, forward: true })
        wayOfSegment.set(`${id}|${w.nodes[i - 1]}`, { way: w, forward: false })
      }
    })
  }
  // Der OSRM-Demoserver nutzt einen älteren OSM-Stand: In aktuellen Wegen können zwischen zwei
  // Routenknoten neue Punkte liegen. Darum notfalls den gemeinsamen Weg beider Knoten suchen.
  const commonWay = (a, b) => {
    for (const { way, index } of waysAt.get(a) ?? []) {
      const j = way.nodes.indexOf(b)
      if (j >= 0 && j !== index) return { way, forward: j > index }
    }
    return undefined
  }
  const segmentCache = new Map()
  const segment = (k) => {
    if (!segmentCache.has(k)) {
      segmentCache.set(
        k,
        wayOfSegment.get(`${nodes[k]}|${nodes[k + 1]}`) ??
          commonWay(nodes[k], nodes[k + 1]) ??
          nearestWay(wayIndex, coords[k], coords[k + 1]),
      )
    }
    return segmentCache.get(k)
  }
  for (let k = 0; k < nodes.length - 1; k++)
    console.log(
      k,
      nodes[k],
      segment(k)?.way.tags.highway ?? '–',
      segment(k)?.way.tags.name ?? '',
      nodeTags.has(nodes[k]) ? '' : 'Knoten fehlt',
    )
  const arms = (id) =>
    (waysAt.get(id) ?? [])
      .filter(({ way }) => CAR_ROADS.has(way.tags.highway))
      .reduce((n, { way, index }) => n + (index === 0 || index === way.nodes.length - 1 ? 1 : 2), 0)
  const isJunction = (id) => arms(id) >= 3
  const along = [0]
  for (let k = 1; k < coords.length; k++) along.push(along[k - 1] + meters(coords[k - 1], coords[k]))
  /** Meter je Straßenklasse (für die Schätzung der Verkehrslage aus OSM) */
  const roadMix = () => {
    const mix = {}
    for (let k = 0; k < nodes.length - 1; k++) {
      const cls = segment(k)?.way.tags.highway ?? 'unknown'
      mix[cls] = Math.round((mix[cls] ?? 0) + along[k + 1] - along[k])
    }
    return mix
  }
  const junctionAhead = (k, maxM) => {
    for (let j = k + 1; j < coords.length && along[j] - along[k] <= maxM; j++) if (isJunction(nodes[j])) return true
    return false
  }
  const appliesInDirection = (k, tags, key) => {
    const dir = tags[key]
    if (!dir || dir === 'both') return undefined
    const seg = segment(k - 1)
    if (!seg) return undefined
    return dir === 'forward' ? seg.forward : dir === 'backward' ? !seg.forward : undefined
  }

  // Ereignisse an den Knoten (ohne Start-/Zielpunkt, die liegen zwischen Knoten)
  const rnd = random(def.id)
  const nodeEvents = new Map() // k → [{kind, text, wait}]
  const add = (k, ev) => {
    if (!nodeEvents.has(k)) nodeEvents.set(k, [])
    nodeEvents.get(k).push(ev)
  }
  let lastSignalAt = -Infinity
  for (let k = 1; k < nodes.length - 1; k++) {
    const id = nodes[k]
    const tags = nodeTags.get(id)?.tags ?? {}
    const junction = isJunction(id)
    const incoming = segment(k - 1)?.way.tags.highway
    const r = random(`${def.id}:${id}`)

    const signal = tags.highway === 'traffic_signals' || tags.crossing === 'traffic_signals'
    if (signal) {
      const dir = appliesInDirection(k, tags, 'traffic_signals:direction')
      const pedestrian = tags.crossing === 'traffic_signals' || tags.highway === 'crossing'
      const applies = dir ?? (junction || pedestrian || junctionAhead(k, 40))
      if (applies && along[k] - lastSignalAt > 60) {
        lastSignalAt = along[k]
        const label = pedestrian && !junction ? 'Fußgängerampel' : 'Ampel'
        if (r() < 0.55) {
          const wait = Math.round(12 + r() * 23)
          add(k, {
            kind: 'ampel-rot',
            text: `${label} rot – anhalten und warten`,
            wait,
            after: { kind: 'ampel-gruen', text: `${label} grün – anfahren` },
          })
        } else {
          add(k, { kind: 'ampel-gruen', text: `${label} grün – durchfahren` })
        }
      }
      continue
    }

    if (tags.highway === 'stop' || tags.highway === 'give_way') {
      const dir = appliesInDirection(k, tags, 'direction')
      const othersMax = Math.max(
        0,
        ...(waysAt.get(id) ?? [])
          .filter(({ way }) => way.tags.highway !== incoming)
          .map(({ way }) => rank(way.tags.highway)),
      )
      const applies = dir ?? (junction ? rank(incoming) < othersMax : junctionAhead(k, 30))
      if (!applies) continue
      if (tags.highway === 'stop') {
        const wait = Math.round(3 + r() * 5)
        add(k, {
          kind: 'stopp',
          text: 'Stoppschild – vollständig anhalten',
          wait,
          after: { kind: 'weiter', text: 'Querverkehr frei – weiterfahren' },
        })
      } else if (r() < 0.45) {
        const wait = Math.round(2 + r() * 6)
        add(k, {
          kind: 'vorfahrt-achten',
          text: 'Vorfahrt achten – Querverkehr abwarten',
          wait,
          after: { kind: 'weiter', text: 'Frei – weiterfahren' },
        })
      } else {
        add(k, { kind: 'vorfahrt-achten', text: 'Vorfahrt achten – Straße frei, weiterfahren' })
      }
      continue
    }

    if (
      tags.highway === 'crossing' &&
      (tags.crossing === 'zebra' || tags.crossing_ref === 'zebra' || tags['crossing:markings'] === 'zebra')
    ) {
      if (r() < 0.4) {
        const wait = Math.round(3 + r() * 5)
        add(k, {
          kind: 'zebrastreifen',
          text: 'Zebrastreifen – Fußgänger queren lassen',
          wait,
          after: { kind: 'weiter', text: 'Überweg frei – weiterfahren' },
        })
      } else {
        add(k, { kind: 'zebrastreifen', text: 'Zebrastreifen – bremsbereit, niemand wartet' })
      }
      continue
    }

    if (tags.railway === 'level_crossing') {
      add(k, { kind: 'bahnuebergang', text: 'Bahnübergang – Schienen frei, vorsichtig überqueren' })
      continue
    }

    // Rechts vor links: Kreuzung nur aus Wohnstraßen, ohne Ampel/Schild in 30 m, ohne Vorfahrtstraße
    const leavingLivingStreet = incoming === 'living_street' && segment(k)?.way.tags.highway !== 'living_street'
    if (junction && RESIDENTIAL.has(incoming) && !leavingLivingStreet) {
      const roads = (waysAt.get(id) ?? []).map(({ way }) => way).filter((w) => CAR_ROADS.has(w.tags.highway))
      const allResidential = roads.every((w) => RESIDENTIAL.has(w.tags.highway))
      const priority = roads.some((w) => w.tags.priority_road)
      const signed = signNodes.some((n) => meters(n.pos, coords[k]) < 30)
      if (allResidential && !priority && !signed) {
        if (rnd() < 0.35) {
          const wait = Math.round(2 + r() * 4)
          add(k, {
            kind: 'rechts-vor-links',
            text: 'Kreuzung ohne Beschilderung – Fahrzeug von rechts hat Vorfahrt',
            wait,
            after: { kind: 'weiter', text: 'Fahrzeug von rechts vorbei – weiterfahren' },
          })
        } else {
          add(k, { kind: 'rechts-vor-links', text: 'Kreuzung ohne Beschilderung – rechts vor links, von rechts frei' })
        }
      }
    }
  }

  // Verkehrsberuhigter Bereich (VZ 325.1) und Einbahnstraße (VZ 220) beim Wechsel des Weges
  for (let k = 1; k < nodes.length - 1; k++) {
    const before = segment(k - 1)
    const after = segment(k)
    if (!before || !after || before.way.id === after.way.id) continue
    const r = random(`${def.id}:${nodes[k]}:way`)
    const wasLiving = before.way.tags.highway === 'living_street'
    const isLiving = after.way.tags.highway === 'living_street'
    if (isLiving && !wasLiving) {
      add(k, {
        kind: 'spielstrasse',
        text: 'Verkehrsberuhigter Bereich – Schrittgeschwindigkeit, mit spielenden Kindern rechnen',
      })
    }
    if (wasLiving && !isLiving) {
      if (r() < 0.45) {
        add(k, {
          kind: 'spielstrasse-ende',
          text: 'Verkehrsberuhigter Bereich endet – Vorfahrt gewähren, auch nach rechts',
          wait: Math.round(2 + r() * 5),
          after: { kind: 'weiter', text: 'Straße frei – weiterfahren' },
        })
      } else {
        add(k, { kind: 'spielstrasse-ende', text: 'Verkehrsberuhigter Bereich endet – Vorfahrt gewähren, Straße frei' })
      }
    }
    const oneway = ['yes', '1', 'true'].includes(after.way.tags.oneway) && after.forward
    const enteringOneway =
      oneway && !(['yes', '1', 'true'].includes(before.way.tags.oneway) && before.way.tags.name === after.way.tags.name)
    if (enteringOneway && ONEWAY_STREETS.has(after.way.tags.highway) && after.way.tags.junction !== 'roundabout') {
      const bikesBothWays = after.way.tags['oneway:bicycle'] === 'no'
      add(k, {
        kind: 'einbahnstrasse',
        text: bikesBothWays
          ? 'Einbahnstraße – nur in Pfeilrichtung, Radverkehr kommt entgegen'
          : 'Einbahnstraße – nur in Pfeilrichtung befahren',
      })
    }
  }

  // Tempolimit-Wechsel entlang der Abschnitte
  let currentSpeed
  for (let k = 0; k < nodes.length - 1; k++) {
    const seg = segment(k)
    const speed = parseMaxspeed(seg?.way.tags)
    if (speed === undefined || speed === currentSpeed) continue
    const text =
      speed === 0
        ? 'Autobahn ohne Tempolimit (Richtgeschwindigkeit 130 km/h)'
        : speed === 7
          ? 'Verkehrsberuhigter Bereich – Schrittgeschwindigkeit'
          : `Höchstgeschwindigkeit ${speed} km/h`
    add(k, { kind: 'tempo', text, first: true })
    currentSpeed = speed
  }

  // Manöver aus OSRM
  const nearestIndex = (loc) => {
    let best = 0
    for (let k = 1; k < coords.length; k++) if (meters(coords[k], loc) < meters(coords[best], loc)) best = k
    return best
  }
  const steps = route.legs.flatMap((l) => l.steps)
  for (const step of steps) {
    const { type, modifier, exit } = step.maneuver
    const k = nearestIndex(step.maneuver.location)
    if (type === 'roundabout' || type === 'rotary') {
      add(k, { kind: 'kreisverkehr', text: `Kreisverkehr – einfahren, ${exit ?? 1}. Ausfahrt nehmen${inParens(step)}` })
    } else if (type === 'exit roundabout' || type === 'exit rotary') {
      add(k, { kind: 'kreisverkehr', text: `Kreisverkehr verlassen – rechts blinken` })
    } else if (type === 'on ramp') {
      add(k, { kind: 'auffahrt', text: `Auffahrt${roadName(step) ? ` auf ${roadName(step)}` : ''} nehmen` })
    } else if (type === 'merge') {
      add(k, {
        kind: 'einfaedeln',
        text: `${roadName(step) ? `Auf ${roadName(step)} e` : 'E'}infädeln – Beschleunigungsstreifen nutzen, Schulterblick`,
      })
    } else if (type === 'off ramp') {
      add(k, { kind: 'abbiegen', text: `Abfahrt nehmen${inParens(step)}` })
    } else if (type === 'fork') {
      add(k, {
        kind: 'abbiegen',
        text: `An der Gabelung ${modifier?.includes('left') ? 'links' : 'rechts'} halten${inParens(step)}`,
      })
    } else if (type === 'turn' || type === 'end of road') {
      if (modifier === 'straight') continue
      const prefix = type === 'end of road' ? 'Am Ende der Straße ' : ''
      add(k, { kind: 'abbiegen', text: capital(`${prefix}${TURN[modifier] ?? 'abbiegen'}${inRoad(step)}`) })
    }
  }

  // Zeitachse: OSRM-Fahrzeit je Abschnitt, Wartezeiten an den Knoten
  const track = []
  const events = []
  let t = 0
  const pushEvent = (k, ev) =>
    events.push({
      t: Math.round(t * 10) / 10,
      kind: ev.kind,
      text: ev.text,
      ...(ev.wait ? { waitS: ev.wait } : {}),
      lng: coords[k][0],
      lat: coords[k][1],
    })
  events.push({
    t: 0,
    kind: 'start',
    text: roadName(steps[0]) ? `Start: ${roadName(steps[0])}` : 'Start',
    lng: coords[0][0],
    lat: coords[0][1],
  })
  for (let k = 0; k < coords.length; k++) {
    if (k > 0) t += durations[k - 1]
    track.push([coords[k][0], coords[k][1], Math.round(t * 10) / 10])
    const list = (nodeEvents.get(k) ?? []).sort((a, b) => (b.first ? 1 : 0) - (a.first ? 1 : 0))
    for (const ev of list) {
      pushEvent(k, ev)
      if (ev.wait) {
        t += ev.wait
        track.push([coords[k][0], coords[k][1], Math.round(t * 10) / 10])
        pushEvent(k, ev.after)
      }
    }
  }
  const last = coords.length - 1
  events.push({
    t: Math.round(t * 10) / 10,
    kind: 'ziel',
    text: roadName(steps.at(-1)) ? `Ziel erreicht: ${roadName(steps.at(-1))}` : 'Ziel erreicht',
    lng: coords[last][0],
    lat: coords[last][1],
  })

  const round6 = (v) => Math.round(v * 1e6) / 1e6
  return {
    id: def.id,
    title: def.title,
    startTime: def.start, // lokale Zeit, ohne Zeitzone
    durationS: Math.round(t),
    distanceM: Math.round(route.distance),
    roadMix: roadMix(),
    track: track.map(([lng, lat, tt]) => [round6(lng), round6(lat), tt]),
    events: events.map((e) => ({ ...e, lng: round6(e.lng), lat: round6(e.lat) })),
  }
}

const summary = (r) => {
  const counts = r.events.reduce((m, e) => ((m[e.kind] = (m[e.kind] ?? 0) + 1), m), {})
  const minutes = `${Math.floor(r.durationS / 60)}:${String(r.durationS % 60).padStart(2, '0')}`
  return `${r.id}: ${(r.distanceM / 1000).toFixed(1)} km, ${minutes} min, ${r.events.length} Ereignisse ${JSON.stringify(counts)}`
}

// Aufruf:
//   npm run routes                       alle Strecken neu erzeugen
//   npm run routes -- suedend a7         nur diese Strecken neu erzeugen, Rest bleibt
//   npm run routes -- --try lng,lat lng,lat   Probefahrt ausgeben, nichts speichern
const args = process.argv.slice(2)
if (args[0] === '--try') {
  const waypoints = args.slice(1).map((p) => p.split(',').map(Number))
  const r = await buildRoute({ id: 'probe', title: 'Probe', start: '2026-01-01T00:00:00', waypoints })
  console.log(summary(r))
  for (const e of r.events) console.log(`  ${String(e.t).padStart(6)}  ${e.kind.padEnd(18)} ${e.text}`)
  process.exit(0)
}

const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).routes : []
const result = []
for (const def of ROUTES) {
  if (args.length > 0 && !args.includes(def.id)) {
    const kept = existing.find((r) => r.id === def.id)
    if (kept) result.push(kept)
    continue
  }
  const r = await buildRoute(def)
  result.push(r)
  console.log(summary(r))
  await sleep(1500) // Rücksicht auf die öffentlichen Dienste
}
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(
  OUT,
  JSON.stringify(
    {
      generated: new Date().toISOString().slice(0, 10),
      source: 'OSRM + OpenStreetMap (Overpass), Wartezeiten simuliert',
      // abgeleitete Datenbank aus OpenStreetMap: gleiche Lizenz wie die Quelldaten
      license: 'ODbL-1.0',
      licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
      attribution: '© OpenStreetMap contributors',
      routes: result,
    },
    null,
    1,
  ),
)
console.log(`→ ${OUT}`)
