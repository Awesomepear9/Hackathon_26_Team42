import Link from "next/link";

const CATEGORIES = [
  { name: "Vorfahrt & Vorrang", icon: "⛔" },
  { name: "Verkehrszeichen", icon: "🛑" },
  { name: "Fahrzeugtechnik", icon: "🔧" },
  { name: "Umwelt & Entlastung", icon: "🌿" },
  { name: "Verhalten im Straßenverkehr", icon: "🚗" },
  { name: "Gefahrenlehre", icon: "⚠️" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="mb-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Willkommen zurück 👋</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Bereite dich optimal auf deine Fahrschulprüfung vor.
        </p>
      </section>

      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Dein Lernfortschritt</p>
          <p className="mt-1 text-3xl font-bold">42%</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-[42%] rounded-full bg-zinc-900 dark:bg-white" />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Beantwortete Fragen</p>
          <p className="mt-1 text-3xl font-bold">1.240</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Richtige Antworten</p>
          <p className="mt-1 text-3xl font-bold">87%</p>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-xl">Lernkategorien</h2>
          <Link
            href="/lernen"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Alle anzeigen
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <li key={cat.name}>
              <Link
                href="/lernen"
                className="flex h-full flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium leading-tight">
                  {cat.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link
          href="/pruefung"
          className="flex items-center justify-between rounded-2xl bg-zinc-900 p-6 text-white transition-transform hover:scale-[1.01] dark:bg-white dark:text-zinc-900 lg:col-span-2"
        >
          <div>
            <h3 className="text-lg font-semibold">Prüfungssimulation</h3>
            <p className="mt-1 text-sm text-white/70 dark:text-zinc-600">
              Teste dich unter Realbedingungen – 30 Fragen, 30 Minuten.
            </p>
          </div>
          <span className="text-2xl">🎯</span>
        </Link>
        <Link
          href="/karte"
          className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
        >
          <div>
            <h3 className="text-lg font-semibold">Karte</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Fahrschulen und Standorte in deiner Nähe.
            </p>
          </div>
          <span className="text-2xl">🗺️</span>
        </Link>
      </section>
    </div>
  );
}