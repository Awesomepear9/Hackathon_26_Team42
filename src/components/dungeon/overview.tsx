"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATS, type Category } from "@/lib/dungeon/catalog";
import { DIFF, generate, type DiffKey } from "@/lib/dungeon/city";
import { defaultStats, fmt, hearts, MAX_FP, newRun, pct, type Stats } from "@/lib/dungeon/engine";
import { act, resetProgress, useDungeon } from "@/lib/dungeon/store";
import { PixelMap, pixelBg } from "./pixel-map";

const card = "rounded-2xl border border-navy-100 bg-white p-6 shadow-card dark:border-navy-800 dark:bg-navy-900";
const sub = "mt-1 text-small text-navy-500 dark:text-navy-300";
const btn =
  "inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-small font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 dark:focus-visible:ring-accent";

// Vorschaukarten sind fest (Seed), damit Server und Browser dasselbe zeigen
const PREVIEWS = (Object.keys(DIFF) as DiffKey[]).map((k, i) => ({ key: k, city: generate(k, 900 + i * 13) }));

function Ring({ p }: { p: number }) {
  const r = 50;
  const C = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className="size-24 flex-none sm:size-32" role="img" aria-label={`${p} Prozent gelernt`}>
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" className="stroke-navy-100 dark:stroke-navy-800" />
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(C * p) / 100} ${C}`} transform="rotate(-90 60 60)" className="stroke-accent" />
      <text x="60" y="60" textAnchor="middle" fontSize="25" fontWeight="700" className="fill-primary dark:fill-white">{p} %</text>
      <text x="60" y="80" textAnchor="middle" fontSize="11" className="fill-navy-500 dark:fill-navy-300">gelernt</text>
    </svg>
  );
}

function CatRows({ stats, group }: { stats: Stats; group: Category["group"] }) {
  return (
    <ul className="mt-2 divide-y divide-navy-50 dark:divide-navy-800">
      {CATS.filter((c) => c.group === group).map((c) => {
        const d = stats.done[c.code] ?? 0;
        const p = pct(d, c.total);
        return (
          <li key={c.code} className="grid grid-cols-12 items-center gap-3 py-3">
            <code className="col-span-2 rounded-md bg-cyan-100 py-1 text-center text-caption text-cyan-900 sm:col-span-1 dark:bg-cyan-950 dark:text-cyan-200">{c.code}</code>
            <div className="col-span-7 sm:col-span-9">
              <p className="mb-2 text-small font-semibold text-primary dark:text-white">{c.name}</p>
              <div className="h-2 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label={c.name}>
                <i className={`block h-full rounded-full ${p >= 70 ? "bg-success" : p < 35 ? "bg-warning" : "bg-accent"}`} style={{ width: `${p}%` }} />
              </div>
            </div>
            <p className="col-span-3 text-right text-caption font-normal text-navy-500 sm:col-span-2 dark:text-navy-300">
              <b className="text-small text-primary dark:text-white">{d}</b> / {c.total}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function Overview() {
  const state = useDungeon();
  const router = useRouter();
  const stats = state?.stats ?? defaultStats();
  const G = state?.run ?? null;
  const live = G && !G.over;

  const total = CATS.reduce((a, c) => a + c.total, 0);
  const done = CATS.reduce((a, c) => a + (stats.done[c.code] ?? 0), 0);
  const weakest = [...CATS].sort((a, b) => (stats.done[a.code] ?? 0) / a.total - (stats.done[b.code] ?? 0) / b.total).slice(0, 3);
  const runs = stats.runs;

  const start = (k: DiffKey) => {
    act((d) => newRun(d, k));
    router.push("/spiel");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:pt-10">
      <h1 className="text-h1 text-primary dark:text-white">Übersicht</h1>
      <p className="mt-1 text-body text-navy-500 dark:text-navy-300">Dein Fortschritt und dein nächster Run</p>

      {live && (
        <div className="mt-6 flex flex-wrap items-center gap-5 rounded-2xl bg-primary p-5 text-white dark:bg-navy-800">
          <div className="h-10 w-8 flex-none" style={pixelBg("/dungeon/cars/auto_spieler.png")} aria-hidden="true" />
          <div>
            <p className="font-semibold">Laufender Run · {DIFF[G.diff].name}</p>
            <p className="text-small text-navy-300">
              {Object.values(G.events).filter((e) => e.st).length} von {Object.keys(G.events).length} Ereignissen · {fmt(G.fp)} Fehlerpunkte ·{" "}
              {fmt(hearts(G))} Herzen übrig
            </p>
          </div>
          <Link href="/spiel" className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent px-4 text-small font-semibold text-navy-900 hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:ml-auto sm:w-auto">
            Fortsetzen
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className={`${card} lg:col-span-2`}>
          <h2 className="text-h3 text-primary dark:text-white">Lernstand gesamt</h2>
          <p className={sub}>Fragen aus dem Katalog, die du schon richtig beantwortet hast</p>
          <div className="mt-4 flex items-center gap-6">
            <Ring p={pct(done, total)} />
            <p className="text-small leading-relaxed text-navy-500 dark:text-navy-300">
              <b className="text-2xl text-primary dark:text-white">{done}</b> von {total}
              <br />
              Fragen gemeistert
            </p>
          </div>
          <p className="mt-5 text-caption uppercase text-navy-500 dark:text-navy-300">Als Nächstes üben</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {weakest.map((c) => (
              <span key={c.code} className="rounded-md bg-cyan-100 px-2 py-1 text-caption font-semibold tracking-normal text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200">
                {c.code} {c.name}
              </span>
            ))}
          </div>
        </section>

        <section className={`${card} lg:col-span-3`}>
          <h2 className="text-h3 text-primary dark:text-white">Deine Runs</h2>
          <p className={sub}>Bestanden heißt: weniger als {MAX_FP} Fehlerpunkte</p>
          <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
            {[
              [runs.length, "Runs gespielt"],
              [runs.filter((r) => r.res === "ok").length, "bestanden"],
              [runs.length ? fmt(Math.min(...runs.map((r) => r.fp))) : "–", "wenigste Fehlerpunkte"],
            ].map(([v, k]) => (
              <div key={k} className="flex flex-col-reverse rounded-xl bg-navy-50 p-3 sm:p-4 dark:bg-navy-800">
                <dt className="mt-0.5 text-caption font-normal tracking-normal text-navy-500 dark:text-navy-300">{k}</dt>
                <dd className="text-xl font-bold text-primary sm:text-2xl dark:text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-navy-100 text-left text-caption text-navy-500 dark:border-navy-800 dark:text-navy-300">
                  <th className="py-2.5 font-semibold">Datum</th>
                  <th className="py-2.5 font-semibold">Stufe</th>
                  <th className="py-2.5 font-semibold">Ereignisse</th>
                  <th className="py-2.5 text-right font-semibold">Fehlerpunkte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50 text-primary dark:divide-navy-800 dark:text-navy-100">
                {runs.slice(0, 3).map((r, i) => (
                  <tr key={i}>
                    <td className="py-3">{r.d}</td>
                    <td className="py-3">{r.diff}</td>
                    <td className="py-3">{r.ev}</td>
                    <td className="py-3 text-right">
                      <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-caption tracking-normal ${r.res === "ok" ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"}`}>
                        {fmt(r.fp)} · {r.res === "ok" ? "bestanden" : "nicht bestanden"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mb-4 mt-12 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-h2 text-primary dark:text-white">Neuen Run starten</h2>
        <span className="text-small text-navy-500 dark:text-navy-300">Die Stadt wird bei jedem Run neu erzeugt</span>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {PREVIEWS.map(({ key, city }) => {
          const d = DIFF[key];
          return (
            <section key={key} className="flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card dark:border-navy-800 dark:bg-navy-900">
              <div className="relative grid h-44 place-items-center bg-zinc-950 px-6">
                <span className={`absolute left-3 top-3 z-30 px-2 py-1 font-pixel-body text-xs text-zinc-950 ring-2 ring-zinc-950 ${d.color}`}>{d.name.toUpperCase()}</span>
                <PixelMap run={city} player={false} marks={false} label={`Beispielstadt ${d.name}`} className="max-h-40" style={{ maxWidth: `calc(10rem * ${city.w / city.h})` }} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="flex items-center gap-2.5 text-h3 text-primary dark:text-white">
                  {d.name}
                  <span className="flex gap-1" aria-label={`Schwierigkeit ${d.dots} von 3`}>
                    {[1, 2, 3].map((i) => (
                      <i key={i} className={`size-2 rounded-sm ${i <= d.dots ? "bg-primary dark:bg-accent" : "bg-navy-100 dark:bg-navy-700"}`} />
                    ))}
                  </span>
                </h3>
                <p className={sub}>{d.desc}</p>
                <dl className="mb-4 mt-3 grid flex-1 content-start gap-2 text-small text-navy-600 dark:text-navy-300">
                  {[
                    ["Stadtgebiet", `${d.w} × ${d.h} Felder`],
                    ["Ereignisse", d.events],
                    ["Fehlerpunkte erlaubt", "max. 9"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-dashed border-navy-100 pb-1.5 dark:border-navy-800">
                      <dt>{k}</dt>
                      <dd className="font-semibold text-primary dark:text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  onClick={() => start(key)}
                  className={`${btn} ${key === "mittel" ? "bg-primary text-white hover:bg-navy-700 dark:bg-accent dark:text-navy-900 dark:hover:bg-cyan-400" : "border-2 border-navy-200 text-primary hover:border-navy-300 dark:border-navy-700 dark:text-white dark:hover:border-navy-500"}`}
                >
                  {d.name} starten
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mb-4 mt-12 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-h2 text-primary dark:text-white">Fortschritt im Fragenkatalog</h2>
        <span className="text-small text-navy-500 dark:text-navy-300">Gliederung nach amtlichem Fragenkatalog · Klasse B</span>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className={card}>
          <h3 className="text-h3 text-primary dark:text-white">Grundstoff</h3>
          <CatRows stats={stats} group="Grundstoff" />
        </section>
        <section className={card}>
          <h3 className="text-h3 text-primary dark:text-white">Zusatzstoff Klasse B</h3>
          <CatRows stats={stats} group="Zusatzstoff Klasse B" />
        </section>
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-3 text-caption font-normal tracking-normal text-navy-500 dark:text-navy-300">
        Gespeichert wird nur lokal in diesem Browser. Fragenanzahlen und Startwerte sind Beispieldaten.
        <button type="button" onClick={resetProgress} className="rounded text-primary underline underline-offset-2 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 dark:text-white dark:hover:text-accent">
          Fortschritt zurücksetzen
        </button>
      </p>
    </div>
  );
}
