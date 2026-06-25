"use client";

import { PICK_MOODS } from "@/types/thread";

type MoodSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function MoodSelector({
  value,
  onChange,
  error,
}: MoodSelectorProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-slate-950">เลือก Mood / โทนที่ต้องการ</h2>
      <p className="mt-1 text-xs text-slate-500 font-normal">
        ปรับตามบรรยากาศที่อยากได้สำหรับโพสต์นี้
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PICK_MOODS.map((mood) => {
          const selected = value === mood;
          return (
            <button
              key={mood}
              type="button"
              onClick={() => onChange(mood)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-slate-950 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {mood}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600 font-medium">{error}</p> : null}
    </section>
  );
}
