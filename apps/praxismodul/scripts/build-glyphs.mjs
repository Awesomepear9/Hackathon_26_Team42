// Erzeugt SDF-Glyphen (MapLibre-PBF) für „Inter SemiBold“ (Inter 600) nach public/fonts/.
// OpenFreeMap & Co. liefern kein Inter, darum werden die Glyphen einmalig lokal gebaut
// und mit der App ausgeliefert. Aufruf: npm run glyphs
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import TinySDF from '@mapbox/tiny-sdf'
import Pbf from 'pbf'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fontFiles = join(dirname(require.resolve('@fontsource/inter/package.json')), 'files')

const FONTSTACK = 'Inter SemiBold'
// 0–255: Basis-Latein inkl. Umlaute/ß, 256–511: Latin Extended-A/B, 8192–8447: Gedankenstrich, Anführungszeichen
const RANGES = [0, 256, 8192]
// Aus dem Bereich 8192–8447 nur die Zeichen, die in Straßennamen vorkommen (– — ‘ ’ ‚ “ ” „ …)
const PUNCTUATION = new Set([0x2013, 0x2014, 0x2018, 0x2019, 0x201a, 0x201c, 0x201d, 0x201e, 0x2026])

GlobalFonts.registerFromPath(join(fontFiles, 'inter-latin-600-normal.woff2'), 'DigiFLInterLatin')
GlobalFonts.registerFromPath(join(fontFiles, 'inter-latin-ext-600-normal.woff2'), 'DigiFLInterLatinExt')

// Gleiche Parameter wie MapLibres eingebauter TinySDF-Pfad (ONE_EM 24, Rand 3, Radius 8).
class NodeTinySDF extends TinySDF {
  _createCanvas(size) {
    return createCanvas(size, size)
  }
}
const sdfOptions = { fontSize: 24, buffer: 3, radius: 8, cutoff: 0.25, fontWeight: '600' }
const sdf = {
  latin: new NodeTinySDF({ ...sdfOptions, fontFamily: 'DigiFLInterLatin' }),
  ext: new NodeTinySDF({ ...sdfOptions, fontFamily: 'DigiFLInterLatinExt' }),
}

function writeGlyph(g, pbf) {
  pbf.writeVarintField(1, g.id)
  if (g.bitmap) pbf.writeBytesField(2, g.bitmap)
  pbf.writeVarintField(3, g.width)
  pbf.writeVarintField(4, g.height)
  pbf.writeSVarintField(5, g.left)
  pbf.writeSVarintField(6, g.top)
  pbf.writeVarintField(7, g.advance)
}

const outDir = join(root, 'public', 'fonts', FONTSTACK)
mkdirSync(outDir, { recursive: true })

for (const start of RANGES) {
  const end = start + 255
  const glyphs = []
  for (let id = start; id <= end; id++) {
    if (id < 32 || (id >= 127 && id < 160)) continue // Steuerzeichen
    if (start === 8192 && !PUNCTUATION.has(id)) continue
    const c = (id >= 256 && id < 512 ? sdf.ext : sdf.latin).draw(String.fromCharCode(id))
    const advance = Math.round(c.glyphAdvance)
    if (!c.glyphWidth || !c.glyphHeight) {
      // Leerzeichen & Co.: nur Vorschub, kein Bitmap
      glyphs.push({ id, width: 0, height: 0, left: 0, top: -26, advance })
      continue
    }
    glyphs.push({
      id,
      bitmap: Buffer.from(c.data),
      width: c.glyphWidth,
      height: c.glyphHeight,
      left: Math.round(c.glyphLeft),
      top: c.glyphTop - 27, // Grundlinien-Versatz wie in MapLibres glyph_manager
      advance,
    })
  }
  const pbf = new Pbf()
  pbf.writeMessage(
    1,
    (stack, p) => {
      p.writeStringField(1, FONTSTACK)
      p.writeStringField(2, `${start}-${end}`)
      for (const g of stack) p.writeMessage(3, writeGlyph, g)
    },
    glyphs,
  )
  writeFileSync(join(outDir, `${start}-${end}.pbf`), pbf.finish())
  console.log(`${FONTSTACK}/${start}-${end}.pbf  (${glyphs.length} Glyphen)`)
}
