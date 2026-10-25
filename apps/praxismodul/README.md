# DigiFL – Praxismodul (Fahrschul-App mit Kartenmodul)

Mobile App nach den DigiFL-Entwürfen: Level wählen, eine Route in Fulda fahren (simuliert), dabei
Lernpunkte bewerten und die Fahrt auswerten. Darunter liegt das Kartenmodul `SituationMap`, das echte
Straßensituationen aus OpenStreetMap als flache, reduzierte Verkehrsillustration zeigt.

Stack: Node.js, React 19, Vite, Tailwind CSS v4 (DigiFL-Theme in `src/styles/digifl-theme.css`),
MapLibre GL JS mit Vektor-Tiles im OpenMapTiles-Schema.

```bash
npm install
npm run dev      # App auf http://localhost:5173
npm run build    # Typecheck + Produktions-Build nach dist/
npm run lint     # ESLint (typescript-eslint strict, React-Hooks-Regeln)
npm run test     # Unit-Tests (Vitest)
npm run e2e      # Ende-zu-Ende-Tests (Playwright im installierten Google Chrome)
npm run check    # lint + typecheck + test + build, z. B. für eine spätere CI
npm run format   # Prettier
npm run glyphs   # Inter-600-Glyphen neu erzeugen (nur nach Schrift-Update nötig)
npm run routes   # Fulda-Strecken neu erzeugen (braucht Internet)
npm run signs    # amtliche Verkehrszeichen von Wikimedia Commons laden (braucht Internet)
```

### Projektstruktur und Konventionen

```
src/
  app/         App-Rahmen und Navigation zwischen den Screens
  screens/     LvL Auswahl, Fahrt (drive/), Auswertung (result/), Fahrten
  ui/          Bausteine aus den Entwürfen: Karte, Chip, Balken, Sterne, Kopfzeilen, Navigation, Logo
  learning/    Fachlogik: Level, Lernpunkte, Bewertung, Fahrtenverlauf, Verkehrslage
  signs/       Verkehrszeichen als SVG und Punkt-Marker für die Karte
  icons/       Tabler Icons als React-Komponente und SVG-Text
  data/        Fulda-Strecken (fulda.json, erzeugt) und ihr Typ
  components/  Kartenkomponenten (SituationMap, LiveSituationMap, MapAttribution)
  map/         Kartenlogik: Stil, Palette, Tile-Quelle, Geometrie (geo.ts), Inselerkennung,
               Marker, Kamera (navCamera.ts) und die zugehörigen Hooks (use*.ts)
  hooks/       allgemeine React-Hooks (Farbschema, Elementgröße, Sichtbarkeit)
  test/        Hilfen für Unit-Tests (künstliche Strecken); Tests liegen als *.test.ts neben dem Modul
e2e/           Playwright-Tests der ganzen App
scripts/       Node-Skripte zur Erzeugung von Glyphen und Strecken
docs/          Todo-Liste zur Umsetzung der Entwürfe
```

- TypeScript strict, ESLint mit `typescript-eslint` (strict) und `eslint-plugin-react-hooks`
  (inkl. der Regeln für reines Rendern: keine Refs, kein `setState` im Effect-Body, keine
  unreinen Aufrufe im Render). Keine abgeschalteten Regeln im Code.
- Prettier: ohne Semikolon, einfache Anführungszeichen, 120 Zeichen. `.editorconfig` für Editoren.
- Komponenten in PascalCase (`*.tsx`), Hooks als `useX.ts`, übrige Module in camelCase.
- Bezeichner englisch; UI-Texte und Kommentare deutsch. Ausnahme: die Ereignisarten
  (`ampel-rot`, `vorfahrt-achten` …) sind Werte des Datenformats in `fulda.json`.
- Animationen laufen in `requestAnimationFrame`-Schleifen in Effekten; im Render wird nur aus
  State und Props gerechnet.

## Verwendung

```tsx
import { SituationMap } from './components/SituationMap'

;<SituationMap
  center={[7.647545, 51.940171]}
  zoom={18}
  bearing={0}
  vehicles={[
    { id: 'ich', type: 'self', lng: 7.647168, lat: 51.940024, bearing: 70, arrow: true },
    { id: 'kreis', type: 'other', lng: 7.647305, lat: 51.940168, bearing: 169 },
  ]}
  interactive={false}
  showLabels={false}
  ariaLabel="Kreisverkehr von oben. Das eigene Fahrzeug fährt von Südwesten auf den Kreisverkehr zu."
  className="h-[168px] w-full rounded-3xl"
/>
```

