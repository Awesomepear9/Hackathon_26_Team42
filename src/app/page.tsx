import Link from "next/link";
import { PixelMap } from "@/components/dungeon/pixel-map";
import { Logo } from "@/components/logo";
import { CATS, DEMO_DONE } from "@/lib/dungeon/catalog";
import { demoCity } from "@/lib/dungeon/city";

const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 focus-visible:ring-offset-2 dark:focus-visible:ring-accent dark:focus-visible:ring-offset-navy-950";
const eyebrow = "font-pixel-body text-sm tracking-wide text-cyan-800 dark:text-accent";

const heroCity = demoCity("mittel", 4242);
const ctaCity = demoCity("leicht", 77);

const REASONS = [
  { title: "Geplante Reform", text: "Die Präsenzpflicht im Theorieunterricht soll entfallen. Lernen per App wird zum Normalfall." },
  { title: "Situationen statt Listen", text: "Vorfahrtsfragen kommen an der Kreuzung, Bahnfragen am Andreaskreuz, also da, wo sie hingehören." },
  { title: "Wie in der Prüfung", text: "Jede Frage zählt 2 bis 5 Fehlerpunkte. Ab 10 Punkten ist Schluss, genau wie bei der echten Theorieprüfung." },
];

function CtaCard({ href, title, text, go, children }: { href: string; title: string; text: string; go: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 dark:border-navy-800 dark:bg-navy-900 dark:focus-visible:ring-accent"
    >
      <div className="grid h-48 place-items-center overflow-hidden bg-primary dark:bg-navy-800">{children}</div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-h3 text-primary dark:text-white">{title}</h3>
        <p className="mt-2 flex-1 text-small text-navy-600 dark:text-navy-300">{text}</p>
        <span className="mt-4 text-small font-semibold text-primary group-hover:text-cyan-800 dark:text-white dark:group-hover:text-accent">
          {go} <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <Logo className="h-16 sm:h-20" alt="DigiFL" />
            <p className="mb-8 mt-3 font-semibold text-navy-600 dark:text-navy-200">Digitaler Fahrlehrer · Lernen. Üben. Sicher ankommen.</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl dark:text-white">
              Führerschein-Theorie lernen, <span className="text-cyan-700 dark:text-accent">als würdest du schon fahren.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-600 dark:text-navy-200">
              Mit der geplanten Führerschein-Reform fällt die Pflicht zum Theorieunterricht in der Fahrschule weg. Die Theorie lernst du dann
              selbstständig. Der DigiFL Theorie-Dungeon gibt dir dafür einen Ort: Du fährst durch eine Pixel-Stadt, triffst auf Ereignisse nach
              echten Verkehrssituationen und lernst die Regeln genau dort, wo du sie brauchst.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/uebersicht" className={`${btn} flex-1 bg-primary text-white hover:bg-navy-700 sm:flex-none dark:bg-accent dark:text-navy-900 dark:hover:bg-cyan-400`}>
                Jetzt spielen
              </Link>
              <Link href="#warum" className={`${btn} flex-1 border-2 border-navy-200 bg-white text-primary hover:border-navy-300 sm:flex-none dark:border-navy-700 dark:bg-navy-900 dark:text-white dark:hover:border-navy-500`}>
                Warum DigiFL?
              </Link>
            </div>
          </div>

          <div className="relative">
            <span className="absolute -left-1 -top-3 z-10 -rotate-3 bg-yellow-300 px-3 py-2 font-pixel-body text-sm text-zinc-950 ring-4 ring-zinc-950 sm:-left-4 sm:top-6">
              Jeder Run = neue Stadt
            </span>
            <div className="-rotate-1 bg-zinc-950 p-2 ring-4 ring-zinc-600">
              <PixelMap board={heroCity.board} player={heroCity.player} vehicles={heroCity.vehicles} label="Beispiel einer zufällig erzeugten Pixel-Stadt mit Kreuzungen, Verkehrszeichen und anderen Autos" />
            </div>
            <span className="absolute -bottom-3 -right-1 z-10 rotate-2 bg-white px-3 py-2 font-pixel-body text-sm text-zinc-950 ring-4 ring-zinc-950 sm:-right-4 sm:bottom-8">
              5 Herzen = 10 Fehlerpunkte
            </span>
          </div>
        </div>
      </section>

      <section id="warum" className="scroll-mt-16 border-y border-navy-100 bg-white py-12 md:py-16 dark:border-navy-800 dark:bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className={eyebrow}>WARUM SIND WIR HIER?</p>
          <h2 className="mt-2 text-h2 text-primary dark:text-white">Selbstlernen braucht einen Ort, der Sicherheit gibt.</h2>
          <p className="mt-3 max-w-3xl text-body text-navy-600 dark:text-navy-200">
            Ohne festen Theorieunterricht hängt viel an der eigenen Motivation. Reines Auswendiglernen von über tausend Fragen bereitet aber kaum auf
            den Straßenverkehr vor. Deshalb verbinden wir jede Frage mit einer Situation, die du im Spiel selbst erlebst.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {REASONS.map((r) => (
              <div key={r.title} className="border-l-4 border-accent pl-5">
                <h3 className="text-body font-bold text-primary dark:text-white">{r.title}</h3>
                <p className="mt-1.5 text-small text-navy-600 dark:text-navy-300">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className={eyebrow}>LOSLEGEN</p>
          <h2 className="mt-2 text-h2 text-primary dark:text-white">Drei Wege in den Dungeon</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <CtaCard href="/uebersicht" title="Online spielen" go="Run starten" text="Wähle eine Schwierigkeit. Jeder Run erzeugt ein neues Straßennetz mit Verkehr, Schildern und versteckten Ereignissen.">
              <div className="w-3/5 scale-95 bg-zinc-950 p-1.5 ring-4 ring-zinc-600">
                <PixelMap board={ctaCity.board} vehicles={ctaCity.vehicles} label="Kleine Pixel-Stadt" />
              </div>
            </CtaCard>
            <CtaCard href="/uebersicht" title="Fortschritt im Fragenkatalog" go="Zur Übersicht" text="Sieh, wie weit du in jedem Bereich des amtlichen Fragenkatalogs bist, vom Grundstoff bis zum Zusatzstoff Klasse B.">
              <div className="grid w-4/5 gap-3" aria-hidden="true">
                {CATS.slice(0, 4).map((c) => (
                  <div key={c.code} className="grid grid-cols-6 items-center gap-2.5 font-pixel-body text-xs text-navy-200">
                    <span>{c.code}</span>
                    <div className="col-span-5 h-2 overflow-hidden rounded-full bg-navy-700">
                      <i className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((DEMO_DONE[c.code] / c.total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CtaCard>
            <CtaCard href="#warum" title="So funktioniert's" go="Mehr erfahren" text="Feld für Feld durch die Stadt: Vor dem Abbiegen blinken, Vorfahrt beachten und notfalls abwarten. Fahrfehler kosten Fehlerpunkte.">
              <ul className="grid w-4/5 gap-2.5">
                {["Feld für Feld fahren", "Blinken und abwarten", "Schilder beachten"].map((t, i) => (
                  <li key={t} className="flex items-center gap-2.5 font-pixel-body text-sm text-white">
                    <span className="grid size-7 flex-none place-items-center bg-yellow-300 text-xs text-zinc-950">0{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </CtaCard>
          </div>
        </div>
      </section>

      <section className="pb-12 md:pb-16" aria-labelledby="praxismodul-teaser">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-8 overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8 md:grid-cols-3 dark:border-navy-800 dark:bg-navy-900">
            <div className="md:col-span-2">
              <p className={eyebrow}>EIGENSTÄNDIGE APP</p>
              <h2 id="praxismodul-teaser" className="mt-2 text-h2 text-primary dark:text-white">Das Praxismodul: echte Straßen in Fulda</h2>
              <p className="mt-3 max-w-2xl text-body text-navy-600 dark:text-navy-200">
                Vom Pixel-Dungeon auf die Straße: Das Praxismodul für die praktische Ausbildung zeigt reale Verkehrssituationen aus OpenStreetMap als reduzierte
                Illustration. Level wählen, eine Route durch Fulda fahren, Lernpunkte bewerten und die Fahrt auswerten.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link href="/praxismodul" className={`${btn} w-full bg-primary text-white hover:bg-navy-700 md:w-auto dark:bg-accent dark:text-navy-900 dark:hover:bg-cyan-400`}>
                Zum Praxismodul <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-12 text-white md:py-16 dark:bg-navy-900">
        <figure className="mx-auto grid max-w-7xl gap-2 px-4 sm:px-6 md:grid-cols-12 md:items-center md:gap-8">
          <span className="font-pixel-body text-6xl leading-none text-accent md:col-span-1 md:text-8xl" aria-hidden="true">“</span>
          <div className="md:col-span-11">
            <blockquote className="max-w-4xl text-xl font-medium leading-relaxed md:text-2xl">
              Wer eine Situation einmal selbst erlebt hat, versteht die Regel dahinter und muss sie nicht mehr auswendig lernen.
            </blockquote>
            <figcaption className="mt-3.5 text-small text-navy-300">Team DigiFL · Hackathon Fulda 2026</figcaption>
          </div>
        </figure>
      </section>
    </>
  );
}
