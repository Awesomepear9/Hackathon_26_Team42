// Fragenkatalog (Kategorien nach amtlicher Gliederung) und Beispielfragen.
// Eigene Formulierungen, kein amtlicher Fragentext. Fragenanzahlen sind Beispielwerte.
import { svgURI } from "./pixel";

export interface Category {
  group: "Grundstoff" | "Zusatzstoff Klasse B";
  code: string;
  name: string;
  total: number;
}

export const CATS: Category[] = [
  { group: "Grundstoff", code: "1.1", name: "Gefahrenlehre", total: 182 },
  { group: "Grundstoff", code: "1.2", name: "Verhalten im Straßenverkehr", total: 264 },
  { group: "Grundstoff", code: "1.3", name: "Vorfahrt, Vorrang", total: 74 },
  { group: "Grundstoff", code: "1.4", name: "Verkehrszeichen", total: 148 },
  { group: "Grundstoff", code: "1.5", name: "Umweltschutz", total: 26 },
  { group: "Grundstoff", code: "1.7", name: "Technik", total: 38 },
  { group: "Grundstoff", code: "1.8", name: "Eignung und Befähigung", total: 30 },
  { group: "Zusatzstoff Klasse B", code: "2.1", name: "Gefahrenlehre", total: 88 },
  { group: "Zusatzstoff Klasse B", code: "2.2", name: "Verhalten im Straßenverkehr", total: 72 },
  { group: "Zusatzstoff Klasse B", code: "2.4", name: "Verkehrszeichen", total: 56 },
  { group: "Zusatzstoff Klasse B", code: "2.5", name: "Umweltschutz", total: 18 },
  { group: "Zusatzstoff Klasse B", code: "2.7", name: "Technik", total: 64 },
];

export const DEMO_DONE: Record<string, number> = {
  "1.1": 96, "1.2": 121, "1.3": 58, "1.4": 83, "1.5": 19, "1.7": 12,
  "1.8": 21, "2.1": 31, "2.2": 24, "2.4": 30, "2.5": 6, "2.7": 9,
};

/** Feldarten der Stadt: X Ampelkreuzung, V Kreuzung, K Kreisverkehr, W/T Einmündung,
 * Z Zebrastreifen, B Bahnübergang, S Spielstraße, P Parkstreifen, U unterwegs */
export type EventKind = "V" | "T" | "W" | "X" | "K" | "Z" | "B" | "S" | "P" | "U";

/** Sprite in der Ereignis-Szene; Koordinaten im Fahrer-Bezug (Feldmitte = 0,0, Fahrer kommt von unten) */
export interface SceneSprite {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  to?: { x: number; y: number };
}

export interface Question {
  id: string;
  kinds: EventKind[];
  cat: string;
  type: "Klassisch" | "Reaktion" | "Situation";
  pts: number;
  q: string;
  a?: string[];
  c?: number[];
  multi?: boolean;
  react?: "brake" | "gas";
  sign?: string;
  why: string;
  rel: SceneSprite[];
}

const PED = svgURI(["..rrrr..", ".rrhhrr.", "rrhhhhrr", "rrhhhhrr", ".rrhhrr.", "..rrrr.."], { r: "#e0302a", h: "#5a3a1a" });
const BALL = svgURI([".oyyo.", "oyyyyo", "yyoyyy", "yyyoyy", "oyyyyo", ".oyyo."], { y: "#ff8a1f", o: "#fff" });
const A = "/dungeon";

