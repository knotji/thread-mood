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
    mood: "เพลงเหงาละมุน ฟังสบาย จังหวะอะคูสติกช้า ๆ",
    whyItFits: "เข้ากับอารมณ์ของภาพท้องฟ้ายามเย็น ช่วยพยุงบรรยากาศให้ดิ่งลึกแต่ยังอบอุ่นในหัวใจ",
    songKeywords: ["acoustic thai indie", "reels sad music", "เพลงเหงาปล่อยใจ"],
    songSuggestions: [
      {
        title: "ตกละมุน",
        artist: "Landokmai",
        reason: "ให้ฟีลล่องลอย เหมาะกับบรรยากาศช่วงพระอาทิตย์ตกดิน"
      },
      {
        title: "ปล่อยใจ",
        artist: "Safeplanet",
        reason: "จังหวะฟังสบาย ช่วยเยียวยาจิตใจและชวนล่องลอยไปกับภาพ"
      },
      {
        title: "คิดถึงยามเย็น",
        artist: "Indie Artist",
        reason: "เน้นเสียงกีตาร์เบา ๆ สื่อถึงความคิดถึงที่ไม่มีจุดหมาย"
      }
    ]
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
  hashtags: ["#reelsไทย", "#viralreels", "#fyp", "#คาเฟ่", "#มินิมอล"]
};

function DemoContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get("state") || "thread-upload";
  const [showControls, setShowControls] = useState(true);

  // Set standard HTML mode
  const mode = state.startsWith("photo-picker") ? "picker" : "thread";

  // Safe mock files (only instantiated in browser context to prevent SSR problems)
  const mockFile = typeof window !== "undefined" ? new File([], "demo1.png") : null;

  const mockImages: UploadedImage[] = typeof window !== "undefined" ? [
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

  function handleDemoSubmit() {
    alert("คุณอยู่ในโหมดทดลองจับภาพหน้าจอ (Demo Mode) กรุณาใช้แผงควบคุมด้านล่างเพื่อเลือกสถานะ");
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 text-slate-950 sm:px-6 pb-28">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-5 lg:sticky lg:top-6">
          <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-block shadow-sm">
            ⚙️ DEMO MODE SCREENSHOT STATE: {state}
          </div>
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
        </div>

        <div className="space-y-4 pb-10 lg:pt-8">
          {mode === "thread" ? (
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
                เลือกรูปให้หน่อย
              </button>
            </>
          )}

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
      {!showControls && (
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
      {showControls && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 text-white p-3 border-t border-slate-700 backdrop-blur-md flex flex-wrap items-center justify-center gap-2 select-none print:hidden shadow-2xl">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            💻 Demo States:
          </span>
          <a
            href="/demo?state=thread-upload"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-upload" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Upload
          </a>
          <a
            href="/demo?state=thread-preview"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-preview" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Preview
          </a>
          <a
            href="/demo?state=thread-loading"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-loading" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Loading
          </a>
          <a
            href="/demo?state=thread-result"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-result" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Result
          </a>
          <a
            href="/demo?state=thread-error"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "thread-error" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Thread Error
          </a>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          <a
            href="/demo?state=photo-picker-upload"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-upload" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Upload
          </a>
          <a
            href="/demo?state=photo-picker-preview"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-preview" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Preview
          </a>
          <a
            href="/demo?state=photo-picker-loading"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-loading" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Loading
          </a>
          <a
            href="/demo?state=photo-picker-result"
            className={`px-3 py-1.5 text-xs rounded-xl transition ${
              state === "photo-picker-result" ? "bg-sky-600 font-bold" : "bg-slate-800 hover:bg-slate-750"
            }`}
          >
            Picker Result
          </a>
          <a
            href="/demo?state=photo-picker-error"
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
