export function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-28 items-end gap-1">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[9px] text-primary-900/50">{d.value || ""}</span>
          <div
            title={`${d.label} : ${d.value}`}
            className="w-full rounded-t bg-primary-500"
            style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%` }}
          />
          <span className="text-[9px] text-primary-900/40">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DistributionBars({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-xs text-primary-900/70">
            <span>{d.label}</span>
            <span>
              {d.value} ({Math.round((d.value / total) * 100)}%)
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-primary-100">
            <div
              className="h-2 rounded-full bg-primary-600"
              style={{ width: `${(d.value / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
