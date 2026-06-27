"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategorySelector } from "@/components/CategorySelector";
import { Hero } from "@/components/Hero";
import { ImageUploader } from "@/components/ImageUploader";
import { LoadingState } from "@/components/LoadingState";
import { ResultPanel } from "@/components/ResultPanel";
import { ToneSelector } from "@/components/ToneSelector";
import { PhotoPickerUploader } from "@/components/PhotoPickerUploader";
import { PlatformSelector } from "@/components/PlatformSelector";
import { MoodSelector } from "@/components/MoodSelector";
import { PhotoPickResultPanel } from "@/components/PhotoPickResultPanel";
import type { ThreadResult, PhotoPickResult } from "@/types/thread";

type Errors = {
  image?: string;
  category?: string;
  tone?: string;
  submit?: string;
};

type PickerErrors = {
  images?: string;
  platform?: string;
  mood?: string;
  submit?: string;
};

type UploadedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

// Mock results containing realistic Thai copy
const mockThreadResult: ThreadResult = {
  imageMood: "ภาพนี้ให้ความรู้สึกเหงา นิ่งสงบ เหมือนยืนมองท้องฟ้ายามเย็นเพียงลำพัง แสงสีส้มอมม่วงให้ฟีลปล่อยใจ",
  contentAngle: "การยอมรับความเงียบเหงาในฐานะเพื่อนที่เข้าใจเราที่สุด",
  overlayThreads: [
    "บางวันไม่ได้อยากเก่ง\nแค่อยากเงียบไปเฉย ๆ",
    "ท้องฟ้ายังกว้างพอ\nให้เราวางความเหนื่อยล้า",
    "ไม่ต้องมีคนเข้าใจหรอก\nแค่นึกขอบคุณตัวเองก็พอ",
    "ปล่อยใจไปกับแสงเย็น\nแล้วค่อยเริ่มใหม่พรุ่งนี้",
    "ความสุขไม่ได้หายไปไหน\nมันแค่เปลี่ยนรูปแบบเดินทาง"
  ],
  captions: [
    "บางเวลาการได้อยู่เงียบ ๆ กับตัวเอง ก็เป็นวิธีฮีลใจที่ดีที่สุดแล้ว",
    "ไม่ต้องพยายามเป็นทุกอย่างของใคร แค่เป็นคนที่รักตัวเองให้ทันก็พอ",
    "เก็บความเหนื่อยล้าของวันนี้ไว้ แล้วปล่อยให้ท้องฟ้าช่วงเย็นช่วยปลอบใจนะ"
  ],
  hashtags: ["#reelsไทย", "#viralreels", "#fyp", "#ท้องฟ้า", "#เธรดความรู้สึก"],
  musicMatch: {
    musicMood: "เพลงเหงาละมุน ฟังสบาย จังหวะอะคูสติกช้า ๆ",
    suggestedSearchTerms: ["acoustic thai indie", "reels sad music", "เพลงเหงาปล่อยใจ"],
    selectedSongIds: ["12", "18"],
    musicNote: "เข้ากับอารมณ์ของภาพท้องฟ้ายามเย็น ช่วยพยุงบรรยากาศให้ดิ่งลึกแต่ยังอบอุ่นในหัวใจ"
  },
  bestPick: {
    overlay: "ท้องฟ้ายังกว้างพอ\nให้เราวางความเหนื่อยล้า",
    caption: "บางเวลาการได้อยู่เงียบ ๆ กับตัวเอง ก็เป็นวิธีฮีลใจที่ดีที่สุดแล้ว",
    reason: "ชุดนี้สั้น เข้าใจง่าย และดึงอารมณ์ผู้คนให้หยุดอ่านและแชร์ต่อได้ดีที่สุด"
  }
};

