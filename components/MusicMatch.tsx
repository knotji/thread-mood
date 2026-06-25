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
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-950 text-sm sm:text-base flex items-center gap-1.5">
          🎵 แนะนำเพลงประกอบ Reels
        </h3>
        <CopyButton value={copyValue} variant="minimal" label="คัดลอกข้อมูลเพลง 📋" />
      </div>

      <p className="text-xs leading-5 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
        {musicMatch.whyItFits} <span className="text-slate-400 font-normal">({musicMatch.mood})</span>
      </p>

      {/* Keywords */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-400">ค้นใน IG Music:</span>
        {musicMatch.songKeywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-100/50"
          >
            {keyword}
          </span>
        ))}
      </div>

      {/* Songs */}
      <div className="grid gap-2 sm:grid-cols-3">
        {musicMatch.songSuggestions.map((song) => (
          <div key={`${song.title}-${song.artist}`} className="rounded-xl bg-slate-50/50 p-2.5 border border-slate-100/80">
            <p className="font-bold text-xs text-slate-900 truncate" title={`${song.title} - ${song.artist}`}>
              {song.title} <span className="font-normal text-slate-500">· {song.artist}</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{song.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
