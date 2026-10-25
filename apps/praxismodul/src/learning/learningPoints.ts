// Lernpunkte (Fahraufgaben): Was an einem Verkehrszeichen bzw. einer Situation gilt und worauf die
// Begleitperson achtet. Die Bewertungskriterien folgen dem Katalog „Logik_Bewertung_NEU“ (je
// Kriterium −1 bei Nichterfüllung, eine Schwerfehler-Abfrage je Aktion). Kreisverkehr und
// Fußgängerüberweg stehen nicht im Katalog; ihre Kriterien sind vorläufig (siehe docs/AUDIT).
import type { RouteEvent } from '../data/routes'
import type { TrafficSignId } from '../signs/trafficSigns'

export type PointKind =
  | 'rechts-vor-links'
  | 'vorfahrt-achten'
  | 'stopp'
  | 'kreisverkehr'
  | 'spielstrasse'
  | 'spielstrasse-ende'
  | 'einbahnstrasse'
  | 'ampel'
  | 'zebrastreifen'
  | 'bahnuebergang'
  | 'einfaedeln'

export interface Check {
  id: string
  /** Frage in der Fahrt („Blick nach rechts?“) */
  question: string
  /** Übungsauftrag in der Auswertung („Nach rechts schauen“) */
  practice: string
}

export interface LearningPointType {
  kind: PointKind
  sign: TrafficSignId
  title: string
  /** Einordnung + Kurzhinweis, z. B. „Ausnahme · Schritttempo“ */
  hint: string
  rule: string
  student: string
  checks: Check[]
  tip: string
}

const check = (id: string, question: string, practice: string): Check => ({ id, question, practice })

