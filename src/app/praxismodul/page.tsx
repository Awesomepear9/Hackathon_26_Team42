import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Praxismodul",
  description:
    "Das DigiFL-Praxismodul ist die eigenständige Fahrschul-App für die praktische Ausbildung: echte Straßensituationen in Fulda aus OpenStreetMap als reduzierte Verkehrsillustration.",
};

const APP_URL = "/apps/praxismodul/index.html";

const FEATURES = [
  { title: "Level wählen", text: "Vom Kreisverkehr bis zur Vorfahrt: Jedes Level bündelt Lernpunkte für eine Fahrt." },
  { title: "Route in Fulda fahren", text: "Die Fahrt wird auf echten Straßen simuliert, Ereignisse wie Ampeln und Vorfahrtschilder erscheinen an ihrem Ort." },
  { title: "Fahrt auswerten", text: "Lernpunkte bewerten, Tempo-Verlauf ansehen und sehen, wie viel bis zum nächsten Level fehlt." },
  { title: "Live am Standort", text: "Die Live-Karte zeigt die Straßensituation dort, wo du gerade bist. Die Position bleibt im Gerät." },
  { title: "Zurück zur Theorie", text: "Über die Schwerter in der App-Navigation geht es direkt zum Theorie-Dungeon oder zur Website." },
];

export default function PraxismodulPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:pt-10">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <p className="font-pixel-body text-sm tracking-wide text-cyan-800 dark:text-accent">EIGENSTÄNDIGE APP</p>
          <h1 className="mt-2 text-h1 text-primary dark:text-white">Praxismodul</h1>
          <p className="mt-4 max-w-xl text-body text-navy-600 dark:text-navy-200">
            Das Praxismodul ist die Fahrschul-App für die praktische Ausbildung und ergänzt den Theorie-Dungeon um echte Straßen: Sie zeigt Verkehrssituationen aus OpenStreetMap als
            flache, reduzierte Illustration – so, wie du sie später in Fulda erlebst. Die App läuft eigenständig und lässt sich hier direkt
            ausprobieren oder in einem eigenen Fenster öffnen.
          </p>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="border-l-4 border-accent pl-5">
                <h2 className="text-body font-bold text-primary dark:text-white">{f.title}</h2>
                <p className="mt-1.5 text-small text-navy-600 dark:text-navy-300">{f.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 focus-visible:ring-offset-2 sm:flex-none dark:bg-accent dark:text-navy-900 dark:hover:bg-cyan-400 dark:focus-visible:ring-accent dark:focus-visible:ring-offset-navy-950"
            >
              App in neuem Tab öffnen <span aria-hidden="true">↗</span>
            </a>
          </div>

          <p className="mt-6 max-w-xl text-small text-navy-500 dark:text-navy-300">
            Technik: React, Vite und MapLibre GL mit Vektor-Tiles von OpenFreeMap. Kartendaten © OpenStreetMap-Mitwirkende. Der Quellcode liegt
            als eigenes Projekt unter <code className="rounded bg-navy-100 px-1 py-0.5 text-caption tracking-normal dark:bg-navy-800">apps/praxismodul</code>.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-sm rounded-4xl bg-primary p-3 shadow-2xl ring-1 ring-navy-700 dark:bg-navy-800">
            <iframe
              src={APP_URL}
              title="DigiFL Praxismodul – Fahrschul-App"
              className="aspect-9/19 w-full rounded-3xl bg-surface"
              allow="geolocation"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
