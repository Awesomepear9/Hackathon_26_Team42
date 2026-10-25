# Audit: offene Punkte

Stand 25.10.2026: Commit `7f4381c` plus nicht committete Änderungen (Mobil-Layout, Übersicht, Logo,
Bewertung nach Katalog). Geprüft mit `npm run check` (ESLint, TypeScript strict, 118 Unit-Tests,
Build), Playwright-E2E (7), `npm audit`, `npm outdated`, axe-core 4.10 (WCAG 2.1 AA + Best Practices,
hell und dunkel, 390 px: Übersicht, LvL Auswahl, Fahrten, Fahrt, Fahrverhalten-Dialog, Auswertung),
iPhone-16e-Simulator (Safari), Auswertung der Tempo-Regel über alle Strecken (200 simulierte Fahrten je
Strecke), Durchsicht von Code, Daten, Doku und Abgleich mit den Vorgaben „Logik_Bewertung_NEU“ und
„Logik_Zusammenfassung LVL-Anforderungen + Prüfschritte“.

**Ohne Befund:** ESLint, TypeScript, Prettier, Build, `npm audit` (0 Schwachstellen), axe auf allen
Screens hell und dunkel, verschachtelte Dialoge (Schwerfehler-Katalog im Fahrverhalten-Dialog), kein
horizontales Scrollen, Favicon vorhanden.

Priorität: **P0** sofort · **P1** vor einer Veröffentlichung · **P2** Qualität · **P3** später.
Aufwand: S ≤ 2 h, M ≤ 1 Tag, L > 1 Tag. **Entscheidung** = fachliche Klärung nötig, nicht nur Code.

## Abgleich mit dem Bewertungskatalog

| Vorgabe                                                                      | Stand                                                                                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Kriterien je Fahraufgabe, je −1 bei Nichterfüllung                           | umgesetzt (Texte aus „Logik_Bewertung_NEU“)                                                                                    |
| Eine Schwerfehler-Abfrage je Aktion, Ja = Aktion 0 ohne −1                   | umgesetzt (Ja/Nein unten in der Aufgabenkarte, angeheftet)                                                                     |
| Allgemeines Fahrverhalten getrennt, je Kriterium −1                          | umgesetzt (Dialog bei „Fahrt beenden“)                                                                                         |
| Geschwindigkeit per App (+3 km/h, 3 s Toleranz)                              | umgesetzt auf simulierten Tempodaten                                                                                           |
| Schwerfehler-Abfrage im Fahrverhalten                                        | umgesetzt; ab 5 km/h über Limit nur **Hinweis**, keine Automatik                                                               |
| Gesamtleistung 1–5 Sterne ohne Fehlerwert                                    | umgesetzt, nur Anzeige in der Auswertung                                                                                       |
| Schwerfehler-Katalog                                                         | umgesetzt (Hilfe „i“ an jeder Abfrage)                                                                                         |
| Gesamtpunkte = 0,5 · Fahrverhalten + 0,5 · (Aktion · x)                      | umgesetzt mit x = Mittelwert der Aktionen (**Entscheidung**, s. u.)                                                            |
| Level bestanden, wenn kein *0                                                | umgesetzt **zusätzlich** zu ≥ 8,0 Sternen (**Entscheidung**)                                                                   |
| Level 1: 205, 206                                                            | umgesetzt; 206 kommt in keiner Strecke vor; zusätzlich Kreisverkehr                                                            |
| Level 2: 102, Ausnahmen, 325, 220                                            | umgesetzt; „Ausnahmen“ an „Ende verkehrsberuhigter Bereich“                                                                    |
| Level 3: Ampelkreuzung, Pfeilampeln, 720, Spurwechsel, Einordnen             | Ampelkreuzung, Spurwechsel (Einfädeln); **fehlt:** Pfeilampeln, Grünpfeil, Einordnen und Abbiegen; zusätzlich Fußgängerüberweg |
| Level 4: Einparken, Wenden, Gefahrenbremsung, 151, abknickende Vorfahrt, 267 | nur als Lernthemen, **ohne Strecken und Kriterien in der App**                                                                 |
| Level 5: Kombinationsfahrten                                                 | nur als Lernthema                                                                                                              |
| Prüfung mit 5 Stufen (doppelt grün, grün, gelb, rot, blau)                   | **fehlt** (Prüfungssimulation „bald verfügbar“)                                                                                |
| Wiki für Eltern                                                              | **fehlt**                                                                                                                      |

