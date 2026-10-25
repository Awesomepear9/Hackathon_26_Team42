// Lädt die amtlichen deutschen Verkehrszeichen als SVG von Wikimedia Commons nach public/signs/
// und schreibt Quelle und Lizenz nach src/signs/signSources.json. Aufruf: npm run signs
//
// Die Zeichen sind amtliche Werke (§ 5 Abs. 1 UrhG) und auf Commons als gemeinfrei gekennzeichnet.
// Je Zeichen wird die neueste StVO-Fassung gewählt. Dateien werden vor dem Speichern geprüft
// (keine Skripte, keine Event-Handler, keine externen Verweise) und in der App nur per <img> eingebunden.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(root, 'public', 'signs')
const SOURCES = join(root, 'src', 'signs', 'signSources.json')
const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'DigiFL-Kartenmodul/0.1 (Verkehrszeichen fuer eine Lern-App; einmaliger Abruf)'

// Zeichen-id → Präfix des Dateinamens auf Commons und ein Stichwort, das im Titel vorkommen muss
const SIGNS = {
  102: ['Zeichen 102 -', 'Vorfahrt von rechts'],
  131: ['Zeichen 131 -', 'Lichtzeichenanlage'],
  151: ['Zeichen 151 -', 'Bahnübergang'],
  205: ['Zeichen 205 -', 'Vorfahrt gewähren'],
  206: ['Zeichen 206 -', 'Halt'],
  215: ['Zeichen 215 -', 'Kreisverkehr'],
  220: ['Zeichen 220-20 -', 'rechtsweisend'],
  325.1: ['Zeichen 325.1 -', 'Beginn'],
  325.2: ['Zeichen 325.2 -', 'Ende'],
  330.1: ['Zeichen 330.1 -', 'Autobahn'],
  350: ['Zeichen 350', 'Fußgängerüberweg'],
}

const ALLOWED_LICENSE = /public domain|^pd|cc0/i
const UNSAFE = /<script|\son[a-z]+\s*=|javascript:|<foreignObject|(?:xlink:)?href\s*=\s*["'](?!#)/i

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** GET mit Wartezeit bei Ratenbegrenzung (429/503) */
async function get(url, as = 'json') {
  for (let attempt = 0; attempt < 8; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.status === 429 || res.status === 503) {
      const wait = Number(res.headers.get('retry-after')) * 1000 || 15000 * (attempt + 1)
      console.log(`  Ratenbegrenzung, warte ${Math.round(wait / 1000)} s …`)
      await sleep(wait)
      continue
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return as === 'json' ? res.json() : res.text()
  }
  throw new Error(`Zu viele Versuche: ${url}`)
}

const api = (params) => get(`${API}?${new URLSearchParams({ format: 'json', ...params })}`)

/** neueste StVO-Fassung unter allen passenden Dateien */
async function findTitle(prefix, keyword) {
  const data = await api({ action: 'query', list: 'allpages', apnamespace: '6', apprefix: prefix, aplimit: '50' })
  const candidates = data.query.allpages
    .map((p) => p.title)
    .filter((t) => t.endsWith('.svg') && t.includes(keyword))
    .map((t) => ({ t, year: Number(t.match(/StVO (\d{4})/)?.[1] ?? 0) }))
    .sort((a, b) => b.year - a.year)
  if (candidates.length === 0) throw new Error(`Kein Zeichen gefunden: ${prefix} (${keyword})`)
  return candidates[0].t
}

const titles = {}
for (const [id, [prefix, keyword]] of Object.entries(SIGNS)) {
  titles[id] = await findTitle(prefix, keyword)
  console.log(`${id}: ${titles[id]}`)
  await sleep(1000)
}

const info = await api({
  action: 'query',
  titles: Object.values(titles).join('|'),
  prop: 'imageinfo',
  iiprop: 'url|size|extmetadata',
  iiextmetadatafilter: 'LicenseShortName|Artist',
})
const pages = Object.values(info.query.pages)

mkdirSync(OUT_DIR, { recursive: true })
const sources = {}
for (const [id, title] of Object.entries(titles)) {
  const page = pages.find((p) => p.title === title)
  const image = page?.imageinfo?.[0]
  if (!image) throw new Error(`Keine Bilddaten: ${title}`)
  const license = image.extmetadata?.LicenseShortName?.value ?? ''
  if (!ALLOWED_LICENSE.test(license)) throw new Error(`Lizenz nicht freigegeben (${license}): ${title}`)
  const svg = await get(image.url, 'text')
  if (!svg.includes('<svg') || UNSAFE.test(svg)) throw new Error(`Unsicherer oder ungültiger Inhalt: ${title}`)
  const file = `${id}.svg`
  writeFileSync(join(OUT_DIR, file), svg)
  sources[id] = {
    file,
    title: page.title,
    url: image.descriptionurl,
    license,
    author: (image.extmetadata?.Artist?.value ?? '').replace(/<[^>]+>/g, '').trim(),
  }
  console.log(`  ✓ ${file}  ${(svg.length / 1024).toFixed(1)} kB  ${license}`)
  await sleep(1000)
}
writeFileSync(SOURCES, `${JSON.stringify(sources, null, 2)}\n`)
console.log(`→ ${OUT_DIR}\n→ ${SOURCES}`)
