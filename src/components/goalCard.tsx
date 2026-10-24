interface GoalCardProps {
  currentDistance?: number;
  totalDistance?: number;
}


export function GoalCard({
  currentDistance = 389,
  totalDistance: totalDistance = 1000, }: GoalCardProps) {
  // Format numbers to German locale (e.g. 1000 -> 1.000)
  const formattedCurrent = currentDistance.toLocaleString("de-DE");
  const formattedTotal = totalDistance.toLocaleString("de-DE");
  return (
    <div className="inline-flex flex-col rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
      {/* Top Row: Navigation Icon + Current Value */}
      <div className="flex items-center gap-3">
        {/* Circular Light-Cyan Background with Navigation Arrow */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100/70 text-cyan-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 -rotate-45 translate-x-[1px] -translate-y-[1px]"
          >
            <path d="M3 11l19-9-9 19-2-8-8-2z" />
          </svg>
        </div>

        {/* Main Distance Text */}
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
          {formattedCurrent} km
        </span>
      </div>

      {/* Subtitle / Goal Text */}
      <span className="mt-2 text-sm font-medium text-slate-500">
        von {formattedTotal} km
      </span>
    </div>
  );
}