## Erledigt (Kurzfassung)

- **P0:** eigenes Repository (`main`, ohne Remote), MapLibre 6 (Sicherheitslücke), Speicherdaten
  versioniert und geprüft, Fehlergrenzen, Lizenzhinweise im Build, Inter-OFL, ODbL der Strecken.
- **P1:** Hash-Routing mit Browser-Zurück und Deep Links, Fahrt übersteht Neuladen, Abbrechen fragt nach,
  Speicherfehler gesichert, Kontraste, Pause/Tempo, reduzierte Bewegung, Fokus und Ansagen,
  Fehlerzustand ohne Kacheln, Unit- und E2E-Tests, `npm run check`.
- **Seit dem letzten Audit:**
  - Mobil-Layout mit Safe Area; Navigation unter dem Inhalt statt darüber.
  - Fahrt: Karte und Aufgaben ohne Scrollen auf einer Bildschirmhöhe.
  - Zurück-Buttons auf Fahrten und Auswertung.
  - Wartezeiten gekürzt (höchstens 8 s), mit Anzeige von Grund und Countdown.
  - Übersicht als Startseite.
  - Original-Logo, Favicon.
  - Klick- und Hover-Zustände.
  - Bewertung nach Katalog.

## P0 – sofort

- [ ] **Nicht committet** (S) – 38 geänderte bzw. neue Dateien seit `7f4381c`, nur lokal und ohne
      Remote. Ein Plattendefekt oder versehentliches Zurücksetzen verliert alles. → Committen, Remote anlegen.

## P1 – vor einer Veröffentlichung

**Bewertung (fachlich)**

- [ ] **Simuliertes Tempo passt nicht zur neuen Regel** (S, **Entscheidung**) – Die Simulation fährt
      bis zu 8 % über dem Limit. Damit greift die Tempo-Regel fast immer:

      | Strecke     | Tempo-Kriterium nicht erfüllt | Schwerfehler-Hinweis |
      | ----------- | ----------------------------: | -------------------: |
      | A7          |                         100 % |                 96 % |
      | Bronnzell   |                         100 % |                 64 % |
      | Hochschule  |                          72 % |                  0 % |
      | Südend      |                          69 % |                  0 % |
      | Innenstadt  |                          48 % |                  0 % |
      | Altstadt    |                           0 % |                  0 % |

      → Fahrverhalten so einstellen, dass Überschreitungen selten sind, z. B. ±3 km/h statt ±12 % mit
      gelegentlichen Ausreißern. Festlegen, wie oft der simulierte Fahrer zu schnell sein soll.

- [ ] **Fahrt ohne Bewertung ergibt volle Punkte** (S, **Entscheidung**) – Ohne bewertete Kriterien
      stehen die Fahraufgaben bei 100 % („initialisiere mit 100 %“). Wer nichts bewertet, bekommt bis
      zu 10 Sterne und kann ein Level bestehen. → Mindestanteil bewerteter Aufgaben fordern oder
      unbewertete Fahrten nicht zum Bestehen zählen.
- [ ] *_Bestehen = ≥ 8,0 Sterne und kein *0*_ (S, **Entscheidung**) – Die Vorgabe nennt nur „kein *0“.
      Die bisherige Schwelle von 8,0 Sternen ist beibehalten. → Bestätigen oder auf „kein *0“ reduzieren.
- [ ] **„Aktion · x“** (S, **Entscheidung**) – Der Faktor x ist nicht definiert; umgesetzt als Mittelwert
      aller bewerteten Aktionen (jede Aktion gleich gewichtet). → Gewichtung je Aufgabe festlegen, falls gewünscht.
