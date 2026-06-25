"use client";

import { PICK_PLATFORMS } from "@/types/thread";

type PlatformSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function PlatformSelector({
  value,
  onChange,
  error,
}: PlatformSelectorProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-slate-950">เลือกแพลตฟอร์ม / รูปแบบการใช้งาน</h2>
      <p className="mt-1 text-xs text-slate-500 font-normal">
        เลือกปลายทางเพื่อการให้คะแนนและจัดลำดับรูปภาพที่เหมาะสม
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PICK_PLATFORMS.map((platform) => {
          const selected = value === platform;
          return (
            <button
              key={platform}
              type="button"
              onClick={() => onChange(platform)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-slate-950 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {platform}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600 font-medium">{error}</p> : null}
    </section>
  );
}