| Prop          | Standard | Bedeutung                                                                                         |
| ------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `center`      | –        | `[lng, lat]`                                                                                      |
| `zoom`        | `18`     | Kartenzoom (Tiles bis 14, darüber wird hochskaliert)                                              |
| `bearing`     | `0`      | Drehung der Karte in Grad                                                                         |
| `pitch`       | `0`      | Neigung in Grad (0 = Draufsicht, bis 60)                                                          |
| `route`       | –        | noch zu fahrende Route als `[lng, lat][]`, gezeichnet in cyan-600 (dunkel cyan-700)               |
| `symbols`     | –        | Schilder/Symbole am Straßenrand (`{ id, lng, lat, svg }`), unter den Fahrzeugen                   |
| `vehicles`    | `[]`     | `{ id, lng, lat, bearing, type: 'self' \| 'other', arrow? }`                                      |
| `interactive` | `false`  | `true`: Pan und Pinch-Zoom (Touch und Trackpad). Normales Mausrad scrollt weiter die Seite.       |
| `showLabels`  | `false`  | Straßennamen (Inter 600, 12 px, navy-700, Halo #ffffff)                                           |
| `ariaLabel`   | –        | Textbeschreibung der Situation, landet als `aria-label` auf dem `role="img"`-Element              |
| `colorScheme` | `'auto'` | `'auto'` folgt der Tailwind-Klasse `.dark` an einem Vorfahren, sonst `'light'`/`'dark'` erzwingen |
| `className`   | –        | Größe und Rundung; `relative overflow-hidden rounded-3xl` setzt die Komponente selbst             |

Während des Ladens zeigt der Container green-100 (dunkel: navy-800) mit einem pulsierenden
Skeleton ohne Spinner (`motion-reduce` schaltet das Pulsieren ab).

**Fahrzeuge** sind HTML-Marker: abgerundetes Rechteck 26 × 14 px (rx 4), eigenes Fahrzeug #26d9e8,
andere #ffb454, Richtungsstrich #111c33 an der Front. `bearing` dreht den Marker relativ zu Norden,
er dreht also mit, wenn die Karte selbst gedreht ist. `arrow: true` zeichnet einen Pfeil in
Fahrtrichtung (2,5 px, #111c33, runde Enden; im Dark Mode navy-300, sonst wäre er auf #18233c unsichtbar).

## Live am aktuellen Standort: `LiveSituationMap`

Zeigt die Straßensituation dort, wo der Nutzer gerade ist. Das eigene Fahrzeug (mit Pfeil)
folgt der GPS-Position des Browsers, die Karte bleibt darauf zentriert.

```tsx
import { LiveSituationMap } from './components/LiveSituationMap'

<LiveSituationMap
  fallbackCenter={[7.620875, 51.970867]} // solange kein Standort vorliegt
  zoom={18}
  headingUp={false}                      // true: Fahrtrichtung zeigt nach oben
  onStatusChange={(status) => …}         // 'pending' | 'live' | 'denied' | 'unavailable' | 'unsupported'
  className="h-[168px] w-full rounded-3xl"
/>
```

- **Standort:** `navigator.geolocation.watchPosition` mit hoher Genauigkeit (`src/map/useLivePosition.ts`).
  Der Browser fragt beim ersten Mal nach der Freigabe. Geolocation funktioniert nur über HTTPS
  (oder `localhost`).
- **Fahrtrichtung:** `coords.heading`, sobald das Gerät schneller als 1 m/s fährt. Desktop-Browser
  liefern kein `heading`; dann wird die Richtung aus den letzten Positionen berechnet (ab 3 m
  Bewegung, damit GPS-Rauschen im Stand die Richtung nicht verdreht).
- **Glättung:** Zwischen zwei GPS-Positionen gleitet das Fahrzeug in 900 ms zur neuen Position und
  dreht auf dem kürzesten Weg. Marker werden dabei nicht neu erzeugt, sondern verschoben.
- **Ohne Standort** (Freigabe abgelehnt, kein GPS, Timeout) zeigt die Karte `fallbackCenter` ohne
  Fahrzeug. Die Komponente zeigt dafür selbst keinen Hinweis an; die App bekommt den Status über
  `onStatusChange` und entscheidet, was sie anzeigt.
- **Barrierefreiheit:** Das `aria-label` wird um die Fahrtrichtung ergänzt („Fahrtrichtung
  Nordosten“) bzw. um „Aktueller Standort nicht verfügbar“.
- **Datenschutz:** Die Position bleibt im Gerät. Der Tile-Server sieht nur, welche Kacheln
  (ca. 2,4 km Kantenlänge) geladen werden, also die ungefähre Gegend.
- Die Live-Karte ist nicht verschiebbar, weil sie sonst sofort zum Fahrzeug zurückspringen würde.
- Andere Verkehrsteilnehmer kennt die Live-Karte nicht; OSM enthält nur das Straßennetz.

## Kartenstil (`src/map/style.json`)

JSON kennt keine Kommentare, darum hier die Layer von unten nach oben. `style.json` enthält die
hellen Farben; die dunklen stehen in `src/map/palette.ts` (eine Tabelle Layer → Eigenschaft → hell/dunkel).

| Layer                   | Quelle                         | Inhalt                                                                                                                                                           | Hell                       | Dunkel                       |
| ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------- |
| `background`            | –                              | Landfläche                                                                                                                                                       | #dcf2eb green-100          | #18233c navy-800             |
| `landcover-green`       | `landcover`                    | `class` grass (Parks, Wiesen, Rasen, Verkehrsinseln als Fläche) und wood                                                                                         | #93d6c0 green-300          | #185f50 green-800            |
| `water`                 | `water`                        | Wasserflächen ohne Tunnel                                                                                                                                        | #baf3f8 cyan-200           | #135060 cyan-900 *           |
| `waterway`              | `waterway`                     | Flüsse, Kanäle, Bäche als Linie                                                                                                                                  | #baf3f8                    | #135060 *                    |
| `building`              | `building`                     | ab Zoom 14, ohne Umrandung, ohne 3D (`fill`, nicht `fill-extrusion`)                                                                                             | #e7eaf0 navy-100           | #243049 navy-700 *           |
| `roundabout-island`     | `roundabout-islands` (GeoJSON) | Mittelinsel, liegt **unter** den Straßen, damit die Fahrbahn den Rand sauber überdeckt                                                                           | #93d6c0                    | #185f50                      |
| `road`                  | `transportation`               | alle Kfz-Straßen (motorway, trunk, primary, secondary, tertiary, minor, service ohne Parkplatzgassen), keine Tunnel, keine Casings, `line-cap`/`line-join` round | #7a8499 navy-400           | #535e76 navy-500             |
| `road-centerline`       | `transportation`               | Mittelmarkierung breiter Straßen (motorway … secondary, ohne Rampen), erst ab Zoom 17, `line-dasharray [2, 2]`                                                   | #f5f7fa navy-50            | #a7afbf navy-300             |
| `roundabout-island-rim` | `roundabout-islands`           | 3 px Rand der Mittelinsel; `line-offset` = halbe Fahrbahnbreite + 1,5 px, so liegt der Rand genau an der inneren Fahrbahnkante                                   | #f5f7fa                    | #a7afbf                      |
| `road-label`            | `transportation_name`          | Straßennamen, `visibility: none`, per `showLabels` an                                                                                                            | Text #243049, Halo #ffffff | Text #e7eaf0, Halo #18233c * |

\* Im Briefing nicht festgelegt, aus der DigiFL-Palette ergänzt.

**Straßenbreiten** sind zoomabhängig (exponentiell, Basis 2), ab Zoom 18 maßstabsgetreu wachsend.
Bei Zoom 18: Autobahn 48 px je Richtungsfahrbahn, Bundes-/Landesstraße 36, Kreisstraße 32,
Wohnstraße 28, Rampe 26, Zufahrt 14. Alle Straßen haben dieselbe Farbe, darum ist keine
Sortierung nötig: Überlappungen verschmelzen zu einer Fläche.

**Bewusst weggelassen:** POIs, Hausnummern, Bus- und Bahnlinien, Fuß- und Radwege, Tunnel,
Ortsnamen, Grenzen, Ackerflächen.

### Kreisverkehr-Mittelinsel

Das OpenMapTiles-Schema übernimmt `junction=roundabout` nicht. Die Insel wird deshalb im Browser
aus der Geometrie abgeleitet (`src/map/roundaboutIslands.ts`): Das Straßennetz der geladenen Tiles
wird als planarer Graph aufgebaut, seine Flächen werden umlaufen, und kleine, fast kreisrunde
Flächen (15 bis 8000 m², Kompaktheit 4πA/U² ≥ 0,8) werden zur Insel. Häuserblöcke (Quadrat ≈ 0,785)
und dreieckige Tropfeninseln fallen heraus, Wendeschleifen aus `service`-Wegen ebenso.

Grenzen: Liegt ein Kreisverkehr genau auf einer Tile-Grenze (Zoom 14, ca. 2,4 km Kantenlänge),
entsteht keine Insel; der Kreis wird dann ohne Insel gezeichnet. Minikreisel (`highway=mini_roundabout`)
sind in OSM nur ein Punkt und haben keine Insel.

### Schrift

OpenFreeMap liefert Glyphen nur für Noto Sans u. Ä., nicht für Inter. `scripts/build-glyphs.mjs`
erzeugt deshalb SDF-Glyphen für „Inter SemiBold“ aus `@fontsource/inter` (Latein, Latin Extended,
Gedankenstriche/Anführungszeichen) nach `public/fonts/`. Sie werden mit der App ausgeliefert.

## Tile-Quelle

Standard ist [OpenFreeMap](https://openfreemap.org) (`https://tiles.openfreemap.org/planet`,
TileJSON, OpenMapTiles-Schema, Tiles bis Zoom 14). Raster-Tiles von `tile.openstreetmap.org` werden
nicht verwendet: Sie lassen sich nicht umfärben, und die Tile Usage Policy der OSMF schließt die
produktive Nutzung in einer App aus.

Die Quelle ist per Umgebungsvariable austauschbar (`.env.local`, Vorlage in `.env.example`),
der Stil bleibt dabei gleich:

| Quelle                                 | `VITE_TILES_TYPE` | `VITE_TILES_URL`                                                     |
| -------------------------------------- | ----------------- | -------------------------------------------------------------------- |
| OpenFreeMap (Standard)                 | –                 | –                                                                    |
| MapTiler                               | `tilejson`        | `https://api.maptiler.com/tiles/v3-openmaptiles/tiles.json?key=…`    |
| PMTiles (Datei auf eigenem Server/CDN) | `pmtiles`         | `https://…/digifl.pmtiles`                                           |
| Eigener Tile-Server                    | `xyz`             | `https://tiles.example.org/{z}/{x}/{y}.pbf` (+ `VITE_TILES_MAXZOOM`) |

Bedingung: Die Tiles müssen dem **OpenMapTiles-Schema** folgen. Die Protomaps-Basemap nutzt ein
anderes Schema; für PMTiles also z. B. mit Planetiler (`--output=….pmtiles`) einen eigenen Extrakt
erzeugen. Das `pmtiles`-Paket wird nur geladen, wenn diese Quelle gewählt ist.

Für die Produktion lohnt sich ein eigener Extrakt (z. B. nur Deutschland als PMTiles): keine
Abhängigkeit von einem Gratisdienst, und die Quizbilder bleiben stabil, weil sich die Daten nur bei
einem bewussten Update ändern.

## Lizenzen

`npm run build` erzeugt `dist/licenses.txt` mit den Lizenzen aller gebündelten Bibliotheken
(`rollup-plugin-license`) und den eigenen Hinweisen aus `THIRD-PARTY-NOTICES.md` (Verkehrszeichen,
Tabler Icons, Schrift Inter unter SIL OFL 1.1, Kartendaten unter ODbL 1.0). Die App verlinkt die Datei
unten in der Fahrtenliste („Lizenzen und Quellen“); im Dev-Server liefert dieselbe Adresse die eigenen
Hinweise. `src/data/fulda.json` ist aus OpenStreetMap abgeleitet und steht unter der ODbL 1.0.

## OSM-Attribution

Die Kartendaten stehen unter der ODbL. „© OpenStreetMap contributors“ ist deshalb in jeder Karte
sichtbar: dezent unten rechts, `text-xs`, navy-500 (im Dark Mode navy-300 für ausreichenden
Kontrast), verlinkt auf <https://www.openstreetmap.org/copyright>. Die Attribution liegt außerhalb
des `role="img"`-Elements, damit der Link für Screenreader erreichbar bleibt.

Davor steht „© OpenMapTiles“: Das Schema steht unter CC-BY 4.0 und verlangt diese Nennung.
Eine andere Tile-Quelle trägt ihre Nennung über `VITE_TILES_CREDIT` ein (z. B. „© MapTiler“).
Die OSM-Nennung lässt sich nicht abschalten.

## App

Mobil gestaltet (Entwürfe für ca. 412 px Breite), auf breiten Bildschirmen als schmale Spalte.
Hell und dunkel; dunkel folgt der Systemeinstellung.

| Screen              | Inhalt                                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Übersicht (Start)   | Logo, Begrüßung, aktuelles Level mit Ø Sternen und Bedingung fürs nächste Level, gefahrene km, Anzahl Fahrten, Einstiege „LvL Auswahl“, „Freie Fahrt“ und „Prüfungssimulation“ (beide bald verfügbar)                                                              |
| LvL Auswahl         | Level mit Fortschritt; aktives Level aufgeklappt mit Lernthemen, Routen A–C, Verkehrslage, Vorschau der gewählten Route, „Route starten“                                                                                                                           |
| Fahrt               | 3D-Karte mit Route, nummerierten Punkten und Navigationspfeil; Pause/Weiter und Tempo 1×/2×/4×; aktuelle Fahraufgabe mit Kriterien ✓ / ✗ / ? und Schwerfehler-Abfrage Ja/Nein; weitere Punkte; „Fahrt beenden“ öffnet die Bewertung des allgemeinen Fahrverhaltens |
| Fahrt abgeschlossen | Note mit Sternen, bestanden/nicht bestanden, Anteile Fahraufgaben/Fahrverhalten, Gesamtleistung, Weg zu 1.000 km, Tempo-Diagramm, „Hier nochmal üben“, Tipp                                                                                                        |
| Fahrten             | Gesamt-km mit Fortschritt, Liste aller Fahrten; Tippen öffnet die Auswertung                                                                                                                                                                                       |

Untere Navigation: Raster = Übersicht, Route = Fahrten. „Duelle“ (Schwerter) und Profil (Avatar)
sind sichtbar, aber noch ohne Funktion („bald verfügbar“).

### Navigation und Datenerhalt (`src/app/router.ts`, `src/learning/activeDrive.ts`)

- **Adressen** (Hash-Routing ohne Bibliothek): `#/` Übersicht, `#/level` LvL Auswahl, `#/fahrten`, `#/fahrt/<Level>/<Route>`
  (z. B. `#/fahrt/2/A`), `#/auswertung/<id>`. Ungültige Adressen führen zur Startseite. Die Screens
  liegen im Browser-Verlauf (`history.pushState`, Tiefe in `history.state`), Browser-/System-Zurück
  bleibt darum in der App; App-Zurück ohne Verlauf führt zur Startseite. Die Tabs der unteren
  Navigation beginnen einen neuen App-Verlauf.
- **Laufende Fahrt** (Level, Route, Fahrzeit, Antworten) steht im `sessionStorage` und übersteht das
  Neuladen. Wer dieselbe Fahrt wieder öffnet, macht dort weiter (zunächst angehalten); eine andere
  Fahrt ersetzt den Stand. „Fahrt beenden“ und Abbrechen löschen ihn.
- **Abbrechen:** App-Zurück in der Fahrt fragt nach, sobald ein Prüfpunkt bewertet ist („Fahrt
  abbrechen? Deine Bewertungen gehen verloren.“). Browser-Zurück und die Tabs fragen nicht; der Stand
  bleibt dann für diesen Tab erhalten.

### Barrierefreiheit

- Kontraste nach WCAG 2.1 AA (hell und dunkel), geprüft mit axe-core auf allen vier Screens.
- Fahrt anhalten und Tempo wählen (WCAG 2.2.2); mit „Bewegung reduzieren“ beginnt sie in Echtzeit,
  Kamera-Übergänge springen und die Karte dreht ruhiger mit.
- Beim Screenwechsel geht der Fokus auf die H1 des neuen Screens, der Titel wird angesagt
  (`aria-live`) und als Seitentitel gesetzt; der Fahrt-Screen hat eine unsichtbare H1.
- Der Wechsel des aktuellen Punkts wird angesagt („Punkt 2 von 8: Rechts vor Links, in 150 m“).
- Ohne Kartenkacheln (offline) zeigt die Karte einen Hinweis mit „Erneut versuchen“.

### Level und Lernpunkte (`src/learning/`)

| Level              | Fahraufgaben                                                                               | Routen A / B / C                       |
| ------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| 1 Vorfahrt         | 205 Vorfahrt gewähren, 206 Halt. Vorfahrt gewähren, 215 Kreisverkehr*                      | Bronnzell (B 27), Südend, Hochschule   |
| 2 Rechts vor Links | 102 Rechts vor Links, 325 Verkehrsberuhigter Bereich (+ Ende/Ausnahmen), 220 Einbahnstraße | Altstadt Peterstor, Südend, Hochschule |
| 3 Ampeln & Spuren  | Ampelkreuzung, Spurwechsel (Einfädeln), 350 Fußgängerüberweg*                              | Innenstadt, A7, Hochschule             |
| 4, 5               | Themen laut Katalog, noch ohne Routen (gesperrt, „bald verfügbar“)                         | –                                      |

\* nicht im Bewertungskatalog, Kriterien vorläufig (siehe `docs/AUDIT-offene-punkte.md`).

Die Bewertung folgt den Vorgaben „Logik_Bewertung_NEU“ und „Logik_Zusammenfassung LVL-Anforderungen +
Prüfschritte“. Je Fahraufgabe (`learningPoints.ts`): Verkehrszeichen, Regel, Erwartung an den
Fahrschüler, die Bewertungskriterien des Katalogs mit Übungsauftrag und ein Tipp. Die Punkte einer
Fahrt sind die Ereignisse der Strecke, die zum Level gehören (`drivePoints.ts`).

### Bewertung (`evaluation.ts`, `generalBehavior.ts`)

- **Fahraufgabe:** Jedes nicht erfüllte Kriterium zählt −1, geteilt durch die bewerteten Kriterien
  (Score 0–1). „?“ (konnte nicht bewertet werden) und leere Kriterien zählen nicht. Am Ende jeder
  Aufgabe die Schwerfehler-Abfrage: **Ja** setzt die Aktion auf 0, die −1 zählen dann nicht zusätzlich.
- **Allgemeines Fahrverhalten** (einmal je Fahrt, getrennt von den Checklisten): Spurhaltung,
  Einordnen, Spiegel- und Schulterblick, auf andere achten, Abstand vorne und seitlich je −1;
  **Geschwindigkeit bewertet die App** (Toleranz +3 km/h für 3 s). Eigene Schwerfehler-Abfrage
  (Ja = 0); ab 5 km/h über dem Limit für mehr als 3 s zeigt die App einen Hinweis, die Entscheidung
  bleibt bei der Begleitperson. Dazu die Gesamtleistung in 1–5 Sternen (ohne Fehlerwert, nur Anzeige).
- **Note** (Sterne 0–10, halbe Schritte) = 10 · (0,5 · Fahrverhalten + 0,5 · Ø Fahraufgaben).
  Ältere Fahrten ohne Fahrverhalten zählen nur die Fahraufgaben.
- **Level bestanden** mit einer Fahrt ab 8,0 Sternen **ohne schweren Fehler** („kein *0“); dann wird das
  nächste frei. Fortschritt = beste Note × 10. Ø Sterne je Level = Mittel aller Fahrten des Levels.
- **Hier nochmal üben:** schwere Fehler zuerst, dann nicht erfüllte bzw. nicht bewertbare Kriterien
  aus Fahraufgaben und Fahrverhalten (bis zu drei). **Tipp:** zum Thema mit den meisten Fehlern.
- Schwerfehler-Katalog (Hilfe über „i“ an jeder Abfrage): Vorfahrt genommen, Personen- oder
  Sachschaden, Gefährdung, Eingriff der Begleitperson, Geschwindigkeit ab 5 km/h über dem Limit,
  Mindestabstand deutlich unterschritten.

### Was echt ist und was simuliert

| Echt (OpenStreetMap, OSRM)                                                        | Simuliert                                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Straßen, Strecken, Fahrzeiten                                                     | Fahrt (Zeitraffer 1×/2×/4×), Rotphasen und Wartezeiten                                                  |
| Verkehrszeichen, Ampeln, Zebrastreifen, Tempolimits, Spielstraßen, Einbahnstraßen | Fahrverhalten im Tempo-Diagramm: beim freien Fahren am Limit orientiert, ±12 %, reproduzierbar je Fahrt |
| Unbeschilderte Wohngebietskreuzungen (Hinweis, keine Garantie)                    | Verkehrslage der Routen (Beispielwerte), Fahrtenverlauf (12 Beispielfahrten)                            |

Eigene Fahrten werden im Browser gespeichert (`localStorage`, Schlüssel `digifl.drives`, Format 2 mit
optionalen Feldern `severe` und `general`).

### Verkehrslage (`traffic.ts`)

Austauschbare Quelle, gewählt über `VITE_TRAFFIC_SOURCE`:

| Quelle                  | Anzeige        | Grundlage                                                                            |
| ----------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `simulation` (Standard) | „Live-Verkehr“ | Beispielwerte je Route                                                               |
| `osm`                   | „Verkehrslage“ | Schätzung aus den OSM-Daten der Strecke: Straßenklassen (`roadMix`) und Ampeln je km |

OpenStreetMap enthält keine Live-Verkehrsdaten; die OSM-Quelle schätzt die übliche Belastung und
heißt darum nicht „Live“. Ein echter Live-Dienst (z. B. TomTom Traffic Flow) lässt sich über dieselbe,
asynchrone Schnittstelle `TrafficProvider` anbinden.

### Verkehrszeichen und Icons

Nur amtliche Verkehrszeichen aus offener Quelle: SVG-Dateien von **Wikimedia Commons**, gemeinfrei
als amtliche Werke (§ 5 Abs. 1 UrhG). `npm run signs` lädt je Zeichen die neueste StVO-Fassung nach
`public/signs/`, prüft Lizenz und Inhalt (keine Skripte, Event-Handler oder externen Verweise) und
schreibt Quelle und Lizenz nach `src/signs/signSources.json`; die Liste steht in
`THIRD-PARTY-NOTICES.md`. Eingebunden werden die Dateien nur per `<img>`.

Verwendet: 102, 131, 151, 205, 206, 215, 220, 325.1, 325.2, 330.1, 350. Wo es kein amtliches Zeichen
gibt (Einfädeln auf eine Bundesstraße), steht kein Schild, sondern ein neutrales Icon.

Icons der Oberfläche stammen aus [Tabler Icons](https://tabler.io/icons) (MIT): `layout-grid`,
`route`, `swords`, `chevron-left`, `check`, `x`, `question-mark`, `lock`, `shield`, `star`, `map-pin`,
`flag`, `bulb`, `navigation`, `road`, `player-play`, `player-pause`, `stack-2`, `clock`, `circle-check`,
`alert-triangle`, `info-circle`, `device-gamepad-2`, `world`. Das Logo stammt aus der Original-Datei `digi_fl.svg` (obere Variante),
als eine bereinigte Datei `public/digifl-logo.svg` mit benannten Ausschnitten: `#icon`, `#logo` und
`#logo-dark` (helles „FL“). Andere Logo-Dateien gibt es nicht.

### Kartenmodul in der App

- **Fahrt:** `SituationMap` mit Navi-Kamera `useNavCamera` in der Ansicht 3D (`perspective`: Neigung
  60°, Zoom 17,6, Fahrzeug im unteren Drittel), Routenlinie (`route`), Punkt-Markern (`symbols`:
  amtliches Zeichen im weißen Kreis mit Nummer, aktueller Punkt mit cyan Ring) und Navigationspfeil
  (`icon: 'navigation'`).
- **Vorschau in der Level-Auswahl:** ganze Strecke eingepasst (`overviewCamera`), Lernpunkte des Levels,
  Navigationspfeil am Start; nicht interaktiv.

### Wie die Strecken entstehen (`npm run routes`)

`scripts/build-routes.mjs` erzeugt `src/data/fulda.json` einmalig; die App lädt zur Laufzeit
nichts außer den Tiles. Die Wegpunkte stehen als benannte Konstanten im Skript (`HAUPTBAHNHOF`,
`A7_RICHTUNG_WUERZBURG` …).

1. **Strecke:** OSRM-Demoserver (`router.project-osrm.org`, Profil Auto) mit Fahrzeit je Abschnitt
   und den OSM-Knoten-IDs entlang der Strecke.
2. **Ereignisse aus OSM** (Overpass): Ampeln (`highway=traffic_signals`, Fußgängerampeln),
   Stoppschilder, „Vorfahrt achten“, Zebrastreifen, Bahnübergänge, Tempolimits der befahrenen Wege.
   Richtungsangaben (`direction`, `traffic_signals:direction`) werden gegen die Fahrtrichtung geprüft;
   Schilder ohne Richtung zählen nur, wenn die nächste Kreuzung kurz dahinter liegt bzw. die eigene
   Straße die untergeordnete ist. Mehrere Ampelknoten derselben Kreuzung werden zusammengefasst.
3. **Spielstraße und Einbahnstraße:** Einfahrt in einen verkehrsberuhigten Bereich
   (`highway=living_street` → VZ 325.1), Ausfahrt daraus (Vorfahrt gewähren, „Ausnahme“) und Einfahrt
   in eine Einbahnstraße (`oneway=yes` in Fahrtrichtung → VZ 220).
4. **Rechts vor links:** Kreuzungen, an denen nur Wohnstraßen zusammentreffen, ohne Ampel/Schild in
   30 m und ohne Vorfahrtstraße. OSM ist bei Schildern nicht vollständig; solche Stellen sind darum
   ein Hinweis, keine Garantie.
5. **Manöver** aus OSRM: Abbiegen, Kreisverkehr mit Ausfahrt, Auffahrt, Einfädeln, Abfahrt.
6. **Zeitachse:** OSRM-Fahrzeit plus simulierte Wartezeiten (Ampel rot 12–35 s, Stopp 3–8 s,
   Vorfahrt gewähren, Fußgänger am Zebrastreifen, Fahrzeug von rechts). Ob eine Ampel rot ist,
   entscheidet ein fester Zufallswert je Ampel: gleiche Eingabe ergibt immer dieselbe Fahrt.

Der OSRM-Demoserver nutzt einen älteren OSM-Stand. Fehlt die Zuordnung eines Abschnitts über die
Knoten-IDs, sucht der Generator den nächstgelegenen Straßenabschnitt mit passender Richtung (≤ 6 m).
Zwischenpunkte erzwingen Strecken, die OSRM sonst meidet (Peterstor als verkehrsberuhigter Bereich).

```bash
npm run routes                              # alle Strecken neu erzeugen
npm run routes -- altstadt suedend          # nur diese, der Rest bleibt
npm run routes -- --try 9.681,50.551 9.677,50.549   # Probefahrt ausgeben, nichts speichern
```

Format je Strecke: `track` als `[lng, lat, Sekunden]` (eine Wartezeit = zwei Punkte gleicher Position),
`events` mit `t`, `kind`, `text`, optional `waitS` und Position, `roadMix` (Meter je Straßenklasse). Abgespielt wird mit
`useRouteReplay` (`src/map/useRouteReplay.ts`), dargestellt mit `SituationMap`.

Bitte die öffentlichen Dienste nur für diese einmalige Generierung nutzen; für eigene Strecken in
größerer Zahl einen eigenen OSRM-/Overpass-Server betreiben.

## Tests

- **Unit-Tests** (`npm run test`, Vitest in Node): Bewertung, Lernpunkte einer Strecke, Speicherformat
  (mit nachgebildetem `localStorage`), Verkehrslage, Mittelinsel-Erkennung, Navi-Kamera und Router.
- **Ende-zu-Ende** (`npm run e2e`, Playwright): Level → Fahrt → Auswertung → Fahrten, Zurück-Taste und
  Abbrechen, Deep Link und Neuladen, kaputte und veraltete Speicherdaten, Karte ohne Kacheln. Läuft im
  installierten Google Chrome (`channel: 'chrome'`), lädt keine Browser herunter und startet den
  Dev-Server auf Port 5192 selbst (ein laufender wird verwendet). Die Kacheln kommen dabei von OpenFreeMap.
- **`npm run check`** bündelt Lint, Typecheck, Unit-Tests und Build. Eine CI-Datei folgt, sobald das
  Hosting des Repositorys feststeht.

## Hinweise

- Jede Karte ist ein eigener WebGL-Kontext. Browser erlauben nur etwa 16 gleichzeitig; für lange
  Fragenlisten nur sichtbare Karten mounten.
- Statische Karten (`interactive={false}`) haben keine Handler und keinen Greif-Cursor.
