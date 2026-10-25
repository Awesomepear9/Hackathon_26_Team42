# digi-fl-crawler – Spiellogik in Rust

Quellcode der Spiellogik des Theorie-Dungeons (Stand: `digi-fl-crawler-main`, unverändert übernommen).
Er soll später als WebAssembly-Modul die Platzhalter-Engine der Website ersetzen
([`src/lib/dungeon/engine.ts`](../src/lib/dungeon/engine.ts)).

## Inhalt

- `src/lib/game/` – Bibliothek `game`: Karte (`map.rs`, Generator aus einem Seed, `MAP_SIZE` 19), Felder
  (`tile.rs`, `TileType` Road/Grass), Position, Eingabe (Fahrtrichtung + Blinker), Spielzustand
  (`gamestate.rs`, `GameState::update`) und Fahrfehler (`driver_error.rs`)
- `src/mapgen_main.rs` – erzeugt eine Karte und gibt sie als Text aus
- `src/movement_main.rs` – Bewegung im Terminal ausprobieren (`north|south|east|west|wait [left|right]`, `exit`)

## Stand

- Noch ohne `Cargo.toml`; genutzt werden die Crates `rand` und `anyhow`.
- Die Blinker-Prüfung in `GameState::update` ist noch auskommentiert.

## Ziel-Schnittstelle für die Website

Die Website ruft nur drei Funktionen auf; Datenformate (Board, TileType, Input, GameState) stehen in
[`src/lib/dungeon/engine.ts`](../src/lib/dungeon/engine.ts):

    Engine.generate_board(difficulty, seed)    -> Board
    Engine.new_game(board, difficulty, seed)   -> GameState
    Engine.update(board, gameState, input)     -> GameState

Abweichungen zum jetzigen Rust-Stand, die beim Anbinden zu klären sind: Die Website erwartet
`{ "Road": { up, down, left, right } }` (hier `north/south/west/east`), Richtungen als
`North|East|South|West|None` und einen Blinker `Left|Right|Straight|Backwards`; die Kartengröße liest sie
aus dem Board (bisher bis 25 Felder für „Schwer“).
