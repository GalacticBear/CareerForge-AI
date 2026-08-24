export default function ScoreRing({ score }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth="10" fill="none" className="text-slate-100" />
        <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth="10" fill="none" strokeLinecap="round" className="text-indigo-600" strokeDasharray={`${dash} ${circumference - dash}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center"><div className="text-3xl font-bold text-slate-900">{Math.round(score)}%</div><div className="text-[11px] uppercase tracking-wide text-slate-500">match</div></div>
      </div>
    </div>
  );
}
