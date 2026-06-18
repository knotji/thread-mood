"use client";

import { CATEGORIES } from "@/types/thread";

type CategorySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function CategorySelector({
  value,
  onChange,
  error,
}: CategorySelectorProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-slate-950">เลือกหมวดคอนเทนต์</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const selected = value === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-slate-950 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