const mockPhotoPickResult: PhotoPickResult = {
  moodSummary: "เซตรูปภาพนี้เน้นสไตล์ มินิมอล มีความอบอุ่น ละมุน และมีมิติของแสงเงาที่ถ่ายทอดความรู้สึกนิ่งและผ่อนคลายได้เป็นอย่างดี เหมาะกับสไตล์คาเฟ่หรือไลฟ์สไตล์ชิล ๆ",
  bestPhotoIndex: 2,
  bestPhotoReason: "รูปที่ 2 มีความสมมาตร การจัดวางวัตถุเด่นชัด และมีแสงธรรมชาติที่สาดส่องเข้ามาทางหน้าต่าง ช่วยดึงดูดสายตาเป็นรูปเปิดเรื่องที่แข็งแรงที่สุดสำหรับรูปแบบ Story",
  rankedPhotos: [
    {
      index: 2,
      score: 10,
      suggestedUse: "ใช้เป็นรูปหน้าปกหรือสตอรี่หน้าแรกสุดเพื่อตรึงสายตาผู้ชม"
    },
    {
      index: 3,
      score: 9,
      suggestedUse: "ใช้เป็นรูปขยายรายละเอียด ซูมแก้วกาแฟหรือขนมเพื่อเปลี่ยนบรรยากาศสายตา"
    },
    {
      index: 1,
      score: 8,
      suggestedUse: "ใช้แสดงบรรยากาศกว้าง ๆ ของสถานที่เพื่อให้ภาพรวมมีชีวิตชีวา"
    }
  ],
  skipPhotos: [
    {
      index: 5,
      reason: "รูปที่ 5 มีสัดส่วนของเงาที่มืดเกินไปจนมองเห็นรายละเอียดไม่ชัด และสีโทนเย็นเกินไป ไม่เข้าพวกกับรูปอื่น"
    }
  ],
  storySequence: [
    { index: 2, transitionText: "เริ่มวันใหม่ในมุมสงบ ๆ" },
    { index: 3, transitionText: "กลิ่นหอมของกาแฟแก้วโปรด" },
    { index: 1, transitionText: "และเวลาส่วนตัวที่ค่อย ๆ หมุนไป" }
  ],
  feedOrder: [2, 3, 1, 4, 6],
  coverIndex: 2,
  captionSuggestion: "แค่ได้หยุดพัก จิบกาแฟอุ่น ๆ ในมุมสงบ ก็นับเป็นเรื่องดีของวันนี้แล้ว ☕✨",
  hashtags: ["#reelsไทย", "#viralreels", "#fyp", "#คาเฟ่", "#มินิมอล"],
  totalUploaded: 6,
  shortlistedCount: 5,
  shortlistedIndices: [1, 2, 3, 4, 6],
};

function DemoContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get("state") || "thread-upload";
  const cleanParam = searchParams.get("clean") === "1";
  const controlsParam = searchParams.get("controls") === "hidden";
  const isCleanMode = cleanParam || controlsParam;

  const [showControls, setShowControls] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const buildLink = (targetState: string) => {
    let url = `/demo?state=${targetState}`;
    if (cleanParam) url += "&clean=1";
    if (controlsParam) url += "&controls=hidden";
    return url;
  };

  // Set standard HTML mode
  const mode = state.startsWith("photo-picker") ? "picker" : "thread";

  // Safe mock files (only instantiated in browser context after mount to prevent SSR hydration mismatch)
  const mockFile = hasMounted ? new File([], "demo1.png") : null;

  const mockImages: UploadedImage[] = hasMounted ? [
    { id: "1", file: new File([], "demo1.png"), previewUrl: "/demo/demo1.svg" },
    { id: "2", file: new File([], "demo2.png"), previewUrl: "/demo/demo2.svg" },
    { id: "3", file: new File([], "demo3.png"), previewUrl: "/demo/demo3.svg" },
    { id: "4", file: new File([], "demo4.png"), previewUrl: "/demo/demo4.svg" },
    { id: "5", file: new File([], "demo5.png"), previewUrl: "/demo/demo5.svg" },
    { id: "6", file: new File([], "demo6.png"), previewUrl: "/demo/demo6.svg" }
  ] : [];


  // Setup state overrides
  let image: File | null = null;
  let previewUrl = "";
  let category = "";
  let tone = "";
  let errors: Errors = {};
  let result: ThreadResult | null = null;

  let images: UploadedImage[] = [];
  let pickerPlatform = "";
  let pickerMood = "";
  let pickerErrors: PickerErrors = {};
  let pickerResult: PhotoPickResult | null = null;

  let isLoading = false;
  let loadingIndex = 0;

  // Map query states to mock properties
  if (state === "thread-upload") {
    // Left empty
  } else if (state === "thread-preview") {
    image = mockFile;
    previewUrl = "/demo/demo1.svg";
    category = "ท้องฟ้า";
    tone = "ฮีลใจ";
  } else if (state === "thread-loading") {
    image = mockFile;
    previewUrl = "/demo/demo1.svg";
    category = "ท้องฟ้า";
    tone = "ฮีลใจ";
    isLoading = true;
    loadingIndex = 1; // "กำลังหาเธรดที่ทำให้คนหยุดดู…"
  } else if (state === "thread-result") {
    image = mockFile;
    previewUrl = "/demo/demo1.svg";
    category = "ท้องฟ้า";
    tone = "ฮีลใจ";
    result = mockThreadResult;
  } else if (state === "thread-error") {
    image = mockFile;
    previewUrl = "/demo/demo1.svg";
    category = "ท้องฟ้า";
    tone = "ฮีลใจ";
    errors = { submit: "โควต้า Gemini เต็มชั่วคราว เลยจัดชุดสำรองตามหมวดและโทนให้ก่อนนะ" };
  } else if (state === "photo-picker-upload") {
    // Left empty
  } else if (state === "photo-picker-preview") {
    images = mockImages;
    pickerPlatform = "Story";
    pickerMood = "มินิมอล";
  } else if (state === "photo-picker-loading") {
    images = mockImages;
    pickerPlatform = "Story";
    pickerMood = "มินิมอล";
    isLoading = true;
  } else if (state === "photo-picker-result") {
    images = mockImages;
    pickerPlatform = "Story";
    pickerMood = "มินิมอล";
    pickerResult = mockPhotoPickResult;
  } else if (state === "photo-picker-error") {
    images = mockImages;
    pickerPlatform = "Story";
    pickerMood = "มินิมอล";
    pickerErrors = { submit: "เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง" };
  }

  const isSummaryShown = (mode === "thread" ? !!result : !!pickerResult) && !isEditing;

  function handleDemoSubmit() {
    alert("คุณอยู่ในโหมดทดลองจับภาพหน้าจอ (Demo Mode) กรุณาใช้แผงควบคุมด้านล่างเพื่อเลือกสถานะ");
  }

  return (
    <main className={`min-h-screen bg-[#fbfaf7] px-4 py-5 text-slate-950 sm:px-6 ${isCleanMode ? "pb-10" : "pb-28"}`}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        
        {/* Left Column */}
        <div className="space-y-5 lg:sticky lg:top-6">
          {!isCleanMode && (
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-block shadow-sm">
              ⚙️ DEMO MODE SCREENSHOT STATE: {state}
            </div>
          )}

          {isSummaryShown ? (
            mode === "thread" ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {previewUrl && (
                    <div className="relative size-12 overflow-hidden rounded-xl border border-slate-100 shrink-0">
                      <img src={previewUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                      คิดเธรดจากรูป
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 font-semibold flex-wrap">
                      <span>หมวด: {category}</span>
                      <span className="text-slate-300">•</span>
                      <span>โทน: {tone}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs whitespace-nowrap shrink-0 transition select-none"
                >
                  แก้ไขรูป/ตัวเลือก
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-4">
                    {(() => {
                      const shortlisted = pickerResult?.shortlistedIndices
                        ? images.filter((_, idx) => pickerResult.shortlistedIndices?.includes(idx + 1))
                        : images.slice(0, 5);
                      return (
                        <>
                          {shortlisted.slice(0, 3).map((img, idx) => (
                            <div key={img.id} className="relative size-10 overflow-hidden rounded-xl border-2 border-white shadow-sm shrink-0">
                              <img src={img.previewUrl} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {shortlisted.length > 3 && (
                            <div className="relative size-10 rounded-xl bg-slate-900 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-[10px] font-bold text-white z-10 select-none">
                              +{shortlisted.length - 3}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                      รูปภาพที่อัปโหลด (AI คัดเหลือ {(pickerResult?.shortlistedIndices?.length ?? 5)}/{images.length} รูป)
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 font-semibold flex-wrap">
                      <span>แพลตฟอร์ม: {pickerPlatform}</span>
                      <span className="text-slate-300">•</span>
                      <span>Mood: {pickerMood}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs whitespace-nowrap shrink-0 transition select-none"
                >
                  แก้ไขรูป/ตัวเลือก
                </button>
              </div>
            )
          ) : (
            <>
              <Hero />

              {/* Mode Switcher */}
              <div className="flex rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200 ring-1 ring-slate-100/50 pointer-events-none">
                <div
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition text-center ${
                    mode === "thread" ? "bg-slate-950 text-white shadow-sm" : "text-slate-400"
                  }`}
                >
                  คิดเธรดจากรูป
                </div>
                <div
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition text-center ${
                    mode === "picker" ? "bg-slate-950 text-white shadow-sm" : "text-slate-400"
                  }`}
                >
                  เลือกรูปให้หน่อย
                </div>
              </div>

              {mode === "thread" ? (
                <ImageUploader
                  file={image}
                  previewUrl={previewUrl}
                  error={errors.image}
                  onChange={() => {}}
                />
              ) : (
                <PhotoPickerUploader
                  images={images}
                  onChange={() => {}}
                  error={pickerErrors.images}
                  onError={() => {}}
                />
              )}
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4 pb-10 lg:pt-8">
          {!isSummaryShown ? (
            mode === "thread" ? (
              <>
                <CategorySelector value={category} onChange={() => {}} error={errors.category} />
                <ToneSelector value={tone} onChange={() => {}} error={errors.tone} />

                {errors.submit ? (
                  <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 font-medium">
                    {errors.submit}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleDemoSubmit}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-semibold text-white shadow-sm cursor-pointer"
                >
                  คิดเธรดให้หน่อย
                </button>
              </>
            ) : (
              <>
                <PlatformSelector value={pickerPlatform} onChange={() => {}} error={pickerErrors.platform} />
                <MoodSelector value={pickerMood} onChange={() => {}} error={pickerErrors.mood} />

                {pickerErrors.submit ? (
                  <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 font-medium">
                    {pickerErrors.submit}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleDemoSubmit}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-semibold text-white shadow-sm cursor-pointer"
                >
                  ให้ AI คัดและวิเคราะห์รูปให้
                </button>
              </>
            )
          ) : null}

          {isLoading ? (
            <LoadingState
              messageIndex={loadingIndex}
              message={mode === "picker" ? "กำลังประมวลผลรูปภาพและจัดอันดับด้วย AI…" : undefined}
            />
          ) : null}

          {mode === "thread" && result ? (
            <ResultPanel
              result={result}
              fallback={false}
              onRegenerate={handleDemoSubmit}
            />
          ) : null}

          {mode === "picker" && pickerResult ? (
            <PhotoPickResultPanel
              result={pickerResult}
              images={images}
              platform={pickerPlatform}
              fallback={false}
              onRegenerate={handleDemoSubmit}
            />
          ) : null}
        </div>
      </div>

      {/* Floating Eye Button to show controls when hidden */}
      {!isCleanMode && !showControls && (
        <button
          type="button"
          onClick={() => setShowControls(true)}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-slate-950 text-white shadow-lg border border-slate-700 cursor-pointer select-none print:hidden hover:scale-105 transition"
          title="แสดงแผงควบคุม Demo"
        >
          👁️
        </button>
      )}

      {/* Floating Demo Navigation Control Panel */}
      {!isCleanMode && showControls && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 text-white p-3 border-t border-slate-700 backdrop-blur-md flex flex-wrap items-center justify-center gap-2 select-none print:hidden shadow-2xl">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            💻 Demo States:
          </span>
          <a
            href={buildLink("thread-upload")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-upload" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Upload
          </a>
          <a
            href={buildLink("thread-preview")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-preview" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Preview
          </a>
          <a
            href={buildLink("thread-loading")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-loading" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Loading
          </a>
          <a
            href={buildLink("thread-result")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-result" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Result
          </a>
          <a
            href={buildLink("thread-error")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-error" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Error
          </a>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          <a
            href={buildLink("photo-picker-upload")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-upload" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Upload
          </a>
          <a
            href={buildLink("photo-picker-preview")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-preview" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Preview
          </a>
          <a
            href={buildLink("photo-picker-loading")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-loading" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Loading
          </a>
          <a
            href={buildLink("photo-picker-result")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-result" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Result
          </a>
          <a
            href={buildLink("photo-picker-error")}
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-error" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Error
          </a>

          <button
            type="button"
            onClick={() => setShowControls(false)}
            className="ml-4 px-2 py-1 text-[10px] rounded bg-red-600 text-white font-semibold cursor-pointer hover:bg-red-700"
          >
            ซ่อนแผง
          </button>
        </div>
      )}
    </main>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">กำลังโหลดโหมดทดลอง...</div>}>
      <DemoContent />
    </Suspense>
  );
}
