export default function Timeline({ data }: any) {
  return (
    <div className="space-y-6">
      {data.map((day: any) => (
        <div key={day.day} className="border p-4 rounded">
          <h3 className="font-bold text-lg">Day {day.day}</h3>

          {day.activities.map((a: any, i: number) => (
            <div key={i} className="text-sm text-gray-400">
              {a.time} — {a.title}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
