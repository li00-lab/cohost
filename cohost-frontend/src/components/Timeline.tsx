"use client";

import { useState, useEffect, useRef } from "react";

type NormalizedActivity = {
  time?: string;
  title: string;
};

type NormalizedDay = {
  label: string;
  activities: NormalizedActivity[];
};

function normalize(data: any): NormalizedDay[] {
  if (!data) return [];

  if (!Array.isArray(data) && Array.isArray(data.sections)) {
    return data.sections.map((s: any, i: number) => ({
      label: s.title ?? `Day ${i + 1}`,
      activities: (s.items ?? []).map((item: any) => ({
        time: item.time,
        title: item.description ?? item.title ?? "",
      })),
    }));
  }

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

type EditTarget = { day: number; act: number; field: "time" | "title" };

export default function Timeline({ data }: { data: any }) {
  const [days, setDays] = useState<NormalizedDay[]>(() => normalize(data));
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset editable state whenever the agent pushes new data
  useEffect(() => {
    setDays(normalize(data));
    setEditing(null);
  }, [data]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (!days.length) return null;

  const startEdit = (day: number, act: number, field: "time" | "title") =>
    setEditing({ day, act, field });

  const commitEdit = (value: string) => {
    if (!editing) return;
    setDays((prev) => {
      const next = prev.map((d) => ({ ...d, activities: d.activities.map((a) => ({ ...a })) }));
      const act = next[editing.day].activities[editing.act];
      if (editing.field === "time") act.time = value || undefined;
      else act.title = value;
      return next;
    });
    setEditing(null);
  };

  const isEditing = (day: number, act: number, field: "time" | "title") =>
    editing?.day === day && editing?.act === act && editing?.field === field;

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
              <div key={j} className="relative group">
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-500" />
                <div className="flex items-start gap-3">
                  {/* Time field */}
                  <div className="shrink-0 w-12 pt-0.5">
                    {isEditing(i, j, "time") ? (
                      <input
                        ref={inputRef}
                        defaultValue={a.time ?? ""}
                        className="w-full text-xs font-mono bg-zinc-700 text-zinc-100 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-500"
                        onBlur={(e) => commitEdit(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit((e.target as HTMLInputElement).value);
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => startEdit(i, j, "time")}
                        className="text-xs font-mono text-zinc-500 cursor-text hover:text-zinc-300 transition-colors"
                      >
                        {a.time ?? <span className="opacity-0 group-hover:opacity-100 text-zinc-600">+time</span>}
                      </span>
                    )}
                  </div>

                  {/* Title field */}
                  {isEditing(i, j, "title") ? (
                    <input
                      ref={isEditing(i, j, "time") ? undefined : inputRef}
                      defaultValue={a.title}
                      className="flex-1 text-sm bg-zinc-700 text-zinc-100 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-500"
                      onBlur={(e) => commitEdit(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit((e.target as HTMLInputElement).value);
                        if (e.key === "Escape") setEditing(null);
                      }}
                    />
                  ) : (
                    <p
                      onClick={() => startEdit(i, j, "title")}
                      className="text-sm text-zinc-100 cursor-text hover:text-white flex-1 rounded px-1 -mx-1 hover:bg-zinc-800 transition-colors"
                    >
                      {a.title}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
