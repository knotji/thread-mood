import type { ThreadResult } from "@/types/thread";
import { CopyButton } from "./CopyButton";

type MusicMatchProps = {
  musicMatch: ThreadResult["musicMatch"];
};

export function MusicMatch({ musicMatch }: MusicMatchProps) {
  const copyValue = [
    musicMatch.mood,
    musicMatch.whyItFits,
    `Keywords: ${musicMatch.songKeywords.join(", ")}`,
    ...musicMatch.songSuggestions.map(
      (song) => `${song.title} - ${song.artist}: ${song.reason}`,
    ),
  ].join("\n");

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">AI Music Match</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            เพลงเป็นไอเดียตั้งต้น แนะนำให้ค้นชื่อเพลงหรือ keyword ใน IG Music อีกครั้ง
          </p>
        </div>
        <CopyButton value={copyValue} />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-500">Mood เพลง</p>
          <p className="mt-1 text-slate-900">{musicMatch.mood}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-500">ทำไมถึงเข้ากัน</p>
          <p className="mt-1 leading-7 text-slate-900">{musicMatch.whyItFits}</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-500">Keywords สำหรับ IG Music</p>
          <div className="flex flex-wrap gap-2">
            {musicMatch.songKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {musicMatch.songSuggestions.map((song) => (
            <div key={`${song.title}-${song.artist}`} className="rounded-2xl bg-slate-50 p-3">
              <p className="font-semibold text-slate-950">
                {song.title} · {song.artist}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{song.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
