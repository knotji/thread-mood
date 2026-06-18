"use client";

import { TONES } from "@/types/thread";

type ToneSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function ToneSelector({ value, onChange, error }: ToneSelectorProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-slate-950">เลือกโทนการเขียน</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {TONES.map((tone) => {
          const selected = value === tone;
          return (
            <button
              key={tone}
              type="button"
              onClick={() => onChange(tone)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {tone}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