export const LEARNING_POINTS: Record<PointKind, LearningPointType> = {
  'rechts-vor-links': {
    kind: 'rechts-vor-links',
    sign: '102',
    title: 'Rechts vor Links',
    hint: 'Kreuzung · ohne Beschilderung',
    rule: 'Wer von rechts kommt, hat Vorfahrt.',
    student: 'Passt das Tempo an und lässt Fahrzeuge von rechts durch.',
    checks: [
      check(
        'tempo',
        'Geschwindigkeit situationsgerecht angepasst?',
        'Tempo vor der Kreuzung anpassen, bremsbereit sein',
      ),
      check('blick', 'Vorfahrtsrelevanten Verkehr rechtzeitig beobachtet?', 'Rechtzeitig nach rechts schauen'),
      check('durchlassen', 'Vorfahrtsberechtigten Verkehr berücksichtigt?', 'Fahrzeuge von rechts durchlassen'),
      check('anhalten', 'Bei Bedarf rechtzeitig angehalten?', 'Bei Bedarf anhalten'),
      check('einfahren', 'Kreuzung sicher und situationsgerecht befahren?', 'Bei freier Kreuzung vorsichtig einfahren'),
    ],
    tip: 'Schon vor der Kreuzung vom Gas gehen und nach rechts schauen – dann bleibt genug Zeit zum Anhalten.',
  },
  'vorfahrt-achten': {
    kind: 'vorfahrt-achten',
    sign: '205',
    title: 'Vorfahrt gewähren',
    hint: 'Wartepflicht · Querverkehr hat Vorfahrt',
    rule: 'Der Verkehr auf der kreuzenden Straße hat Vorfahrt.',
    student: 'Verringert früh das Tempo und wartet, bis die Straße frei ist.',
    checks: [
      check(
        'erkannt',
        'Verkehrszeichen rechtzeitig wahrgenommen und richtig interpretiert?',
        'Schild früh erkennen und einordnen',
      ),
      check(
        'tempo',
        'Geschwindigkeit und Anhalten situationsgerecht angepasst?',
        'Früh vom Gas gehen, bei Bedarf anhalten',
      ),
      check('vorfahrt', 'Vorfahrtsregelung korrekt umgesetzt?', 'Querverkehr Vorfahrt lassen'),
    ],
    tip: 'Erst an der Sichtlinie langsam herantasten, dann entscheiden – nicht an der Haltlinie stehen bleiben, wenn man nichts sieht.',
  },
  stopp: {
    kind: 'stopp',
    sign: '206',
    title: 'Halt. Vorfahrt gewähren',
    hint: 'Haltpflicht · immer anhalten',
    rule: 'An der Haltlinie vollständig anhalten, dann Vorfahrt gewähren.',
    student: 'Hält an der Haltlinie an, auch wenn die Straße frei ist.',
    checks: [
      check(
        'erkannt',
        'Verkehrszeichen rechtzeitig wahrgenommen und richtig interpretiert?',
        'Stoppschild früh erkennen',
      ),
      check(
        'stillstand',
        'Vorgeschriebenen Halt vollständig ausgeführt?',
        'An der Haltlinie ganz zum Stillstand kommen',
      ),
      check('verkehr', 'Verkehrslage ausreichend geprüft?', 'Nach links und rechts schauen'),
      check('vorfahrt', 'Vorfahrtsregelung korrekt umgesetzt?', 'Querverkehr Vorfahrt lassen'),
    ],
    tip: 'Beim Stoppschild zählt der Stillstand: kurz „eins, zwei“ zählen, dann erst schauen und anfahren.',
  },
  kreisverkehr: {
    kind: 'kreisverkehr',
    sign: '215',
    title: 'Kreisverkehr',
    hint: 'Vorfahrt im Kreis · rechts blinken beim Ausfahren',
    rule: 'Wer im Kreis fährt, hat Vorfahrt. Beim Einfahren nicht blinken, beim Ausfahren rechts blinken.',
    student: 'Lässt den Verkehr im Kreis durch und blinkt erst vor der Ausfahrt.',
    checks: [
      check('vorfahrt', 'Verkehr im Kreis durchgelassen?', 'Verkehr im Kreis Vorfahrt lassen'),
      check('nicht-blinken', 'Beim Einfahren nicht geblinkt?', 'Beim Einfahren nicht blinken'),
      check('blinken', 'Beim Ausfahren rechts geblinkt?', 'Beim Ausfahren rechts blinken'),
      check(
        'fussgaenger',
        'An der Ausfahrt auf Fußgänger und Radfahrer geachtet?',
        'An der Ausfahrt auf Fußgänger achten',
      ),
    ],
    tip: 'Den Blinker erst setzen, wenn die Ausfahrt vor dem Fahrzeug liegt – so wissen alle, wohin es geht.',
  },
  spielstrasse: {
    kind: 'spielstrasse',
    sign: '325.1',
    title: 'Verkehrsberuhigter Bereich',
    hint: 'Ausnahme · Schritttempo',
    rule: 'Schrittgeschwindigkeit. Kinder dürfen überall spielen, Fußgänger die ganze Straße nutzen.',
    student: 'Fährt Schritttempo und rechnet jederzeit mit spielenden Kindern.',
    checks: [
      check('schritt', 'Geschwindigkeit an den Verkehrsbereich angepasst?', 'Schrittgeschwindigkeit halten'),
      check(
        'kinder',
        'Schutzbedürftige Verkehrsteilnehmer angemessen berücksichtigt?',
        'Fußgängern Vorrang lassen, mit Kindern rechnen',
      ),
    ],
    tip: 'Schritttempo heißt 4 bis 7 km/h – im ersten Gang ohne Gas rollen lassen.',
  },
  'spielstrasse-ende': {
    kind: 'spielstrasse-ende',
    sign: '325.2',
    title: 'Ende verkehrsberuhigter Bereich',
    hint: 'Ausnahme · warten, auch nach rechts',
    rule: 'Wer einen verkehrsberuhigten Bereich verlässt, muss allen Vorfahrt gewähren – auch Fahrzeugen von links.',
    student: 'Wartet beim Ausfahren, bis die Straße in beide Richtungen frei ist.',
    checks: [
      check(
        'vorfahrt',
        'Beim Verlassen die geltenden Vorfahrtsregeln beachtet?',
        'Beim Verlassen allen Vorfahrt gewähren',
      ),
      check(
        'baulich',
        'Besondere Vorfahrtsregelungen durch bauliche Gegebenheiten berücksichtigt?',
        'Abgesenkten Bordstein als Ausnahme erkennen',
      ),
      check(
        'bereich',
        'Besondere Verkehrsbereiche und deren Regelungen beachtet?',
        'Verkehrsberuhigten Bereich als Ausnahme erkennen',
      ),
    ],
    tip: 'Rechts vor Links gilt hier nicht: Wer aus der Spielstraße kommt, wartet immer.',
  },
  einbahnstrasse: {
    kind: 'einbahnstrasse',
    sign: '220',
    title: 'Einbahnstraße',
    hint: 'Nur in Pfeilrichtung · Radverkehr beachten',
    rule: 'Nur in Pfeilrichtung befahren. Ist der Radverkehr freigegeben, kommen Räder entgegen.',
    student: 'Prüft die Richtung und rechnet mit entgegenkommenden Radfahrern.',
    checks: [
      check('richtung', 'Vorgeschriebene Fahrtrichtung eingehalten?', 'Nur in Pfeilrichtung fahren'),
      check('einordnen', 'Fahrstreifen zum Abbiegen korrekt gewählt?', 'Zum Linksabbiegen ganz links einordnen'),
      check(
        'rad',
        'Besonderen Gegenverkehr, insbesondere Radverkehr, berücksichtigt?',
        'Mit entgegenkommenden Radfahrern rechnen',
      ),
      check(
        'einfahrt',
        'Verbotene Einfahrten und Fahrtrichtungen vermieden?',
        'Nicht entgegen der Fahrtrichtung einfahren',
      ),
    ],
    tip: 'In Einbahnstraßen zum Linksabbiegen ganz links einordnen – Gegenverkehr gibt es nicht.',
  },
  ampel: {
    kind: 'ampel',
    sign: '131',
    title: 'Ampelkreuzung',
    hint: 'Lichtzeichen · Haltlinie beachten',
    rule: 'Bei Rot an der Haltlinie halten. Bei Gelb anhalten, wenn es gefahrlos möglich ist.',
    student: 'Erkennt die Ampel früh und hält bei Rot an der Haltlinie.',
    checks: [
      check('erkannt', 'Verkehrsregelnde Signale rechtzeitig wahrgenommen?', 'Ampel beim Annähern beachten'),
      check('signal', 'Signalstellung korrekt interpretiert?', 'Ampelzeichen richtig einschätzen'),
      check(
        'verhalten',
        'Verhalten vor der Kreuzung situationsgerecht angepasst?',
        'Vor der Kreuzung passend verhalten',
      ),
      check('kreuzung', 'Kreuzung sicher und ohne Behinderung befahren?', 'Kreuzung vollständig und sicher befahren'),
    ],
    tip: 'Schon von Weitem auf die Ampel schauen: Ist sie lange grün, kann sie bald umspringen.',
  },
  zebrastreifen: {
    kind: 'zebrastreifen',
    sign: '350',
    title: 'Fußgängerüberweg',
    hint: 'Fußgänger haben Vorrang',
    rule: 'Fußgängern das Überqueren ermöglichen und nur mit mäßiger Geschwindigkeit heranfahren.',
    student: 'Fährt langsam heran und lässt Fußgänger über die Straße.',
    checks: [
      check('tempo', 'Mit mäßigem Tempo herangefahren?', 'Langsam an den Überweg heranfahren'),
      check('erkannt', 'Fußgänger rechtzeitig erkannt?', 'Fußgänger am Rand früh erkennen'),
      check('durchlassen', 'Fußgänger durchgelassen?', 'Fußgänger queren lassen'),
      check('nicht-halten', 'Nicht auf dem Überweg gehalten?', 'Nicht auf dem Überweg halten'),
    ],
    tip: 'Auch auf Menschen am Straßenrand achten, die erst losgehen wollen – sie haben ebenfalls Vorrang.',
  },
  bahnuebergang: {
    kind: 'bahnuebergang',
    sign: '151',
    title: 'Bahnübergang',
    hint: 'Schienenfahrzeuge haben Vorrang',
    rule: 'Schienenfahrzeuge haben Vorrang. Nur mit mäßiger Geschwindigkeit heranfahren.',
    student: 'Fährt langsam heran, schaut nach Zügen und hält nie auf den Gleisen.',
    checks: [
      check(
        'tempo',
        'Geschwindigkeit rechtzeitig an den Bahnübergang angepasst?',
        'Geschwindigkeit rechtzeitig reduzieren',
      ),
      check(
        'blick',
        'Warnzeichen und Schienenverkehr aufmerksam beobachtet?',
        'Auf Schienenverkehr und Warnzeichen achten',
      ),
      check(
        'anhalten',
        'Bei entsprechenden Signalen oder Sperrungen korrekt angehalten?',
        'Bei Rotlicht oder Schranke anhalten',
      ),
      check(
        'gleise',
        'Bahnübergang nur bei sicherer Weiterfahrt befahren?',
        'Gleise nur bei freier Weiterfahrt befahren',
      ),
      check(
        'zug',
        'Bei erkennbarer Zuggefahr rechtzeitig und sicher reagiert?',
        'Bei herannahendem Zug rechtzeitig anhalten',
      ),
    ],
    tip: 'Nur einfahren, wenn hinter dem Übergang Platz ist – sonst vor den Gleisen warten.',
  },
  einfaedeln: {
    kind: 'einfaedeln',
    sign: '330.1',
    title: 'Spurwechsel',
    hint: 'Beschleunigungsstreifen · Vorfahrt beachten',
    rule: 'Auf dem Beschleunigungsstreifen beschleunigen; der Verkehr auf der Fahrbahn hat Vorfahrt.',
    student: 'Beschleunigt auf das Tempo der Fahrbahn und nutzt eine Lücke.',
    checks: [
      check('spur', 'Fahrstreifen sicher und situationsgerecht gehalten?', 'Fahrspur halten'),
      check('spiegel', 'Spiegel zur Verkehrsbeobachtung genutzt?', 'In den Rückspiegel schauen'),
      check('schulterblick', 'Erforderliche Blickkontrollen durchgeführt?', 'Schulterblick machen'),
      check('rueckwaerts', 'Rückwärtigen und seitlichen Verkehr ausreichend geprüft?', 'Rückwärtigen Verkehr prüfen'),
      check('blinken', 'Spurwechsel rechtzeitig und eindeutig angekündigt?', 'Blinker rechtzeitig setzen'),
      check('wechsel', 'Spurwechsel sicher und ohne Gefährdung durchgeführt?', 'Spur sicher wechseln'),
    ],
    tip: 'Den Beschleunigungsstreifen ganz ausnutzen – wer zu früh einfädelt, ist meist zu langsam.',
  },
}

/** Ordnet ein Ereignis der Strecke einem Lernpunkt zu (oder keinem) */
export function pointKindOf(event: RouteEvent): PointKind | undefined {
  switch (event.kind) {
    case 'ampel-rot':
    case 'ampel-gruen':
      return 'ampel'
    case 'kreisverkehr':
      return event.text.includes('einfahren') ? 'kreisverkehr' : undefined
    case 'auffahrt':
      return undefined // die Auffahrt ist Navigation, gelernt wird das Einfädeln
    case 'rechts-vor-links':
    case 'vorfahrt-achten':
    case 'stopp':
    case 'spielstrasse':
    case 'spielstrasse-ende':
    case 'einbahnstrasse':
    case 'zebrastreifen':
    case 'bahnuebergang':
    case 'einfaedeln':
      return event.kind
    default:
      return undefined
  }
}