export const QUESTIONS: Question[] = [
  { id: "v1", kinds: ["V"], cat: "1.3", type: "Klassisch", pts: 5,
    q: "Kreuzung ohne Verkehrszeichen. Du willst geradeaus fahren. In welcher Reihenfolge wird gefahren?",
    a: ["Ich fahre zuerst, weil ich die Kreuzung zuerst erreicht habe.", "Erst das schwarze Auto von rechts, dann ich, dann das weiße Auto.", "Erst das weiße Auto von links, dann ich."], c: [1],
    why: "Ohne Zeichen gilt rechts vor links: Das Auto von rechts fährt zuerst, du hast Vorfahrt vor dem Auto von links.",
    rel: [{ src: `${A}/cars/auto_2.png`, x: 1.0, y: -0.13, w: 0.3, h: 0.44, rot: 270 }, { src: `${A}/cars/auto_1.png`, x: -1.0, y: 0.13, w: 0.3, h: 0.44, rot: 90 }] },
  { id: "v2", kinds: ["V", "T"], cat: "1.3", type: "Klassisch", pts: 3,
    q: "Hier stehen keine Vorfahrtszeichen und keine Ampel. Welche Regel gilt?",
    a: ["Rechts vor links", "Wer schneller ist, fährt zuerst", "Die breitere Straße hat Vorfahrt"], c: [0],
    why: "Ohne Zeichen und Ampel gilt an Kreuzungen und Einmündungen rechts vor links.",
    rel: [{ src: `${A}/cars/auto_2.png`, x: 1.0, y: -0.13, w: 0.3, h: 0.44, rot: 270 }] },
  { id: "x1", kinds: ["X"], cat: "1.2", type: "Klassisch", pts: 4,
    q: "Die Ampel springt auf Gelb. Wie verhältst du dich?",
    a: ["Vor der Kreuzung anhalten, wenn das gefahrlos möglich ist", "Beschleunigen, um noch rüberzukommen", "Auf jeden Fall eine Vollbremsung machen"], c: [0],
    why: "Bei Gelb hältst du vor der Kreuzung, wenn das sicher geht. Eine Vollbremsung um jeden Preis kann Auffahrunfälle auslösen.",
    rel: [{ src: `${A}/lights/ampel_gelb.png`, x: 0.58, y: 0.42, w: 0.13, h: 0.6, rot: 0 }] },
  { id: "x2", kinds: ["X"], cat: "1.2", type: "Klassisch", pts: 4,
    q: "Grün. Du willst links abbiegen, Gegenverkehr kommt. Was ist richtig?",
    a: ["Gegenverkehr durchfahren lassen", "Bis zur Kreuzungsmitte vorfahren und dort warten", "Zügig vor dem Gegenverkehr abbiegen"], c: [0, 1], multi: true,
    why: "Linksabbieger müssen den Gegenverkehr durchlassen und warten dafür in der Kreuzungsmitte.",
    rel: [{ src: `${A}/cars/auto_1.png`, x: -0.13, y: -1.0, w: 0.3, h: 0.44, rot: 180 }, { src: `${A}/lights/ampel_gruen.png`, x: 0.58, y: 0.42, w: 0.13, h: 0.6, rot: 0 }] },
  { id: "k1", kinds: ["K"], cat: "1.2", type: "Klassisch", pts: 3,
    q: "Was gilt beim Kreisverkehr?",
    a: ["Beim Einfahren nicht blinken", "Beim Ausfahren rechts blinken", "Beim Einfahren links blinken"], c: [0, 1], multi: true,
    why: "Beim Einfahren wird nicht geblinkt, beim Ausfahren immer rechts.",
    rel: [{ src: `${A}/cars/auto_1.png`, x: 0.42, y: -0.42, w: 0.28, h: 0.4, rot: 270 }] },
  { id: "k2", kinds: ["K"], cat: "1.3", type: "Klassisch", pts: 3,
    q: "An der Einfahrt steht „Vorfahrt gewähren“. Wer hat Vorfahrt?",
    a: ["Fahrzeuge, die schon im Kreisverkehr fahren", "Ich beim Einfahren", "Wer von rechts kommt"], c: [0],
    why: "Mit „Vorfahrt gewähren“ hat der Verkehr im Kreisel Vorfahrt.",
    rel: [{ src: `${A}/cars/auto_2.png`, x: -0.42, y: -0.42, w: 0.28, h: 0.4, rot: 90 }] },
  { id: "w1", kinds: ["W"], cat: "1.4", type: "Klassisch", pts: 4,
    q: "Was bedeutet das Zeichen an dieser Einmündung?",
    a: ["Vorfahrt gewähren", "Halt! Vorfahrt gewähren", "Vorfahrtstraße"], c: [0], sign: `${A}/signs/schild_vorfahr_gewaehren.png`,
    why: "Das auf der Spitze stehende Dreieck bedeutet „Vorfahrt gewähren“. Anhalten musst du nur, wenn es nötig ist.",
    rel: [] },
  { id: "t1", kinds: ["T", "W"], cat: "1.4", type: "Klassisch", pts: 4,
    q: "Was bedeutet dieses Zeichen?",
    a: ["Halt! Vorfahrt gewähren – immer anhalten", "Nur bei Gegenverkehr anhalten", "Parken verboten"], c: [0], sign: `${A}/signs/schild_stop.png`,
    why: "Am Stoppschild musst du immer an der Haltlinie anhalten, auch wenn frei ist.",
    rel: [] },
  { id: "z1", kinds: ["Z"], cat: "1.1", type: "Reaktion", pts: 5,
    q: "Achtung! Gleich passiert etwas. Reagiere richtig.", react: "brake",
    why: "Am Zebrastreifen musst du Fußgängern das Überqueren ermöglichen und rechtzeitig bremsen.",
    rel: [{ src: PED, x: 0.62, y: -0.05, w: 0.2, h: 0.15, rot: 0, to: { x: 0.05, y: -0.05 } }] },
  { id: "z2", kinds: ["Z"], cat: "1.2", type: "Klassisch", pts: 4,
    q: "Am Zebrastreifen wartet jemand am Bordstein. Was tust du?",
    a: ["Anhalten und das Überqueren ermöglichen", "Hupen, damit die Person wartet", "Zügig vorbeifahren"], c: [0],
    why: "Wer erkennbar über den Zebrastreifen will, darf das. Du hältst an.",
    rel: [{ src: PED, x: 0.6, y: -0.05, w: 0.2, h: 0.15, rot: 0 }] },
  { id: "b1", kinds: ["B"], cat: "1.2", type: "Klassisch", pts: 5,
    q: "Am Bahnübergang blinkt rotes Licht. Was gilt?",
    a: ["Vor dem Andreaskreuz warten", "Fahren, wenn kein Zug zu sehen ist", "Schnell drüberfahren, bevor die Schranke schließt"], c: [0],
    why: "Rotes Blinklicht heißt: warten – egal, ob schon ein Zug zu sehen ist.",
    rel: [{ src: `${A}/signs/schild_andreaskreuz.png`, x: 0.52, y: 0.32, w: 0.24, h: 0.5, rot: 0 }] },
  { id: "s1", kinds: ["S"], cat: "1.4", type: "Klassisch", pts: 3,
    q: "Verkehrsberuhigter Bereich. Wie schnell darfst du fahren?",
    a: ["Schrittgeschwindigkeit", "30 km/h", "20 km/h"], c: [0], sign: `${A}/signs/schild_spielstrasse.png`,
    why: "Im verkehrsberuhigten Bereich gilt Schrittgeschwindigkeit. Fußgänger dürfen die ganze Straße nutzen.",
    rel: [] },
  { id: "p1", kinds: ["P"], cat: "1.2", type: "Klassisch", pts: 3,
    q: "Wie viel Abstand musst du beim Parken mindestens zu einer Kreuzung halten?",
    a: ["5 Meter", "3 Meter", "10 Meter"], c: [0],
    why: "Vor und hinter Kreuzungen und Einmündungen ist Parken bis 5 m von den Schnittpunkten der Fahrbahnkanten verboten.",
    rel: [{ src: `${A}/cars/sprinter.png`, x: -0.38, y: -0.2, w: 0.28, h: 0.5, rot: 0 }] },
  { id: "u1", kinds: ["U"], cat: "1.1", type: "Situation", pts: 4,
    q: "Ein Ball rollt auf die Straße. Womit musst du rechnen und was tust du?",
    a: ["Ein Kind könnte hinterherlaufen", "Geschwindigkeit verringern und bremsbereit sein", "Weiterfahren, ein Ball ist ungefährlich"], c: [0, 1], multi: true,
    why: "Hinter einem Ball kommt oft ein Kind. Langsamer werden und bremsbereit sein.",
    rel: [{ src: BALL, x: 0.62, y: -0.35, w: 0.12, h: 0.12, rot: 0, to: { x: -0.15, y: -0.35 } }] },
  { id: "u2", kinds: ["U"], cat: "2.7", type: "Klassisch", pts: 3,
    q: "Wie tief muss das Reifenprofil bei einem Pkw mindestens sein?",
    a: ["1,6 mm", "1,0 mm", "3,0 mm"], c: [0],
    why: "Vorgeschrieben sind mindestens 1,6 mm. Empfohlen werden mehr, besonders im Winter.",
    rel: [] },
  { id: "u3", kinds: ["U"], cat: "1.5", type: "Klassisch", pts: 3,
    q: "Wie fährst du umweltschonend?",
    a: ["Früh hochschalten", "Vorausschauend fahren", "Den Motor im Stand warmlaufen lassen"], c: [0, 1], multi: true,
    why: "Niedrige Drehzahlen und vorausschauendes Fahren sparen Sprit. Warmlaufen im Stand ist verboten.",
    rel: [] },
  { id: "u4", kinds: ["U"], cat: "1.1", type: "Klassisch", pts: 5,
    q: "Du bist in der Probezeit. Welche Promillegrenze gilt für dich?",
    a: ["0,0 Promille", "0,3 Promille", "0,5 Promille"], c: [0],
    why: "Für Fahranfänger in der Probezeit und unter 21 gilt ein absolutes Alkoholverbot.",
    rel: [] },
];

/** Erlaubtes bzw. angemessenes Tempo je Feldart */
export const LIMIT: Record<EventKind, number> = { S: 10, P: 20, Z: 30, V: 30, T: 30, W: 30, K: 30, B: 30, X: 50, U: 50 };

export const KINDNAME: Record<EventKind, string> = {
  V: "Kreuzung", T: "Einmündung", W: "Einmündung", X: "Ampelkreuzung", K: "Kreisverkehr",
  Z: "Zebrastreifen", B: "Bahnübergang", S: "Spielstraße", P: "Parkstreifen", U: "Unterwegs",
};

export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id)!;
export const catName = (code: string) => CATS.find((c) => c.code === code)?.name ?? "";
