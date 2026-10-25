// Fragenkatalog des Teams (100_fragen_plain_Fehlerpunkte_text.txt), unverändert übernommen.
// Format je Frage: FEHLERPUNKTE, LÖSUNG (T/F je Antwort), "Frage N: …", danach die Antworten.

export interface Frage {
  nr: number;
  pts: number;
  text: string;
  answers: { t: string; ok: boolean }[];
  /** Verkehrszeichen-Nummern aus dem Fragetext, z. B. "205" */
  signs: string[];
}

const FRAGEN_TXT = `FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 1: Sie nähern sich einer Kreuzung ohne verkehrsregelnde Schilder. Von rechts kommt ein Pkw. Wie müssen Sie sich verhalten?
Ich muss dem Pkw von rechts Vorfahrt gewähren
Ich fahre zuerst, weil ich auf der breiteren Straße bin
Wer schneller fährt, hat Vorfahrt

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 2: Sie sehen das [Zeichen 102]. Wie stellen Sie sich darauf ein?
Geschwindigkeit drosseln und bremsbereit nach rechts schauen
Zügig weiterfahren, um die Kreuzung rasch zu räumen
Hupen, um den Querverkehr zu warnen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 3: Welche Fahrzeuge fallen unter die Vorfahrtsregel Rechts vor Links?
Alle Fahrzeuge, auch Fahrräder und Krankenfahrstühle
Nur Kraftfahrzeuge wie Pkw und Lkw
Nur Fahrzeuge mit einer Höchstgeschwindigkeit über 25 km/h

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 4: Sie wollen an einer gleichrangigen Kreuzung nach links abbiegen. Wen müssen Sie durchlassen?
Den von rechts kommenden Verkehr und den entgegenkommenden Geradeausverkehr
Nur den von rechts kommenden Verkehr
Niemanden, weil Linksabbieger Vorrang haben

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 5: Drei Fahrzeuge treffen an einer Rechts vor Links Kreuzung aufeinander. Wer darf zuerst fahren?
Die Beteiligten müssen sich durch Handzeichen oder Lichtzeichen verständigen
Derjenige, der am weitesten rechts steht
Derjenige, der geradeaus fahren will

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 6: Ein parkender Lieferwagen verdeckt an einer Rechts vor Links Kreuzung die Sicht nach rechts. Wie verhalten Sie sich?
Ganz vorsichtig und schrittweise in die Kreuzung hineintasten
Mit unveränderter Geschwindigkeit weiterfahren
Ein langes Hupsignal geben und durchfahren

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 7: Sie kommen aus einem Waldweg und fahren auf eine asphaltierte Straße. Gilt hier Rechts vor Links?
Nein, wer aus Feld- oder Waldwegen einbiegt, hat keine Vorfahrt
Ja, Rechts vor Links gilt an allen Einmündungen
Nur wenn ein Stoppschild aufgestellt ist

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 8: Gilt auf öffentlichen Parkplatzgeländen ohne Bodenmarkierungen automatisch Rechts vor Links?
Ja, Fahrspuren mit eindeutigem Straßencharakter unterliegen RvL
Nein, auf Parkplätzen gilt grundsätzlich die gegenseitige Rücksichtnahme
Nein, es gilt immer die Regel Links vor Rechts

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 9: An einer gleichrangigen Kreuzung nähert sich von rechts eine Straßenbahn. Wer hat Vorfahrt?
Die Straßenbahn hat als Schienenfahrzeug Vorfahrt
Ich habe Vorfahrt, weil Autos Vorrang vor Bahnen haben
Wer zuerst bremst, muss warten

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 10: Dürfen Sie im Bereich einer unübersichtlichen Rechts vor Links Kreuzung überholen?
Nein, das Überholen an unübersichtlichen Kreuzungen ist verboten
Ja, wenn kein Verkehr von rechts kommt
Ja, aber nur zweirädrige Fahrzeuge

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 11: Sie wollen geradeaus fahren. Von rechts biegt ein Pkw nach rechts ab. Wer hat Vorfahrt?
Der Pkw von rechts hat Vorfahrt
Ich habe Vorfahrt, weil ich geradeaus fahre
Beide müssen anhalten

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 12: Sie wollen an einer gleichrangigen Kreuzung nach rechts abbiegen. Ein Fußgänger überquert die Straße, in die Sie einbiegen wollen. Wie verhalten Sie sich?
Dem Fußgänger das Zügige Überqueren ermöglichen und anhalten
Zuerst abbiegen, da Fahrzeuge Vorrang vor Fußgängern haben
Hupen und weiterfahren

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 13: An einer Rechts vor Links Kreuzung nähert sich von links ein Einsatzfahrzeug mit Blaulicht und Einsatzhorn. Wer fährt zuerst?
Das Einsatzfahrzeug sofort gewähren lassen
Ich fahre zuerst, weil ich von rechts komme
Wer schneller beschleunigt

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 14: Sie sind unsicher, ob der von rechts kommende Fahrer seine Vorfahrt wahrnimmt oder auf Sie wartet. Wie verhalten Sie sich?
Blickkontakt suchen, bremsbereit bleiben und im Zweifel auf die Vorfahrt verzichten
Stur weiterfahren und auf das eigene Recht beharren
Unverzüglich beschleunigen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 15: Gilt Rechts vor Links auch an T-Kreuzungen ohne Schilder?
Ja, auch an T-Kreuzungen gilt ohne Beschilderung Rechts vor Links
Nein, die durchgehende Straße hat immer Vorfahrt
Nur wenn eine Ampel vorhanden ist

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 16: Sie nähern sich mit 50 km/h einer unübersichtlichen Rechts vor Links Kreuzung. Was müssen Sie tun?
Rechtzeitig abbremsen und die Geschwindigkeit auf unter 20 km/h reduzieren
Das Tempo beibehalten und kurz hupen
Auf die Gegenfahrbahn ausweichen

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 17: Was bedeutet das [Zeichen 102]?
Es weist auf eine Gefahrstelle hin, an der die gesetzliche Rechts vor Links Regel gilt
Es hebt die Rechts vor Links Regel auf
Es zeigt eine Vorfahrtsstraße an

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 18: Sie stehen an einer gleichrangigen Kreuzung und möchten wenden. Wie wirkt sich das auf Ihre Vorfahrt aus?
Beim Wenden muss jedem anderen Verkehrsteilnehmer Vorrang gewährt werden
Ich behalte meine Vorfahrt gegenüber allen von links Kommenden
Keine Auswirkung, ich habe immer Vorrang

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 19: An einer gleichrangigen Kreuzung kommt von rechts ein Mofa. Gilt Rechts vor Links?
Ja, Mofas sind Fahrzeuge und somit vorfahrtsberechtigt von rechts
Nein, Mofas müssen allen Pkw Vorfahrt gewähren
Nur auf Außerortsstraßen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 20: Sie fahren innerorts an einer Einmündung vorbei, von der ein verdeckter Weg mündet. Wie sichern Sie sich ab?
Geschwindigkeit verringern, bremsbereit sein und den rechten Blickwinkel prüfen
Sichtblende ignorieren und unverändert weiterfahren
Fernlicht einschalten

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 21: Sie fahren über einen abgesenkten Bordstein auf eine Vorfahrtsstraße ein. Wer hat Vorfahrt?
Der fließende Verkehr auf der Straße hat Vorfahrt
Ich habe Vorfahrt, weil ich von rechts komme
Wer zuerst hupt

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 22: Sie verlassen einen verkehrsberuhigten Bereich [Zeichen 325.2]. Welche Vorfahrtsregel gilt?
Ich muss allen Fahrzeugen und Fußgängern auf der Straße Vorrang gewähren
Es gilt Rechts vor Links
Ich habe automatisch Vorfahrt

FEHLERPUNKTE: 2
LÖSUNG: TFF
Frage 23: Welche Höchstgeschwindigkeit ist im verkehrsberuhigten Bereich [Zeichen 325.1] zulässig?
Schrittgeschwindigkeit (ca. 4-7 km/h)
30 km/h
15 km/h

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 24: Wo darf in einem verkehrsberuhigten Bereich [Zeichen 325.1] geparkt werden?
Nur auf dafür speziell gekennzeichneten Flächen
Überall am rechten Fahrbahnrand
Direkt vor den Hauseingängen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 25: Kinder spielen im verkehrsberuhigten Bereich auf der Straße. Wie verhalten Sie sich?
Anhalten oder Schrittgeschwindigkeit fahren, Kinder dürfen die Straße überall nutzen
Lauthals hupen, damit die Kinder wegrennen
Mit 30 km/h vorsichtig vorbeifahren

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 26: Sie wollen aus einer Tankstelle auf die Fahrbahn einbiegen. Was ist zu beachten?
Eine Gefährdung anderer Verkehrsteilnehmer muss ausgeschlossen sein, volle Wartepflicht
Wer aus der Tankstelle kommt, hat Rechts vor Links
Blinker setzen reicht, um Vorfahrt zu haben

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 27: Woran erkennen Sie einen baulich abgesenkten Bordstein?
Die Bordsteinkante verläuft im Einmündungsbereich durchgehend niedriger als normal
Nur durch ein blaues Hinweisschild
An einer durchgezogenen gelben Linie auf der Fahrbahn

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 28: Ein Fußgänger geht langsam vor Ihrem Fahrzeug im verkehrsberuhigten Bereich. Wie reagieren Sie?
Geduldig im Schritttempo dahinter bleiben, bis der Fußgänger Platz macht
Dicht auffahren und die Lichthupe betätigen
Auf den Gehweg ausweichen

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 29: Müssen Sie beim Ausfahren aus einem Grundstück oder einer Grundstücksausfahrt blinken?
Ja, das Anzeigen der Fahrtrichtung ist beim Einbiegen Pflicht
Nein, auf privatem Gelände muss nie geblinkt werden
Nur nachts

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 30: Sie verlassen einen Parkplatz über einen abgesenkten Bordstein. Ein Fahrradfahrer kommt von links auf dem Radweg. Wer muss warten?
Ich muss dem Fahrradfahrer Vorrang gewähren
Der Fahrradfahrer muss warten
Beide dürfen gleichzeitig fahren

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 31: Das Schild [Zeichen 325.2] steht 10 Meter vor einer Einmündung. Was gilt an der Einmündung?
Die Wartepflicht gilt bis zum eigentlichen Einbiegen in die Straße fort
Ab dem Schild gilt sofort wieder Rechts vor Links
Die Hauptstraße verliert ihre Vorfahrt

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 32: Ein Ball rollt plötzlich aus einer Einfahrt im verkehrsberuhigten Bereich auf die Fahrbahn. Wie reagieren Sie?
Sofortige Gefahrenbremsung einleiten, da ein Kind nachlaufen könnte
Dem Ball vorsichtig ausweichen
Unverändert weiterfahren

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 33: Dürfen Fußgänger im verkehrsberuhigten Bereich behindert werden?
Nein, der Fußgängerverkehr darf weder gefährdet noch unnötig behindert werden
Ja, wenn Autos zügig vorbeifahren wollen
Fußgänger müssen Autos immer sofort Platz machen

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 34: Sie kommen aus einer Grundstücksausfahrt und wollen nach rechts einbiegen. Welchen Blick sichern Sie ab?
Schulterblick nach links UND rechts bezüglich Fußgängern und Radfahrern
Nur nach links auf den Autoverkehr schauen
Gar keinen, wenn frei erscheint

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 35: Gilt Rechts vor Links, wenn ein Fahrzeug aus einer Fußgängerzone [Zeichen 242.1] ausfährt?
Nein, wer aus einer Fußgängerzone kommt, muss allen anderen Vorrang gewähren
Ja, Fußgängerzonen sind normale Straßen
Nur wenn Schilder es anzeigen

FEHLERPUNKTE: 2
LÖSUNG: TFF
Frage 36: Darf im verkehrsberuhigten Bereich gehalten werden?
Ja, zum Ein- und Aussteigen sowie zum Be- und Entladen
Nein, es gilt ein absolutes Halteverbot
Nur mit eingeschalteter Warnblinkanlage

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 37: Sie fahren auf einer Hauptstraße. Von rechts kommt ein Pkw aus einer Tankstellenausfahrt. Wer hat Vorfahrt?
Ich auf der Hauptstraße habe Vorfahrt
Der Pkw aus der Tankstelle hat Rechts vor Links
Wer zuerst an der Kante steht

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 38: Wie müssen Sie sich verhalten, wenn Sie über einen abgesenkten Bordstein einbiegen und die Sicht eingeschränkt ist?
Sich vorsichtig hineintasten und ggf. von einer zweiten Person einwinken lassen
Mit Hupen zügig einfahren
Zurückweichen und umkehren

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 39: Ist das Überholen im verkehrsberuhigten Bereich erlaubt?
Taktisch unmöglich/nicht gestattet wegen der Schrittgeschwindigkeit
Ja, mit maximal 50 km/h
Ja, aber nur zweirädrige Fahrzeuge

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 40: Sie fahren aus einer Garageneinfahrt auf die Straße. Wer hat Vorrang?
Alle Verkehrsteilnehmer auf der Fahrbahn und dem Gehweg haben Vorrang
Ich habe Vorrang, wenn ich nach rechts abbiege
Niemand, Wechsel vorübergehend

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 41: Was bedeutet das [Zeichen 220]?
Die Fahrbahn darf nur in Pfeilrichtung befahren werden
Es darf nur ein einziges Fahrzeug in die Straße fahren
Parken ist strengstens verboten

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 42: Auf welcher Seite dürfen Sie in einer Einbahnstraße [Zeichen 220] grundsätzlich parken?
Sowohl am rechten als auch am linken Fahrbahnrand in Fahrtrichtung
Ausschließlich am rechten Fahrbahnrand
Gar nicht, Parkverbot

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 43: Sie möchten am Ende einer Einbahnstraße nach links abbiegen. Wie ordnen Sie sich ein?
Möglichst weit links am Fahrbahnrand einordnen
In der Mitte der Fahrbahn bleiben
Ganz rechts einordnen

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 44: Dürfen Sie in einer Einbahnstraße rückwärtsfahren?
Nur zum reinen Einparken oder Rangieren
Ja, ohne Einschränkung
Nein, Rückwärtsfahren ist vollkommen verboten

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 45: Unter dem [Zeichen 267] befindet sich das [Zusatzzeichen 1022-10]. Was bedeutet das?
Radfahrer dürfen entgegen der Einbahnstraße fahren, Kraftfahrzeuge nicht
Alle Fahrzeuge dürfen einfahren
Radfahrer müssen auf dem Gehweg fahren

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 46: Sie befahren eine Einbahnstraße mit entgegenkommendem Radverkehr [Zusatzzeichen 1022-10]. Wie verhalten Sie sich?
Ausreichend Seitenabstand halten und erhöhte Bremsbereitschaft zeigen
Mittig fahren und Radfahrer anhupen
Radfahrer haben anzuhalten

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 47: Welcher Mindestabstand muss innerorts beim Überholen von Radfahrern eingehalten werden?
Mindestens 1,5 Meter
Mindestens 1,0 Meter
Mindestens 0,5 Meter

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 48: Dürfen Sie in einer Einbahnstraße wenden?
Nein, das Wenden in Einbahnstraßen ist verboten
Ja, wenn kein anderer Verkehr kommt
Ja, aber nur nachts

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 49: An einer Einmündung innerhalb einer Einbahnstraße stehen keine Schilder. Welche Regel gilt für von rechts einmündende Straßen?
Es gilt Rechts vor Links
Die Einbahnstraße hat immer Vorfahrt
Verkehr von rechts muss warten

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 50: Ein Lieferwagen hält in zweiter Reihe in einer engen Einbahnstraße. Wie reagieren Sie?
Warten, bis das Vorbeifahren ohne Gefährdung möglich ist
Auf den Gehweg ausweichen und vorbeifahren
Hupen und dicht auffahren

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 51: Sie fahren aus einer Einbahnstraße heraus auf eine Vorfahrtsstraße. Worauf achten Sie?
Auf den Fahrzeugverkehr von links und rechts sowie auf querende Fußgänger
Nur auf Fahrzeuge von links
Nur auf den Gegenverkehr

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 52: Dürfen Sie in eine Straße einfahren, die mit dem [Zeichen 267] gekennzeichnet ist?
Nein, die Einfahrt ist aus dieser Richtung für alle Fahrzeuge verboten
Ja, aber nur bis 30 km/h
Ja, wenn man Anwohner ist

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 53: Beim Vorbeifahren an parkenden Autos in einer Einbahnstraße öffnet sich plötzlich eine Autotür. Was tun Sie?
Sofortige Gefahrenbremsung durchführen und gegebenenfalls vorsichtig ausweichen
Unverändert weiterfahren und hupen
Beschleunigen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 54: Worauf müssen Sie achten, wenn Sie in einer freigegebenen Einbahnstraße nach rechts aus einer Ausfahrt abbiegen?
Es kann von rechts ein freigegebener Radfahrer entgegenkommen
Von rechts kann kein Verkehr kommen
Radfahrer müssen immer warten

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 55: Was ist ein Schutzstreifen für Radfahrer [Zeichen 340]?
Er darf bei Bedarf von Autos befahren werden, sofern Radfahrer nicht gefährdet werden
Er ist eine exklusive Fahrspur für Autos
Darauf darf grundsätzlich geparkt werden

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 56: Darf auf einem Schutzstreifen für Radfahrer [Zeichen 340] geparkt werden?
Nein, auf dem Schutzstreifen gilt ein absolutes Parkverbot
Ja, bis zu 30 Minuten
Ja, mit Parkscheibe

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 57: Sie wollen einen Radfahrer vor einer unübersichtlichen Kurve überholen. Wie verhalten Sie sich?
Überholen abbrechen und hinter dem Radfahrer bleiben, bis die Kurve einsehbar ist
Hupen und dicht vorbeifahren
Mit hoher Geschwindigkeit überholen

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 58: Ein Fahrradfahrer fährt Schlangenlinien vor Ihnen. Was ist die Ursache und wie reagieren Sie?
Mögliche Trunkenheit oder Ablenkung; mit großem Abstand dahinter bleiben
Sofort nah auffahren und Lichthupe geben
Zügig ohne Seitenabstand überholen

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 59: Was bedeutet das [Zeichen 244.1]?
Radverkehr hat Vorrang, Höchstgeschwindigkeit für alle Fahrzeuge beträgt 30 km/h
Autos dürfen mit 50 km/h fahren
Radfahrer dürfen nicht nebeneinander fahren

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 60: Sie fahren aus einer Einbahnstraße und wollen nach rechts abbiegen. Wie ordnen Sie sich ein?
Möglichst weit rechts am Fahrbahnrand einordnen
Links einordnen
In der Fahrbahnmitte bleiben

FEHLERPUNKTE: 2
LÖSUNG: TFF
Frage 61: Längseinparken rückwärts: Wann schlagen Sie das Lenkrad voll nach rechts ein?
Wenn die C-Säule (das hintere Fenster) auf Höhe des Hecks des vorderen Autos steht
Sobald man die Lücke sieht
Erst wenn man die Bordsteinkante berührt

FEHLERPUNKTE: 2
LÖSUNG: TFF
Frage 62: Längseinparken rückwärts: Wann lenken Sie voll nach links gegen?
Im 45°-Winkel bzw. wenn das hintere Auto komplett im linken Außenspiegel sichtbar ist
Sofort nach dem Anfahren
Wenn das Auto bereits angetippt ist

FEHLERPUNKTE: 2
LÖSUNG: TFF
Frage 63: Quereinparken rückwärts: Wie positionieren Sie das Fahrzeug vor dem Einschlagen?
Heck auf Höhe der zweiten Begrenzungslinie nach der Wunschlücke stellen
Direkt vor der Lücke stehen bleiben
In der Mitte der Straße anhalten

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 64: Welche Kontrollblicke sind vor jedem Einparkmanöver zwingend vorzunehmen?
Innenspiegel, Außenspiegel und Schulterblick sowie Blinker setzen
Nur in den Rückspiegel schauen
Gar keine, wenn die Rückfahrkamera an ist

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 65: Umkehren in 3 Zügen: Wie führen Sie den 1. Zug (Vorwärts nach links) aus?
Blinker links, Absicherung rundum, zügig anfahren und Lenkrad voll nach links drehen
Einfach ohne Blinken nach links ziehen
Rückwärts anfahren

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 66: Umkehren in 3 Zügen: Wie führen Sie den 2. Zug (Rückwärts nach rechts) aus?
Rückwärtsgang, Blinker rechts, Rundumblick nach hinten, Lenkrad voll nach rechts drehen
Vorwärts weiterfahren
Räder gerade lassen und zurückrollen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 67: Wie führen Sie eine Gefahrenbremsung (Vollbremsung) korrekt aus?
Kupplung und Bremse gleichzeitig schlagartig mit maximaler Kraft durchtreten
Nur vorsichtig die Bremse tippen
Zuerst die Handbremse ziehen

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 68: Wie reagiert das Anti-Blockier-System (ABS) bei einer Gefahrenbremsung?
Das Bremspedal pulsiert/rattert; der Fußdruck muss mit voller Kraft gehalten werden
Das Auto lenkt automatisch nach rechts
Die Bremse lässt sofort nach

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 69: Bleibt ein Fahrzeug mit funktionierendem ABS während einer Gefahrenbremsung lenkbar?
Ja, trotz maximalem Bremsdruck bleibt das Fahrzeug ausweichfähig
Nein, die Räder blockieren vollständig
Nur bei ausgeschalteter Zündung

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 70: Sie fahren 50 km/h und führen eine normale Bremsung durch. Wie lang ist der Bremsweg nach der Faustformel?
25m
15m
35m

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 71: Sie fahren 100 km/h und haben 1 Sekunde Reaktionszeit. Wie lang ist der Reaktionsweg nach der Faustformel?
30m
20m
50m

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 72: Sie fahren 50 km/h. Wie lang ist der Anhalteweg (Reaktionsweg + Bremsweg) bei einer normalen Bremsung?
40m
25m
60m

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 73: Warum muss bei einer Gefahrenbremsung die Kupplung getreten werden?
Verhindert das Abwürgen des Motors und trennt den Antriebsstrang sofort komplett
Damit das Radio ausgeht
Damit die Scheinwerfer heller leuchten

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 74: Beim Rückwärtseinparken nähert sich von hinten ein Fußgänger. Wie reagieren Sie?
Sofort anhalten und warten, bis der Fußgänger den Bereich verlassen hat
Hupen und zügig weiter einparken
Gas geben

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 75: Ein Hindernis taucht bei 50 km/h in 15m Entfernung auf. Welche Aktion wird gefordert?
Schlagartige Gefahrenbremsung (Kupplung + Bremse voll durchgetreten)
Sanft ausrollen lassen
Nur die Handbremse ziehen

FEHLERPUNKTE: 2
LÖSUNG: TFF
Frage 76: Wie richten Sie das Fahrzeug nach dem Längseinparken optimal in der Lücke aus?
Kurz nach vorne fahren, bis der Abstand zum vorderen und hinteren Auto gleich ist
Sogleich aussteigen
Gegen die Stoßstange fahren

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 77: Dürfen Sie zum Wenden in eine fremde, private Grundstückseinfahrt fahren?
Nur mit Zustimmung des Eigentümers; sonst ist auf öffentlicher Straße zu wenden
Ja, Wenden ist überall erlaubt
Ja, aber nur rückwärts

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 78: Was müssen Sie tun, wenn Sie nach einer Gefahrenbremsung mitten auf der Fahrbahn stehen?
Warnblinkanlage einschalten, Rückverkehr beobachten und Fahrbahn zügig räumen
Auto stehen lassen und aussteigen
Motor abstellen und warten

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 79: Wie sichern Sie ein geparktes Fahrzeug am Gefälle gegen Wegrollen ab?
Feststellbremse anziehen, 1. Gang/P einlegen, Vorderräder zum Bordstein drehen
Nur den Blinker anlassen
Gang im Leerlauf lassen

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 80: Wie groß muss der Seitenabstand beim Ausholen zum Vorwärtseinparken quer mindestens sein?
Mindestens 2,0 Meter Seitenabstand halten
Mindestens 0,5 Meter
Direkt an den parkenden Autos entlangschrammen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 81: Welche Bedeutung hat das [Zeichen 201] an einem Bahnübergang?
Schienenverkehr hat Vorrang; Straßenverkehr muss Vorrang gewähren
Straßenverkehr hat Vorfahrt vor Zügen
Gilt nur für Fußgänger

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 82: Wann müssen Sie vor einem Bahnübergang warten?
Wenn rotes Blinklicht leuchtet, sich Schranken senken oder Pfeifsignale ertönen
Nur wenn die Schranke bereits komplett geschlossen ist
Nur nachts

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 83: Wie groß ist der Abstand der dreistreifigen Bake [Zeichen 156] vor einem Bahnübergang außerorts?
ca. 240 Meter vor dem Bahnübergang
ca. 100 Meter
ca. 50 Meter

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 84: Sie fahren auf einer abknickenden Vorfahrtstraße nach links und folgen dieser. Müssen Sie blinken?
Ja, wer dem Verlauf einer abknickenden Vorfahrtstraße folgt, muss blinken
Nein, weil man auf der Hauptstraße bleibt
Nur bei Dunkelheit

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 85: Sie befinden sich auf einer abknickenden Vorfahrtstraße nach links, wollen aber GERADEAUS fahren. Müssen Sie blinken?
Nein, wer geradeaus fährt, setzt keinen Blinker
Ja, nach rechts blinken
Ja, Warnblinker einschalten

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 86: Sie verlassen eine abknickende Vorfahrtstraße geradeaus. Wer hat Vorrang?
Der Verkehr, der auf der abknickenden Vorfahrtstraße verbleibt, hat Vorrang
Ich habe Vorrang, weil ich geradeaus fahre
Es gilt Rechts vor Links

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 87: Zwei Fahrzeuge befinden sich an einer abknickenden Vorfahrtstraße auf den untergeordneten Straßen. Wer hat Vorrang?
Untereinander gilt die Regel Rechts vor Links
Wer schneller anfährt
Das größere Fahrzeug

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 88: Dürfen Sie auf einem Bahnübergang überholen?
Nein, das Überholen ist ab den Baken bis nach dem Bahnübergang verboten
Ja, aber nur Fahrräder
Ja, wenn keine Schienenfahrzeuge kommen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 89: Bei stockendem Verkehr staut sich der Verkehr vor einem Bahnübergang. Wie verhalten Sie sich?
Vor dem Andreaskreuz [Zeichen 201] warten und die Gleise erst befahren, wenn die Ausfahrt frei ist
Auf den Schienen anhalten
Dicht an die Schranke auffahren

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 90: Was bedeutet ein Blitzsymbol in der Mitte des [Zeichen 201]?
Die Bahnstrecke hat eine elektrische Oberleitung
Achtung Hochspannung am Boden
Der Übergang ist blitzschnell

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 91: In welchem Mindestabstand vor dem [Zeichen 201] dürfen Sie innerorts parken?
Mindestens 5 Meter Abstand einhalten
Mindestens 1 Meter
Direkt unter dem Schild

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 92: Sie fahren auf einen Bahnübergang zu und das rote Blinklicht schaltet ein. Was tun?
Gezielte Anhaltewirkung einleiten und vor dem Andreaskreuz stoppen
Gas geben und noch schnell queren
Hupen

FEHLERPUNKTE: 3
LÖSUNG: TFF
Frage 93: Was kennzeichnet die Vorfahrtsstraße auf dem [Zusatzzeichen 1002]?
Der breite, dicke schwarze Strich stellt den Hauptstraßenverlauf dar
Der dünne Strich
Ein roter Punkt

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 94: Sie wollen von einer untergeordneten Straße auf eine abknickende Vorfahrtstraße einbiegen. Worauf achten Sie?
Volle Wartepflicht gegenüber dem Verkehr auf der Hauptstraße aus beiden Richtungen
Ich habe Rechts vor Links
Nur nach links schauen

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 95: Ihr Fahrzeug fällt mitten auf einem Bahnübergang durch Panne aus. Was ist die erste Maßnahme?
Alle Insassen sofort evakuieren und den Gleisbereich unverzüglich verlassen
Im Auto sitzen bleiben und den Pannendienst anrufen
Versuchen das Auto alleine zu schieben

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 96: Welche Bedeutung hat ein schwenkender Bahnbediensteter mit rot-weiß-roter Fahne?
Gleichbedeutend mit einem Haltesignal - vor dem Übergang anhalten
Freie Fahrt für alle
Nur ein Hinweis für Lkw

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 97: Sie sehen [Zeichen 267] an einer Autobahnausfahrt. Was droht bei Missachtung?
Extreme Gefahr einer tödlichen Geisterfahrt / Geisterfahrer-Unfall
Keine Gefahr, nur eine Abkürzung
Geringes Verwarnungsgeld

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 98: Wo steht die einstreifige Bake [Zeichen 162] vor einem Bahnübergang außerorts?
ca. 80 Meter vor dem Bahnübergang
ca. 240 Meter
ca. 10 Meter

FEHLERPUNKTE: 5
LÖSUNG: TFF
Frage 99: Sie folgen der abknickenden Vorfahrtstraße nach rechts. Ein Fußgänger überquert die Seitenstraße, in die Sie einbiegen. Wer hat Vorrang?
Der Fußgänger hat Vorrang; das Fahrzeug muss warten
Das Fahrzeug hat Vorrang
Wer zuerst auf der Kante steht

FEHLERPUNKTE: 4
LÖSUNG: TFF
Frage 100: Müssen Sie an einem [Zeichen 201] immer komplett anhalten, auch wenn kein Zug kommt?
Nein, nur bremsbereit sein und schauen; anhalten nur bei Signal/Zug/Schranke
Ja, immer für mindestens 3 Sekunden stoppen
Nein, einfach durchfahren`;

function parseFragen(txt: string): Frage[] {
  return txt
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const L = block
        .trim()
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const pts = parseInt(L[0].replace(/\D+/g, ""), 10);
      const sol = L[1].split(":")[1].trim();
      const m = L[2].match(/^Frage\s+(\d+):\s*(.*)$/)!;
      const answers = L.slice(3).map((t, i) => ({ t, ok: sol[i] === "T" }));
      const signs = [...block.matchAll(/\[(?:Zusatz)?[Zz]eichen ([\d.\-]+)\]/g)].map((x) => x[1]);
      const text = m[2].replace(/\[(Zusatzzeichen|Zeichen) ([\d.\-]+)\]/g, "$1 $2");
      return { nr: +m[1], pts, text, answers, signs };
    });
}

export const FRAGEN = parseFragen(FRAGEN_TXT);
export const frageByNr = (nr: number) => FRAGEN.find((f) => f.nr === nr)!;
