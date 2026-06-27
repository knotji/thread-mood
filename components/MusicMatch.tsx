import type { ThreadResult } from "@/types/thread";
import { CopyButton } from "./CopyButton";
import { songCatalog } from "@/src/data/songCatalog";

type MusicMatchProps = {
  musicMatch: ThreadResult["musicMatch"];
};

export function MusicMatch({ musicMatch }: MusicMatchProps) {
  const matchedSongs = (musicMatch.selectedSongIds ?? [])
    .map((id) => songCatalog.find((song) => song.id === id))
    .filter((song): song is typeof songCatalog[number] => song !== undefined);

  const copyLines = [
    `Mood: ${musicMatch.musicMood}`,
    `ค้นใน IG/TikTok: ${musicMatch.suggestedSearchTerms.join(", ")}`,
  ];
  if (matchedSongs.length > 0) {
    copyLines.push(
      ...matchedSongs.map((song) => `${song.title} - ${song.artist}`),
    );
  }
  if (musicMatch.musicNote) {
    copyLines.push(`Note: ${musicMatch.musicNote}`);
  }
  copyLines.push("แนะนำให้เช็กชื่อเพลงใน IG/TikTok อีกครั้งก่อนลงจริง");
  const copyValue = copyLines.join("\n");

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-950 text-sm sm:text-base flex items-center gap-1.5">
          🎵 แนะนำเพลงประกอบ Reels
        </h3>
        <CopyButton value={copyValue} variant="minimal" label="คัดลอกข้อมูลเพลง 📋" />
      </div>

      <p className="text-xs leading-5 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
        {musicMatch.musicNote ? `${musicMatch.musicNote} ` : ""}
        <span className="text-slate-400 font-normal">({musicMatch.musicMood})</span>
      </p>

      {/* Keywords / Search Terms */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-400">ค้นใน IG/TikTok:</span>
        {musicMatch.suggestedSearchTerms.map((keyword) => (
          <span
            key={keyword}
            className="rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-100/50"
          >
            {keyword}
          </span>
        ))}
      </div>

      {/* Songs Display */}
      {matchedSongs.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {matchedSongs.map((song) => (
            <div key={song.id} className="rounded-xl bg-slate-50/50 p-2.5 border border-slate-100/80">
              <p className="font-bold text-xs text-slate-900 truncate" title={`${song.title} - ${song.artist}`}>
                {song.title} <span className="font-normal text-slate-500">· {song.artist}</span>
              </p>
              {song.note && (
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{song.note}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center">
          <p className="text-xs text-slate-500">
            ลองค้นเพลงแนว{" "}
            <span className="font-medium text-slate-700">
              {musicMatch.musicMood}
            </span>{" "}
            ด้วยคำค้นด้านบนใน IG/TikTok
          </p>
        </div>
      )}

      {/* Small Note */}
      <p className="text-[10px] text-slate-400 text-right italic font-medium">
        * แนะนำให้เช็กชื่อเพลงใน IG/TikTok อีกครั้งก่อนลงจริง
      </p>
    </section>
  );
}
