# Todo: App an die Entwürfe anpassen

Grundlage: vier Entwürfe (Fahrten, Fahrt abgeschlossen, Fahrt läuft, LvL Auswahl), mobil, 360 px breit.
Ziel: Aus der bisherigen Demo-Seite (Szenario-Tabs) wird eine mobile App mit diesen vier Screens.
Karte, Fulda-Strecken, Wiedergabe und Symbole werden weiterverwendet.

## Analyse der Entwürfe

**Allgemein**

- Hintergrund navy-50 (#f5f7fa), Karten weiß, `rounded-3xl`, flacher Schatten (`shadow-card`)
- Überschriften Inter Bold navy-900; Abschnittstitel als Versal-Caption mit Sperrung, navy-500
  („DEINE FAHRTEN“, „LERNTHEMEN“, „DU ACHTEST DARAUF“)
- Farben ausschließlich aus der DigiFL-Palette: navy-900, cyan-500/100/50, green-500, red-500, amber-500
  und deren helle Flächen (green-50, red-50, amber-50). Abweichungen: Hellblau der Routenlinie im
  Kartenentwurf (#4fc3f7) und Verkehrszeichen-Blau.
- Logo oben rechts (App-Icon: Straße mit Standort-Pin, Cyan-Verlauf)
- Untere Navigation: schwebende weiße Pille mit Schatten; Icons `layout-grid`, `route` (aktiv: cyan-100-Pille
  mit Label „Fahrten“), `swords`, Avatar-Kreis navy-900 mit Initialen „AB“ – Icons sind Tabler Icons
- Mobil-zentriert: auf breiten Bildschirmen schmale Spalte (max. ca. 420 px)

**Screen 1 – Fahrten**

- Titel „Fahrten“ + Logo
- Summenkarte navy-900: „GESAMT“ (cyan-500), „389 km“, „12 Fahrten“ (navy-300), Fortschrittsbalken
  cyan-500 auf navy-700, „von 1.000 km · 39 %“
- Liste „DEINE FAHRTEN“: Karte je Fahrt mit Datums-Badge (cyan-100, Wochentag cyan-700, Tag fett),
  Titel (Lernthema), „Level 2 · 23 km · 45 Min“, Stern amber-500 + Note; neueste Fahrt mit cyan-500-Rahmen

**Screen 2 – Fahrt abgeschlossen**

- Kopfkarte cyan-100 mit cyan-200-Rahmen: Logo, „FAHRT ABGESCHLOSSEN“, Note „7,5 / 10“,
  10 Sterne (amber-500, halbe Sterne möglich, leere Sterne blasses Cyan), „Level 2 · Rechts vor Links · 23 km“
- „DEIN WEG ZU 1.000 KM“: Prozent-Chip, „412 km von 1.000 km“, geschwungene Straße als Fortschritt
  (cyan-500 gefahren, grau offen, weiße Mittellinie gestrichelt), Pin navy-900 an der aktuellen Stelle,
  Zielflagge, „0 km“ / „Noch 588 km“
- Tempo-Karte: „Du hast dich zu **89 %** an die vorgegebenen Geschwindigkeitsbegrenzungen gehalten.“
  Diagramm über die Strecke (km): erlaubt als Treppenlinie navy-900, eigenes Tempo cyan-500, über dem
  Limit red-500; Achsen 30/50 bzw. km; Legende
- „HIER NOCHMAL ÜBEN“: Einträge mit rundem Symbol (✗ auf red-50, ? auf amber-50), Titel des
  Prüfpunkts, „Rechts vor Links · nicht gemacht / nicht gesehen“
- „TIPP FÜR NÄCHSTES MAL“: Karte mit Tipp (im Entwurf abgeschnitten)

**Screen 3 – Fahrt läuft**

- Kopf: Zurück-Button (weißer Kreis, Chevron), Uhrzeit-Pille cyan-100 („12:40“), Logo
- Karte: Route als Linie, nummerierte Punkte als Verkehrszeichen in weißem Kreis mit Nummern-Badge
  (navy-900), aktueller Punkt mit cyan-Ring; eigenes Fahrzeug als Navigationspfeil in hellem Kreis;
  Pille unten „● Nächster Punkt · 150 m“
- Karte des aktuellen Punkts (cyan-100, cyan-200-Rahmen): Verkehrszeichen, „102 · PUNKT 1 VON 3“,
  Titel „Rechts vor Links“, Entfernungs-Chip „150 m“, „Regel …“, „Fahrschüler …“
- „DU ACHTEST DARAUF“: Prüfpunkte mit je drei Buttons ✓ / ✗ / ? (gewählt: green-500, red-500, amber-500
  gefüllt; sonst weiß mit Rahmen), Trennlinien, Legende „gemacht / nicht gemacht / nicht gesehen“
- Darunter die nächsten Punkte: Verkehrszeichen, „325 · Spielstraße“, „Ausnahme · Schritttempo“,
  Chip „Punkt 2“ (amber-50 / amber-700)

**Screen 4 – LvL Auswahl**

- Kopf: Zurück-Button, Titel „LvL Auswahl“, Logo
- Level-Karten: abgeschlossen (grünes Schild-Icon mit Nummer, „Abgeschlossen“, Chip „100 %“ green),
  aktiv aufgeklappt (cyan-Rahmen, cyan-Schild, „LEVEL 2“, Titel, Fortschrittsbalken, „64 %“, Chevron),
  gesperrt (graue Fläche, Schloss-Icon, „Beende erst 1 Fahrt aus Level 2“)
- Aufgeklappt: „LERNTHEMEN“ als Chips (cyan-100), „● ROUTEN · LIVE-VERKEHR“, Routen A/B/C mit Länge,
  Beschreibung und Verkehrs-Chip (ruhig green / mittel amber / voll red), gewählte Route cyan hinterlegt,
  Button „Route A starten“ (cyan-500, volle Breite)

## Entscheidungen

- **Verkehrslage:** austauschbare Quelle (`TrafficProvider`). Aktiv: Beispielwerte der Simulation
  (Anzeige „Live-Verkehr“ wie im Entwurf). Für den Produktivbetrieb vorbereitet: Schätzung aus
  OpenStreetMap-Straßendaten (Straßenklassen, Ampeln je km) – OSM hat keine Live-Verkehrsdaten,
  darum heißt die Anzeige dort „Verkehrslage“. Echte Live-Daten (z. B. TomTom) über dieselbe Schnittstelle.
- **Navigation:** Raster = LvL Auswahl (Startseite), Fahrten = Fahrtenliste, Schwerter und Avatar
  sichtbar, aber ohne Funktion („bald verfügbar“).
- **Fahrtmodus:** Simulation der Fulda-Strecken.
- **Logo:** als SVG nachgebaut, später gegen das Original tauschbar.

## Todo

### 1. Grundgerüst

- [x] App-Shell: mobile Spalte, Hintergrund navy-50, Platz für die untere Navigation
- [x] Navigation zwischen den Screens (Zustand + Verlauf für den Zurück-Button)
- [x] Untere Navigation nach Entwurf (Tabler `layout-grid`, `route`, `swords`, Avatar), aktiver Eintrag als Pille
- [x] Kopfzeilen-Komponenten: Seitentitel mit Logo; Zurück-Button; Uhrzeit-Pille
- [x] Logo als SVG (Straße + Pin, Cyan-Verlauf) bzw. Original-Datei einbinden
- [x] Wiederverwendbare Bausteine: Karte, Abschnittstitel, Chip, Fortschrittsbalken, Sterne-Bewertung, Schild-Badge (Level)

### 2. Verkehrszeichen und Icons

- [x] Verkehrszeichen als SVG im Stil des Entwurfs (flach, abgerundet) mit VZ-Nummer:
      102 Rechts vor links, 205 Vorfahrt gewähren, 206 Halt/Stopp, 306 Vorfahrtstraße,
      301 Vorfahrt an der nächsten Kreuzung, 325.1 Verkehrsberuhigter Bereich (Spielstraße),
      220 Einbahnstraße, 274 Tempo (mit Zahl), 350 Fußgängerüberweg, 215 Kreisverkehr,
      131 Lichtzeichenanlage, 151 Bahnübergang, 330.1 Autobahn
- [x] Zuordnung Ereignisart → Verkehrszeichen bzw. Tabler-Icon (Abbiegen, Weiterfahren, Start/Ziel)
- [x] Karten-Marker für Punkte: Zeichen im weißen Kreis, Nummern-Badge, aktiver Punkt mit cyan-Ring
- [x] Fahrzeug als Navigationspfeil (Tabler `navigation`), gedreht nach Fahrtrichtung
- [x] Routenlinie im Stil des Entwurfs (in cyan-600 aus der Palette statt des Hellblaus aus dem Kartenentwurf)
- [x] Bisherige Symbol-Plaketten durch die neuen Zeichen ersetzen (Liste und Karte), Lizenzhinweise aktualisieren

### 3. Inhalte und Daten

- [x] Level-Modell: 1 Vorfahrt, 2 Rechts vor Links, 3 Ampeln & Spuren, 4 Parken & Manöver, 5 Kombifahrten;
      Lernthemen je Level (z. B. Level 2: 102 Rechts vor Links, Ausnahmen, 325 Spielstraße, 220 Einbahnstraße)
- [x] Lernpunkte je Verkehrszeichen: Regel, Erwartung an Fahrschüler, Prüfpunkte („Du achtest darauf“), Tipp
- [x] Fulda-Strecken den Leveln/Routen A–C zuordnen; Punkte einer Fahrt = Zeichen auf der Strecke, die zum Level gehören
- [x] Generator erweitern: verkehrsberuhigte Bereiche (`highway=living_street` → 325.1) und
      Einbahnstraßen (`oneway=yes` beim Einfahren → 220) als Ereignisse; Strecken neu erzeugen
- [x] Verkehrslage je Route (ruhig / mittel / voll) – Quelle siehe offene Fragen
- [x] Fahrten-Verlauf (vergangene Fahrten, km, Dauer, Note) und Gesamt-km als Beispieldaten,
      neue Fahrten werden angehängt (lokal gespeichert)

### 4. Screen „LvL Auswahl“

- [x] Level-Karten in drei Zuständen (abgeschlossen, aktiv/aufgeklappt, gesperrt) mit Schild-Icon
- [x] Lernthemen-Chips, Routenliste mit Verkehrs-Chip, Auswahl einer Route
- [x] „Route X starten“ öffnet „Fahrt läuft“

### 5. Screen „Fahrt läuft“

- [x] Kopf mit Zurück, Uhrzeit, Logo
- [x] Karte (bestehende `SituationMap`) mit Route, nummerierten Punkten und Navigationspfeil;
      Ansicht Fahrtrichtung oben
- [x] Pille „Nächster Punkt · X m“ (Entfernung entlang der Strecke)
- [x] Karte des aktuellen Punkts mit Regel, Fahrschüler-Text, Entfernung
- [x] Prüfpunkte mit ✓ / ✗ / ? (Toggle, Tastatur, `aria-pressed`), Legende
- [x] Liste der folgenden Punkte mit Zeichen und „Punkt n“-Chip
- [x] Fahrt endet am Ziel bzw. per „Fahrt beenden“ → „Fahrt abgeschlossen“

### 6. Screen „Fahrt abgeschlossen“

- [x] Note aus Prüfpunkten und Tempo-Einhaltung, 10 Sterne mit halben Sternen
- [x] „Dein Weg zu 1.000 km“ als geschwungene Straße mit Pin und Flagge
- [x] Tempo-Diagramm (SVG): erlaubt vs. gefahren über km, Überschreitungen rot, Prozentwert
- [x] „Hier nochmal üben“ aus ✗ und ? der Fahrt
- [x] „Tipp für nächstes Mal“ aus dem schwächsten Punkt
- [x] Fahrt in den Verlauf übernehmen

### 7. Screen „Fahrten“

- [x] Summenkarte mit Gesamt-km, Anzahl Fahrten, Fortschritt zu 1.000 km
- [x] Fahrtenliste mit Datums-Badge, Titel, Level · km · Min, Note; neueste hervorgehoben
- [x] Tippen auf eine Fahrt öffnet ihre Auswertung

### 8. Qualität

- [x] Barrierefreiheit: Überschriften-Hierarchie, `aria-label` für Icon-Buttons, Fokus-Ringe,
      Kontrast der hellen Flächen, `prefers-reduced-motion`
- [x] Dark Mode für alle Screens (Entwürfe sind hell; dunkle Variante aus der Palette ableiten)
- [x] ESLint, Prettier, Typecheck, Build ohne Befund
- [x] Prüfung in headless Chrome auf 360 px und Desktop, hell und dunkel; Screenshots mit Entwurf vergleichen
- [x] README: Screens, Datenquellen, was echt und was simuliert ist

## Offen

- Screens für „Duelle“ (Schwerter) und Profil (Avatar): keine Entwürfe, in der Navigation als „bald verfügbar“
- Routen für Level 4 (Parken & Manöver) und Level 5 (Kombifahrten)
- Echte Live-Verkehrsdaten: Schnittstelle vorhanden, Anbindung an einen Verkehrsdienst fehlt
- Original-Logo als Datei (derzeit SVG-Nachbau)
