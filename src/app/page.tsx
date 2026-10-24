import { LevelCard } from "@/components/levelCard";
export default function HomePage() {
  return (

    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 md:pt-28">
      <LevelCard
        level={3}
        title="Kreisverkehr & Vorfahrt"
        progressPercentage={64}
        remainingRides={2}
      />
      <p className="mt-6 max-w-xl text-body text-navy-600 dark:text-navy-200">
        Deine Open-Source-Lernplattform für die Theorieprüfung –
        bald mit Lernmodus, Prüfungssimulation und Karte.
      </p>
    </div>
  );
}
