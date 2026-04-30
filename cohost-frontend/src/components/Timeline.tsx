type NormalizedActivity = {
  time?: string;
  title: string;
};

type NormalizedDay = {
  label: string;
  activities: NormalizedActivity[];
};

// Normalize whatever shape the agent returns into a flat list of days + activities.
function normalize(data: any): NormalizedDay[] {
  if (!data) return [];

  // Shape A — agent returns an object: { title, sections: [{ title, items: [{time, description}] }] }
  if (!Array.isArray(data) && Array.isArray(data.sections)) {
    return data.sections.map((s: any, i: number) => ({
      label: s.title ?? `Day ${i + 1}`,
      activities: (s.items ?? []).map((item: any) => ({
        time: item.time,
        title: item.description ?? item.title ?? "",
      })),
    }));
  }

  // Shape B — agent returns an array: [{ day, title, activities: [{time, title}] }]
  if (Array.isArray(data)) {
    return data.map((d: any, i: number) => ({
      label: d.day != null ? `Day ${d.day}` : (d.title ?? `Day ${i + 1}`),
      activities: (d.activities ?? d.items ?? []).map((a: any) => ({
        time: a.time,
        title: a.title ?? a.description ?? "",
      })),
    }));
  }

  return [];
}

export default function Timeline({ data }: { data: any }) {
  const days = normalize(data);
  if (!days.length) return null;

  return (
    <div className="space-y-8">
      {days.map((day, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shrink-0">
              {day.label}
            </div>
          </div>

          <div className="ml-2 border-l border-zinc-700 pl-5 space-y-4">
            {day.activities.map((a, j) => (
              <div key={j} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-500" />
                <div className="flex items-start gap-3">
                  {a.time && (
                    <span className="text-xs font-mono text-zinc-500 shrink-0 pt-0.5 w-10">
                      {a.time}
                    </span>
                  )}
                  <p className="text-sm text-zinc-100">{a.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
