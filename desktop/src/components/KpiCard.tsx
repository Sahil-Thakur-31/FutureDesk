type KpiCardProps = {
  label: string;
  value: number;
  accent: string;
};

export function KpiCard({ label, value, accent }: KpiCardProps) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-card">
      <div className="mb-4 h-2 w-14 rounded-full" style={{ backgroundColor: accent }} />
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-3 font-display text-4xl font-semibold text-ink">{value}</div>
    </div>
  );
}
