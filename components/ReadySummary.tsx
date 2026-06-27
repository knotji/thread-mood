import type { ThreadResult } from "@/types/thread";
import { CopyButton } from "./CopyButton";
import { songCatalog } from "@/src/data/songCatalog";

type ReadySummaryProps = {
  result: ThreadResult;
};

export function ReadySummary({ result }: ReadySummaryProps) {
  const matchedSongs = (result.musicMatch.selectedSongIds ?? [])
    .map((id) => songCatalog.find((song) => song.id === id))
    .filter((song): song is typeof songCatalog[number] => song !== undefined);

  const primarySong = matchedSongs[0];
  const songLine = primarySong
    ? `${primarySong.title} - ${primarySong.artist}`
    : `ลองค้นเพลงแนว: ${result.musicMatch.musicMood}`;

  const searchKeywords = result.musicMatch.suggestedSearchTerms ?? [];
  const hashtags = result.hashtags.join(" ");
  const copyValue = [
    "ข้อความบนคลิป / ใต้คลิป:",
    result.bestPick.caption,
    "",
    "แฮชแท็ก:",
    hashtags,
    "",
    "เพลง:",
    songLine,
    `Keywords: ${searchKeywords.join(", ")}`,
    "",
    "แนะนำให้เช็กชื่อเพลงใน IG/TikTok อีกครั้งก่อนลงจริง",
  ].join("\n");

  return (
    <section className="rounded-3xl border border-sky-100 bg-sky-50 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            สรุปพร้อมลง
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Best Pick สำหรับคลิปนี้
          </h2>
        </div>
        <CopyButton value={copyValue} label="คัดลอกทั้งชุด" />
      </div>

      <div className="space-y-3">
        <SummaryItem
          title="ข้อความบนคลิป / ใต้คลิป"
          copyValue={result.bestPick.caption}
          copyLabel="คัดลอกข้อความ"
          preserveLines
        >
          {result.bestPick.caption}
        </SummaryItem>
        <SummaryItem
          title="แฮชแท็กแมส ๆ"
          copyValue={hashtags}
          copyLabel="คัดลอก #"
        >
          {hashtags}
        </SummaryItem>
        <SummaryItem
          title="เพลง"
          copyValue={`${songLine}\nKeywords: ${searchKeywords.join(", ")}\nแนะนำให้เช็กชื่อเพลงใน IG/TikTok อีกครั้งก่อนลงจริง`}
          copyLabel="คัดลอกเพลง"
        >
          <span className="font-semibold">{songLine}</span>
          <span className="mt-1 block text-sm text-slate-500">
            ค้นเพิ่มใน IG/TikTok: {searchKeywords.join(", ")}
          </span>
          <span className="mt-1 block text-[10px] text-slate-400 italic font-medium">
            * แนะนำให้เช็กชื่อเพลงใน IG/TikTok อีกครั้งก่อนลงจริง
          </span>
        </SummaryItem>
      </div>
    </section>
  );
}

type SummaryItemProps = {
  title: string;
  children: React.ReactNode;
  preserveLines?: boolean;
  copyValue?: string;
  copyLabel?: string;
};

function SummaryItem({
  title,
  children,
  preserveLines,
  copyValue,
  copyLabel,
}: SummaryItemProps) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-sky-100/80">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {copyValue ? <CopyButton value={copyValue} label={copyLabel} /> : null}
      </div>
      <div
        className={`mt-1 leading-7 text-slate-950 ${
          preserveLines ? "whitespace-pre-line text-lg font-semibold" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
