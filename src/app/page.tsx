import { LevelCard } from "@/components/levelCard";
import { GoalCard } from "@/components/goalCard";
import { TotalRidesCard } from "@/components/totalRidesCard";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 md:pt-28">
      <LevelCard
        level={2}
        title="Kreisverkehr & Vorfahrt"
        progressPercentage={90}
        remainingRides={2}
      />
      <div className="grid grid-cols-2 gap-2 pt-2">
        <GoalCard
          totalDistance={1000}
          currentDistance={420}
        />
        <TotalRidesCard
          totalRides={12}
        />
      </div>
    </div>
  );
}
