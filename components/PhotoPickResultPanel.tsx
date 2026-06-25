"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { PhotoPickResult } from "@/types/thread";
import { CopyButton } from "./CopyButton";

type UploadedImage = {
  previewUrl: string;
};

type PhotoPickResultPanelProps = {
  result: PhotoPickResult;
  images: UploadedImage[];
  platform: string;
  fallback?: boolean;
  fallbackMessage?: string;
  onRegenerate: () => void;
  disabled?: boolean;
};

export function PhotoPickResultPanel({
  result,
  images,
  platform,
  fallback,
  fallbackMessage,
  onRegenerate,
  disabled,
}: PhotoPickResultPanelProps) {
  // Safe helper to get image preview URL from 1-based index
  const getImgUrl = (idx: number) => {
    return images[idx - 1]?.previewUrl || "";
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {fallback ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          {fallbackMessage ?? "AI สะดุดนิดหน่อย เลยวิเคราะห์แบบสำรองให้ก่อนนะ"}
        </div>
      ) : null}

      {/* Mood Summary Card */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">วิเคราะห์ Mood ภาพรวม</h2>
            <p className="mt-2 text-base leading-7 text-slate-700 font-medium">
              {result.moodSummary}
            </p>
          </div>
          <CopyButton value={result.moodSummary} />
        </div>
      </section>

      {/* Best Pick Section */}
      <section className="rounded-3xl border border-sky-100 bg-sky-50/50 p-5 shadow-sm ring-1 ring-sky-100">
        <h2 className="text-base font-bold text-sky-950 flex items-center gap-2">
          ✨ รูปที่ดีที่สุดสำหรับ {platform}
        </h2>
        
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          {getImgUrl(result.bestPhotoIndex) ? (
            <div className="relative aspect-square w-full max-w-[160px] overflow-hidden rounded-2xl border border-sky-200 shadow-sm shrink-0 mx-auto sm:mx-0">
              <Image
                src={getImgUrl(result.bestPhotoIndex)}
                alt="รูปที่ดีที่สุด"
                fill
                className="object-cover"
                sizes="160px"
              />
              <div className="absolute top-2 left-2 rounded-lg bg-sky-600 px-2 py-0.5 text-xs font-bold text-white">
                รูป {result.bestPhotoIndex}
              </div>
            </div>
          ) : null}

          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-sky-900 text-sm sm:text-base">เหตุผลที่ AI เลือกรูปนี้</h3>
            <p className="text-sm leading-6 text-slate-700">{result.bestPhotoReason}</p>
          </div>
        </div>
      </section>

      {/* Rankings Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-950">🏆 การจัดอันดับความน่าสนใจ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {result.rankedPhotos.map((item, idx) => (
            <div
              key={`rank-${idx}`}
              className="flex flex-col rounded-2xl bg-slate-50 p-3 relative border border-slate-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="grid size-6 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  รูป {item.index}
                </span>
                <span className="ml-auto rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                  {item.score}/10 คะแนน
                </span>
              </div>

              {getImgUrl(item.index) ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 mb-2">
                  <Image
                    src={getImgUrl(item.index)}
                    alt={`Rank ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ) : null}

              <p className="text-xs text-slate-600 leading-5 mt-1 flex-1">{item.suggestedUse}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform specific suggestions */}
      {platform === "Story" && result.storySequence && result.storySequence.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
            📖 ลำดับการลง Story แนะนำ
          </h2>
          <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
            {result.storySequence.map((step, idx) => (
              <div key={`story-step-${idx}`} className="flex items-start gap-4 relative">
                <div className="grid size-10 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 border-2 border-white shadow-sm shrink-0">
                  {idx + 1}
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row gap-3 rounded-2xl bg-slate-50/50 border border-slate-100 p-3">
                  {getImgUrl(step.index) ? (
                    <div className="relative aspect-square w-16 overflow-hidden rounded-xl border border-slate-200 shrink-0 mx-auto sm:mx-0">
                      <Image
                        src={getImgUrl(step.index)}
                        alt={`Story slide ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      <div className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.2 text-[8px] font-bold text-white">
                        รูป {step.index}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-semibold text-slate-400">คำทรานซิชัน / คำแปะ Story</span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                      &ldquo;{step.transitionText}&rdquo;
                    </p>
                  </div>
                  <div className="self-center sm:self-start">
                    <CopyButton value={step.transitionText} label="คัดลอกคำแปะ" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {platform === "Feed" && result.feedOrder && result.feedOrder.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-950">
            📱 ลำดับการเรียงรูปใน Carousel Feed
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50/50 border border-amber-100 p-3 text-sm text-amber-800">
              📌 แนะนำให้ใช้ <span className="font-bold">รูป {result.coverIndex ?? result.bestPhotoIndex}</span> เป็นรูปหน้าปก (Cover Photo)
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {result.feedOrder.map((photoIdx, idx) => (
                <div key={`feed-step-${idx}`} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1 rounded-2xl bg-slate-50 p-2 border border-slate-100 shadow-sm">
                    {getImgUrl(photoIdx) ? (
                      <div className="relative aspect-square w-16 overflow-hidden rounded-xl border border-slate-200">
                        <Image
                          src={getImgUrl(photoIdx)}
                          alt={`Feed slot ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        {photoIdx === (result.coverIndex ?? result.bestPhotoIndex) ? (
                          <div className="absolute top-1 left-1 rounded bg-amber-500 px-1 py-0.2 text-[8px] font-bold text-white">
                            ปก
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <span className="text-[10px] font-semibold text-slate-500">ลำดับที่ {idx + 1} (รูป {photoIdx})</span>
                  </div>
                  
                  {idx < (result.feedOrder?.length ?? 0) - 1 ? (
                    <span className="text-slate-300 font-bold">➔</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Caption Suggestion & Hashtags */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-950">📝 ไอเดียแคปชั่น & Hashtag</h2>
        
        {result.captionSuggestion ? (
          <div className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">ไอเดียแคปชั่นแนะนำ</span>
              <CopyButton value={result.captionSuggestion} />
            </div>
            <p className="text-sm leading-6 text-slate-800 font-medium whitespace-pre-line">
              {result.captionSuggestion}
            </p>
          </div>
        ) : null}

        {result.hashtags && result.hashtags.length > 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Hashtag แนะนำเพื่อการเข้าถึง</span>
              <CopyButton value={result.hashtags.join(" ")} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.hashtags.map((tag, idx) => (
                <span
                  key={`tag-${idx}`}
                  className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-100/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Skip Photos Section (If any) */}
      {result.skipPhotos && result.skipPhotos.length > 0 ? (
        <section className="rounded-3xl border border-amber-100 bg-amber-50/20 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
            ⚠️ รูปภาพที่แนะนำให้ข้ามหรือไม่ลง (หากทำได้)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.skipPhotos.map((item, idx) => (
              <div
                key={`skip-${idx}`}
                className="flex gap-3 rounded-2xl bg-white border border-amber-100/60 p-3 shadow-xs"
              >
                {getImgUrl(item.index) ? (
                  <div className="relative aspect-square w-12 overflow-hidden rounded-xl border border-slate-200 shrink-0 opacity-60 grayscale-[40%]">
                    <Image
                      src={getImgUrl(item.index)}
                      alt={`Skip image ${item.index}`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    <div className="absolute top-0.5 left-0.5 rounded bg-red-500 px-1 py-0.2 text-[8px] font-bold text-white">
                      รูป {item.index}
                    </div>
                  </div>
                ) : null}
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-amber-700">รูปที่ {item.index}</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Action button */}
      <button
        type="button"
        onClick={onRegenerate}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-900 shadow-sm transition hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        วิเคราะห์ใหม่อีกครั้ง
      </button>
    </motion.section>
  );
}
