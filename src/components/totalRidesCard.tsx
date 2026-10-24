interface TotalRidesCardProps {
  totalRides?: number;
}

export function TotalRidesCard({ totalRides = 12 }: TotalRidesCardProps) {
  return (
    <div className="inline-flex flex-col rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
      {/* Top Row: Checkmark Icon + Total Rides Value */}
      <div className="flex items-center gap-3">
        {/* Circular Light-Green Background with Checkmark Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        {/* Main Value */}
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
          {totalRides}
        </span>
      </div>

      {/* Subtitle Label */}
      <span className="mt-2 text-sm font-medium text-slate-500">
        Fahrten absolviert
      </span>
    </div>
  );
}