- [ ] **Kreisverkehr und Fußgängerüberweg ohne Katalog** (S, **Entscheidung**) – Beide sind in Level 1
      bzw. 3 enthalten, stehen aber nicht im Katalog; ihre Kriterien sind vorläufig (alte App-Texte).
      Ohne Kreisverkehr hätte Route 1A (Bronnzell) keine einzige Aufgabe. → Kriterien ergänzen oder
      Themen und Routen umstellen.
- [ ] **Fehlende Level-3-Aufgaben** (M) – Pfeilampeln, Grünpfeil (720) sowie Einordnen und Abbiegen sind
      im Katalog, aber nicht in den Streckendaten erkennbar. → Generator (`scripts/build-routes.mjs`)
      erweitern: Abbiegespuren, `traffic_signals:arrow`, Zeichen 720 aus OSM.
- [ ] **206 kommt nicht vor** (S) – Keine der sechs Strecken enthält ein Stoppschild; Level 1 prüft
      206 damit nie. → Strecke mit Stoppschild ergänzen.
- [ ] **„?“ heißt in der App „nicht gesehen“** (S) – Laut Vorgabe bedeutet Blau „war nicht da,
      konnte nicht bewertet werden“. In der Übungsliste steht schon „nicht bewertbar“, in der Fahrt noch
      „nicht gesehen“. → Einheitlich benennen.
- [ ] **Alte Noten ändern sich** (S) – Gespeicherte Fahrten werden neu berechnet: Das Tempo zählt nicht
      mehr, und Fahrten ohne Fahrverhalten zählen nur die Fahraufgaben. Ein Level kann dadurch nachträglich
      als bestanden oder nicht bestanden gelten. → Akzeptieren oder alte Noten einfrieren.

**Betrieb**

- [ ] **Dienste-Abhängigkeit** (M, **Entscheidung**) – OpenFreeMap (Fair-Use, ohne SLA), OSRM-Demo und
      öffentliche Overpass-Instanzen im Generator. → Eigene Kacheln (PMTiles) und Routing-Instanz.
- [ ] **Keine CI** (S) – `npm run check` und `npm run e2e` sind vorbereitet. → CI-Datei, sobald die
      Remote feststeht.

## P2 – Qualität

**Bedienung**

- [ ] **Lange Kriterientexte** (S) – Die Katalogtexte sind zwei- bis dreizeilig; die Aufgabenkarte
      scrollt auf dem iPhone 16e schon bei 3–4 Kriterien innen (die Schwerfehler-Abfrage bleibt sichtbar).
      → Kurzfassung für die Fahrt (z. B. die konkreten Fragen aus der „Zusammenfassung“), Langtext als Hilfe.
- [ ] **Dichte Punkte** (S) – Altstadt: 8 Aufgaben auf 0,6 km, 4 Abstände unter 40 m; Hochschule in
      Level 2: 12 Aufgaben, 5 unter 40 m. Kaum Zeit zum Bewerten. → Zusammenfassen oder Routen anpassen.
- [ ] **Safari-Leiste klappt nicht ein** (S) – Folge der festen Navigation (nur der Inhalt scrollt);
      Tippen auf die Statusleiste scrollt nicht nach oben. → Akzeptieren oder als PWA ohne Browserleiste.
- [ ] **Geräte** (S) – Geprüft auf iPhone 16e (Simulator) und Desktop-Chrome; iPhone 16 (Dynamic Island),
      Android, Querformat der Fahrt und echte Geräte fehlen.
- [ ] **Platzhalter** (S) – Profilname „Alex“, Initialen „AB“; „Freie Fahrt“, „Prüfungssimulation“,
      „Duelle“ und Profil ohne Funktion.

**Leistung**

- [ ] **Bundle 1,48 MB (414 kB gzip)** (S) – MapLibre lädt schon auf der Übersicht. → `React.lazy` für
      Karten-Screens.
