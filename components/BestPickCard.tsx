import type { ThreadResult } from "@/types/thread";
import { CopyButton } from "./CopyButton";

type BestPickCardProps = {
  bestPick: ThreadResult["bestPick"];
};

export function BestPickCard({ bestPick }: BestPickCardProps) {
  const copyValue = `${bestPick.overlay}\n\n${bestPick.caption}\n\nเหตุผล: ${bestPick.reason}`;

  return (
    <section className="rounded-3xl bg-slate-950 p-4 text-white shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Best Pick</h3>
          <p className="mt-1 text-sm text-slate-300">ชุดที่เหมาะสุดสำหรับเริ่มลงคลิป</p>
        </div>
        <CopyButton value={copyValue} />
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-sm font-medium text-slate-300">Overlay</p>
          <p className="mt-1 whitespace-pre-line text-lg font-semibold leading-8">
            {bestPick.overlay}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-sm font-medium text-slate-300">Caption</p>
          <p className="mt-1 leading-7">{bestPick.caption}</p>
        </div>
        <p className="text-sm leading-6 text-slate-300">{bestPick.reason}</p>
      </div>
    </section>
  );
}
