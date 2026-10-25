# Drittanbieter-Lizenzen

## Tabler Icons

Quelle: https://github.com/tabler/tabler-icons (npm `@tabler/icons`), verwendet in `src/map/eventSymbols.ts`.

```
MIT License

Copyright (c) 2020-2026 Paweł Kuna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Verkehrszeichen (Wikimedia Commons)

Amtliche Verkehrszeichen nach StVO, als amtliche Werke (§ 5 Abs. 1 UrhG) gemeinfrei. Abgerufen mit
`npm run signs` (`scripts/fetch-signs.mjs`) nach `public/signs/`; Quelle und Lizenz je Datei auch in
`src/signs/signSources.json`.

| Zeichen | Datei                                                                                                                                                                                                       | Lizenz        |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 102     | [Zeichen 102 - Kreuzung oder Einmündung mit Vorfahrt von rechts, StVO 1970.svg](https://commons.wikimedia.org/wiki/File:Zeichen_102_-_Kreuzung_oder_Einm%C3%BCndung_mit_Vorfahrt_von_rechts,_StVO_1970.svg) | Public domain |
| 131     | [Zeichen 131 - Lichtzeichenanlage, StVO 1970.svg](https://commons.wikimedia.org/wiki/File:Zeichen_131_-_Lichtzeichenanlage,_StVO_1970.svg)                                                                  | Public domain |
| 151     | [Zeichen 151 - Bahnübergang, StVO 2013.svg](https://commons.wikimedia.org/wiki/File:Zeichen_151_-_Bahn%C3%BCbergang,_StVO_2013.svg)                                                                         | Public domain |
| 205     | [Zeichen 205 - Vorfahrt gewähren! StVO 1970.svg](https://commons.wikimedia.org/wiki/File:Zeichen_205_-_Vorfahrt_gew%C3%A4hren!_StVO_1970.svg)                                                               | Public domain |
| 206     | [Zeichen 206 - Halt! Vorfahrt gewähren! StVO 2017.svg](https://commons.wikimedia.org/wiki/File:Zeichen_206_-_Halt!_Vorfahrt_gew%C3%A4hren!_StVO_2017.svg)                                                   | Public domain |
| 215     | [Zeichen 215 - Kreisverkehr, StVO 2000.svg](https://commons.wikimedia.org/wiki/File:Zeichen_215_-_Kreisverkehr,_StVO_2000.svg)                                                                              | Public domain |
| 220     | [Zeichen 220-20 - Einbahnstraße, rechtsweisend, StVO 2017.svg](https://commons.wikimedia.org/wiki/File:Zeichen_220-20_-_Einbahnstra%C3%9Fe,_rechtsweisend,_StVO_2017.svg)                                   | Public domain |
| 350     | [Zeichen 350-10 - Fußgängerüberweg (rechts), StVO 1992.svg](<https://commons.wikimedia.org/wiki/File:Zeichen_350-10_-_Fu%C3%9Fg%C3%A4nger%C3%BCberweg_(rechts),_StVO_1992.svg>)                             | Public domain |
| 325.1   | [Zeichen 325.1 - Beginn eines verkehrsberuhigten Bereichs, StVO 2013.svg](https://commons.wikimedia.org/wiki/File:Zeichen_325.1_-_Beginn_eines_verkehrsberuhigten_Bereichs,_StVO_2009.svg)                  | Public domain |
| 325.2   | [Zeichen 325.2 - Ende eines verkehrsberuhigten Bereichs, StVO 2013.svg](https://commons.wikimedia.org/wiki/File:Zeichen_325.2_-_Ende_eines_verkehrsberuhigten_Bereichs,_StVO_2009.svg)                      | Public domain |
| 330.1   | [Zeichen 330.1 - Autobahn, StVO 2013.svg](https://commons.wikimedia.org/wiki/File:Zeichen_330.1_-_Autobahn,_StVO_2013.svg)                                                                                  | Public domain |

## Schrift Inter (SIL Open Font License 1.1)

Quelle: https://github.com/rsms/inter, eingebunden über das npm-Paket `@fontsource/inter` (Webfonts)
und als daraus erzeugte Kartenschrift (`public/fonts/Inter SemiBold/`, `scripts/build-glyphs.mjs`).

```
Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter) Inter-Italic[opsz,wght].ttf: Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

## Kartendaten und Strecken (OpenStreetMap, ODbL 1.0)

Kartenkacheln, Strecken und Ereignisse beruhen auf Daten von OpenStreetMap:
**© OpenStreetMap contributors**, Lizenz Open Database License 1.0
(https://opendatacommons.org/licenses/odbl/1-0/, https://www.openstreetmap.org/copyright).

`src/data/fulda.json` ist eine aus OpenStreetMap abgeleitete Datenbank (Strecken über OSRM,
Verkehrszeichen, Tempolimits und Straßenklassen über Overpass; Wartezeiten simuliert). Sie wird unter
derselben Lizenz, der ODbL 1.0, bereitgestellt und liegt im Quellcode offen vor. Die Lizenzangaben stehen
auch in der Datei selbst (`license`, `attribution`).

Kartenkacheln: OpenFreeMap (https://openfreemap.org) im OpenMapTiles-Schema
(© OpenMapTiles, https://www.openmaptiles.org/, CC-BY 4.0).
