export default function ProgressBar({ value, label, showValue = true }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        {showValue && <span className="font-semibold text-slate-900">{Math.round(value)}%</span>}
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
