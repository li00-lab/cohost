type Activity = {
  time?: string;
  title: string;
  description?: string;
};

type Day = {
  day: number;
  title?: string;
  activities?: Activity[];
};

export default function Timeline({ data }: { data: Day[] }) {
  if (!data?.length) return null;

  return (
    <div className="space-y-8">
      {data.map((day) => (
        <div key={day.day}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shrink-0">
              Day {day.day}
            </div>
            {day.title && (
              <span className="text-sm text-zinc-400">{day.title}</span>
            )}
          </div>

          <div className="ml-2 border-l border-zinc-700 pl-5 space-y-4">
            {day.activities?.map((a, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-500" />
                <div className="flex items-start gap-3">
                  {a.time && (
                    <span className="text-xs font-mono text-zinc-500 shrink-0 pt-0.5 w-10">
                      {a.time}
                    </span>
                  )}
                  <div>
                    <p className="text-sm text-zinc-100">{a.title}</p>
                    {a.description && (
                      <p className="text-xs text-zinc-500 mt-0.5">{a.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
