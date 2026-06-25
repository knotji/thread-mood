"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ThreadResult } from "@/types/thread";
import { CopyButton } from "./CopyButton";
import { MusicMatch } from "./MusicMatch";

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
  const [copiedBest, setCopiedBest] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleCopyBest() {
    const textToCopy = `${result.bestPick.overlay}\n\n${result.bestPick.caption}\n\n${result.hashtags.join(" ")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedBest(true);
    setTimeout(() => setCopiedBest(false), 2000);
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

      {/* 1. Primary Best Pack Card */}
      <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-md space-y-4 border border-slate-900">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-500/30">
            🌟 ชุดที่แนะนำ
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Overlay Box */}
          <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">คำบนคลิป (Overlay)</span>
            <p className="mt-1 whitespace-pre-line text-lg font-bold leading-7 text-sky-200">
              {result.bestPick.overlay}
            </p>
          </div>

          {/* Caption Box */}
          <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">คำใต้คลิป (Caption)</span>
            <p className="mt-1 text-sm leading-6 text-slate-100 whitespace-pre-line">
              {result.bestPick.caption}
            </p>
          </div>

          {/* Hashtags Inline */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-200 border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Rationale */}
          <p className="text-[11px] leading-relaxed text-slate-400 font-normal italic">
            💡 เหตุผล: {result.bestPick.reason}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyBest}
          className="w-full rounded-2xl bg-sky-500 hover:bg-sky-400 py-3.5 text-sm font-semibold text-slate-950 shadow-sm transition active:scale-[0.99] cursor-pointer"
        >
          {copiedBest ? "คัดลอกสำเร็จ! ✓" : "คัดลอกชุดนี้"}
        </button>
      </section>

      {/* 2. Compact Music Match */}
      <MusicMatch musicMatch={result.musicMatch} />

      {/* 3. Collapsible Section (Secondary Options) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between font-semibold text-slate-900 cursor-pointer py-1 text-sm sm:text-base select-none"
        >
          <span>ดูตัวเลือกเพิ่มเติม (คำคม/ภาพมุมอื่น)</span>
          <span className="text-slate-500 font-bold transition-transform duration-200" style={{ transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)" }}>
            ▼
          </span>
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-5 pt-4 border-t border-slate-100"
          >
            {/* Mood Summary & Content Angle */}
            <div className="space-y-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mood ของรูปภาพ</span>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{result.imageMood}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">มุมมองการนำเสนอ</span>
                <p className="mt-1 text-xs leading-relaxed text-slate-750 font-semibold text-sky-850">
                  {result.contentAngle}
                </p>
              </div>
            </div>

            {/* Other overlay options */}
            <ListSection
              title="ตัวเลือกคำแปะคลิปอื่น ๆ"
              subtitle="คำบนคลิปทางเลือก"
              items={result.overlayThreads}
              preserveLines
            />

            {/* Other caption options */}
            <ListSection
              title="ตัวเลือกเธรด / แคปชั่นอื่น ๆ"
              subtitle="ประโยคข้อคิดอื่น ๆ สำหรับเลือกสลับใช้งาน"
              items={result.captions}
            />
          </motion.div>
        )}
      </section>

      {/* Action button */}
      <button
        type="button"
        onClick={onRegenerate}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900 shadow-sm transition hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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
    <div className="space-y-2.5">
      <div>
        <h4 className="text-xs font-bold text-slate-950">{title}</h4>
        <p className="text-[10px] text-slate-400">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold text-slate-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <CopyButton value={item} label="คัดลอกแผ่นนี้" variant="minimal" />
            </div>
            <p className={`text-xs leading-6 text-slate-800 ${preserveLines ? "whitespace-pre-line" : ""}`}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
