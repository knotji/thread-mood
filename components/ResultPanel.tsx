"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ThreadResult } from "@/types/thread";
import { BestPickCard } from "./BestPickCard";
import { CopyButton } from "./CopyButton";
import { MusicMatch } from "./MusicMatch";
import { ReadySummary } from "./ReadySummary";

type ResultPanelProps = {
  result: ThreadResult;
  fallback?: boolean;
  fallbackMessage?: string;
  onRegenerate: () => void;
  disabled?: boolean;
};

export function ResultPanel({
  result,
  fallback,
  fallbackMessage,
  onRegenerate,
  disabled,
}: ResultPanelProps) {
  const [copiedHero, setCopiedHero] = useState(false);

  function handleCopyHero() {
    navigator.clipboard.writeText(`${result.bestPick.overlay}\n\n${result.bestPick.caption}`);
    setCopiedHero(true);
    setTimeout(() => setCopiedHero(false), 2000);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      {fallback ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          {fallbackMessage ?? "AI สะดุดนิดหน่อย เลยแสดงชุดไอเดียสำรองให้ก่อนนะ"}
        </div>
      ) : null}

      {/* Hero Result Section */}
      <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-md space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/30">
            🌟 ประโยคที่แนะนำสุด
          </span>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
            <span className="text-xs font-semibold text-slate-400">คำบนคลิป (Overlay)</span>
            <p className="mt-1.5 whitespace-pre-line text-lg font-bold leading-8 text-sky-200">
              {result.bestPick.overlay}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
            <span className="text-xs font-semibold text-slate-400">คำใต้คลิป / แคปชั่น (Caption)</span>
            <p className="mt-1.5 text-sm leading-6 text-slate-200">
              {result.bestPick.caption}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyHero}
          className="w-full rounded-2xl bg-sky-500 hover:bg-sky-400 py-3 text-sm font-semibold text-slate-950 shadow-sm transition active:scale-[0.98] cursor-pointer"
        >
          {copiedHero ? "คัดลอกสำเร็จ! ✓" : "คัดลอกชุดแนะนำ"}
        </button>
      </section>

      <ReadySummary result={result} />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-950">Mood และมุมคอนเทนต์</h2>
            <p className="mt-2 leading-7 text-slate-700">{result.imageMood}</p>
            <p className="mt-3 rounded-2xl bg-sky-50 p-3 leading-7 text-sky-900">
              {result.contentAngle}
            </p>
          </div>
          <CopyButton value={`${result.imageMood}\n\n${result.contentAngle}`} />
        </div>
      </section>

      <ListSection
        title="Overlay Thread"
        subtitle="คำแปะคลิปสั้น ๆ อ่านทันใน 1-2 วินาที"
        items={result.overlayThreads}
        preserveLines
      />
      <ListSection
        title="เธรด / Caption"
        subtitle="คำคม ข้อคิด หรือประโยคบนคลิปที่ใช้ได้ทันที"
        items={result.captions}
      />
      <ListSection title="Hashtag แมส ๆ" subtitle="5 แฮชแท็กกว้าง ๆ สำหรับ reach" items={result.hashtags} />

      <MusicMatch musicMatch={result.musicMatch} />
      <BestPickCard bestPick={result.bestPick} />

      <button
        type="button"
        onClick={onRegenerate}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900 shadow-sm transition hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        คิดใหม่อีกชุด
      </button>
    </motion.section>
  );
}

type ListSectionProps = {
  title: string;
  subtitle: string;
  items: string[];
  preserveLines?: boolean;
};

function ListSection({ title, subtitle, items, preserveLines }: ListSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <CopyButton value={items.join("\n")} />
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <CopyButton value={item} label="คัดลอกแผ่นนี้" variant="minimal" />
            </div>
            <p className={`leading-7 text-slate-900 ${preserveLines ? "whitespace-pre-line" : ""}`}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
