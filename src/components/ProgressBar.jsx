export default function ProgressBar({ value, max = 100, label, hint }) {
  const percentage = max ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {label ? <p className="text-sm font-semibold text-slate-800">{label}</p> : null}
          {hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
        </div>
        <span className="text-sm font-semibold text-slate-700">{percentage}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
