import { formatDate } from "@futuredesk/shared";

type EntityPanelProps<TItem extends { id: string }> = {
  title: string;
  items: TItem[];
  primary: (item: TItem) => string;
  secondary: (item: TItem) => string;
  date?: (item: TItem) => string | undefined;
};

export function EntityPanel<TItem extends { id: string }>({
  title,
  items,
  primary,
  secondary,
  date
}: EntityPanelProps<TItem>) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <span className="text-sm text-slate-500">{items.length} records</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-stone-200 p-4">
            <div className="font-medium text-ink">{primary(item)}</div>
            <div className="mt-1 text-sm text-slate-500">{secondary(item)}</div>
            {date ? <div className="mt-2 text-xs uppercase tracking-wide text-accent">{formatDate(date(item))}</div> : null}
          </div>
        ))}
        {items.length === 0 ? <div className="rounded-2xl bg-stone-50 p-4 text-sm text-slate-500">No records yet.</div> : null}
      </div>
    </section>
  );
}