- [ ] **Neurendern pro Frame** (M) – Der Fahrt-Screen rendert während der Wiedergabe bis zu 60-mal pro
      Sekunde komplett, inklusive Checkliste und Marker-Liste. → Karte/Wiedergabe entkoppeln, `memo`.

**Code**

- [ ] **Ungenutzter Code** (S) – `LiveSituationMap`, `useLivePosition`, `useInView`, `NAV_VIEWS`,
      `SIGN_SOURCES`, `ROUTES_SOURCE`.
- [ ] **Import-Zyklus** (S) – `generalBehavior.ts` ↔ `driveStorage.ts` (über `parseAnswers`); funktioniert,
      ist aber fehleranfällig. → `parseAnswers` in ein eigenes Modul.
- [ ] **Farben doppelt gepflegt** (S) – Hex-Werte in `palette.ts`, `vehicleMarker.ts`, `pointMarker.ts`,
      `RoadProgress.tsx` neben dem Theme.
- [ ] **Dev-Hilfe wächst** (S) – `window.__maps` behält entfernte Karteninstanzen.
- [ ] **Abhängigkeiten** (M) – Neue Hauptversionen: vite 8, @vitejs/plugin-react 6, typescript 7,
      eslint 10, pbf 5, @mapbox/vector-tile 3.
- [ ] **Testlücken** (S) – `useRouteReplay`, Abschluss-Dialog (Tempo-Anzeige, Hinweis) und
      Schwerfehler-Katalog nur indirekt bzw. gar nicht getestet.

**Daten und Doku**

- [ ] **Beispielfahrt in der Zukunft** (S) – Die jüngste Beispielfahrt liegt auf „heute 16:30“.
- [ ] **„Live-Verkehr“ bei Beispieldaten** (S) – Simulation trägt die Überschrift „Live-Verkehr“.
- [ ] **Datenqualität OSM** (S) – „Rechts vor links“ ist eine Heuristik; Ampelphasen, Wartezeiten,
      Fahrverhalten und Verkehrslage sind simuliert. In der App kennzeichnen.
- [ ] **Doku veraltet** (S) – `docs/TODO-app-design.md` beschreibt den Stand vor der App.
- [ ] **Logo Dark Mode** (S, **Entscheidung**) – „FL“ ist in der Dark-Variante selbst aufgehellt
      (Ausschnitt `#logo-dark` in `public/digifl-logo.svg`); vom Design bestätigen lassen oder eine offizielle Variante liefern.

**Abweichungen vom Entwurf (zur Abstimmung)**

- [ ] Fahrt ohne untere Navigation; Karte so groß wie der freie Platz (mindestens 9rem).
- [ ] Zeichen 102 amtlich mit schrägem Kreuz statt „+“.
- [ ] Ergänzt: „Bald verfügbar“ an Freie Fahrt und Prüfungssimulation, „Weitere Punkte“,
      Routenvorschau, bestanden/nicht bestanden in der Auswertung.

## P3 – später

- [ ] **Prüfungssimulation** (L) – Fünfstufige Bewertung laut Vorgabe (doppelt grün, grün, gelb, rot, blau).
- [ ] **Level 4 und 5** (L) – Grundfahraufgaben sind auf einer Karte schwer zu simulieren; Kriterien
      liegen im Katalog vor.
- [ ] **Wiki für Eltern** (M) – laut „Zusammenfassung“ geplant.
- [ ] **Freie Fahrt, Duelle, Profil** (L) – keine Entwürfe.
- [ ] **Echtes GPS** (L) – auch Voraussetzung, damit die Tempo-Regel echte Geschwindigkeiten bewertet.
- [ ] **Echte Verkehrslage** (M) – Schnittstelle `TrafficProvider` vorhanden.
- [ ] **Konten und Synchronisation** (L) – Fahrten nur lokal; Rollen Fahrschüler, Begleitperson, Fahrlehrer.
- [ ] **PWA/Offline** (M) – Manifest, Icons, Kacheln und Zeichen offline.
