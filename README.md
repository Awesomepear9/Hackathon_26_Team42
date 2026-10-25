# Hackathon_26_Team42 – DigiFL

Website des DigiFL Theorie-Dungeons mit dem Praxismodul als eigenständiger App. Prototyp für den
Hackathon Fulda 2026.

- **Theorie-Dungeon** (`/`, `/uebersicht`, `/spiel`): Führerschein-Theorie lernen, indem man Zug um Zug
  durch eine zufällig erzeugte Pixel-Stadt mit Verkehr und Schildern fährt (blinken, Vorfahrt beachten,
  abwarten) und an versteckten Ereignisfeldern Fragen aus dem Team-Katalog (100 Fragen) beantwortet.
  Next.js, React, Tailwind CSS. Spielstand nur lokal im Browser.
- **Praxismodul** (`/praxismodul`): Fahrschul-App mit Kartenmodul – echte Straßensituationen in Fulda
  aus OpenStreetMap. Eigenständiges Vite-Projekt in [`apps/praxismodul`](apps/praxismodul), das die
  Website unter `/apps/praxismodul/` ausliefert und auf der Praxismodul-Seite einbettet.

## Starten

```bash
npm install
npm run dev     # baut das Praxismodul beim ersten Start, dann http://localhost:3000
npm run build   # baut Praxismodul und Website
npm run lint
```

Das Praxismodul lässt sich auch allein entwickeln: `npm run praxismodul:dev` (Details in
[`apps/praxismodul/README.md`](apps/praxismodul/README.md)). Nach Änderungen daran baut
`npm run praxismodul:build` die eingebettete Fassung neu.

## Spiellogik (`src/lib/dungeon/`)

- `engine.ts` – Platzhalter für die WebAssembly-Spiellogik: `Engine.generate_board`, `Engine.new_game`,
  `Engine.update`; Datenformate (Board, TileType, Input, GameState) sind dort dokumentiert. Zum Einbinden
  des WASM-Moduls nur diese drei Funktionen ersetzen.
- `city.ts` – Frontend-Seite: Verkehrszeichen (`board.signs`), versteckte Ereignisse, Tile-Auswahl
- `session.ts` – Spielsitzung: Züge, Blinker, Fragen, Fehlerpunkte, Ende des Runs
- `fragen.ts` – die 100 Fragen des Teams plus Parser, `catalog.ts` – Katalogbereiche und Themen-Pools

## Logo

Einzige Logo-Datei ist `public/digifl-logo.svg` (aus `digi_fl.svg`) mit den Ausschnitten `#logo`,
`#logo-dark` und `#icon`; das Praxismodul hat eine identische Kopie in `apps/praxismodul/public/`.
