import React from "react";

interface LevelCardProps {
  level?: number;
  title?: string;
  progressPercentage?: number;
  remainingRides?: number;
}

export function LevelCard({
  level = 3,
  title = "Kreisverkehr &\nVorfahrt",
  progressPercentage = 64,
  remainingRides = 2,
}: LevelCardProps) {
  // Ensure percentage stays between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  return (
    <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] p-6 text-white shadow-xl">
      {/* Header Section: Shield Icon + Level Title */}
      <div className="flex items-center gap-4">
        {/* Shield Badge */}
        <div className="relative flex h-14 w-12 flex-shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute inset-0 h-full w-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="relative text-xl font-extrabold text-cyan-300">
            {level}
          </span>
        </div>

        {/* Title */}
        <div>
          <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase">
            AKTUELLES LEVEL
          </span>
          <h2 className="mt-0.5 whitespace-pre-line text-lg font-bold leading-tight text-white">
            {title}
          </h2>
        </div>
      </div>

      {/* Progress Info Section */}
      <div className="mt-6">
        <span className="text-xs font-medium text-slate-400">
          Level-Fortschritt
        </span>
        <div className="mt-1 text-3xl font-extrabold text-white">
          {clampedProgress} %
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-2.5 w-full rounded-full bg-slate-800">
        <div
          className="h-2.5 rounded-full bg-cyan-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Subtext */}
      <p className="mt-3 text-xs font-medium text-slate-400">
        Noch {remainingRides} Fahrten bis Level {level + 1}
      </p>
    </div>
  );
}
