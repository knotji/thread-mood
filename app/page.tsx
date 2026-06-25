"use client";

import { useEffect, useState, useRef } from "react";
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
import type { GenerateThreadResponse, ThreadResult, PhotoPickResult } from "@/types/thread";

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

export default function Home() {
  const [mode, setMode] = useState<"thread" | "picker">("thread");
  const [isEditing, setIsEditing] = useState(false);

  // Thread Generator states
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<ThreadResult | null>(null);
  const [fallback, setFallback] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | undefined>();

  // Photo Picker states
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [pickerPlatform, setPickerPlatform] = useState("");
  const [pickerMood, setPickerMood] = useState("");
  const [pickerErrors, setPickerErrors] = useState<PickerErrors>({});
  const [pickerResult, setPickerResult] = useState<PhotoPickResult | null>(null);
  const [pickerFallback, setPickerFallback] = useState(false);
  const [pickerFallbackMessage, setPickerFallbackMessage] = useState<string | undefined>();

  // Shared loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  // Refs for auto-scrolling
  const threadResultRef = useRef<HTMLDivElement>(null);
  const pickerResultRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  // Refs for tracking preview URLs to revoke on unmount
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const previewUrlRef = useRef(previewUrl);
  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      imagesRef.current.forEach((img) => {
        URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, []);

  // Auto-scroll when results are loaded
  useEffect(() => {
    if (result && !isLoading && shouldScrollRef.current) {
      setTimeout(() => {
        threadResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        shouldScrollRef.current = false;
      }, 100);
    }
  }, [result, isLoading]);

  useEffect(() => {
    if (pickerResult && !isLoading && shouldScrollRef.current) {
      setTimeout(() => {
        pickerResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        shouldScrollRef.current = false;
      }, 100);
    }
  }, [pickerResult, isLoading]);

  const isSummaryShown = (mode === "thread" ? !!result : !!pickerResult) && !isEditing;

  function handleImageChange(nextImage: File | null, error?: string) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(nextImage);
    setPreviewUrl(nextImage ? URL.createObjectURL(nextImage) : "");
    setErrors((current) => ({ ...current, image: error, submit: undefined }));
  }

  function handleImagesChange(nextImages: UploadedImage[]) {
    // Revoke URLs for removed images
    images.forEach((img) => {
      if (!nextImages.some((n) => n.id === img.id)) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setImages(nextImages);
    setPickerErrors((current) => ({ ...current, images: undefined, submit: undefined }));
  }

  async function handleGenerate() {
    const nextErrors: Errors = {};

    if (!image) nextErrors.image = "กรุณาอัปโหลดรูปก่อนนะ";
    if (!category) nextErrors.category = "กรุณาเลือกหมวดคอนเทนต์ก่อนนะ";
    if (!tone) nextErrors.tone = "กรุณาเลือกโทนการเขียนก่อนนะ";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !image) return;

    setLoadingIndex(Math.floor(Math.random() * 4));
    setIsLoading(true);
    setFallback(false);
    setFallbackMessage(undefined);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("category", category);
      formData.append("tone", tone);

      const response = await fetch("/api/generate-thread", {
        method: "POST",
        body: formData,
      });
      const data = await readGenerateResponse(response);

      if (!response.ok) {
        setErrors({ submit: data.error ?? "ยังคิดเธรดไม่ได้ ลองใหม่อีกครั้งนะ" });
        return;
      }

      if (!data.result) {
        setErrors({ submit: data.error ?? "ยังไม่ได้ผลลัพธ์ ลองกดใหม่อีกครั้งนะ" });
        return;
      }

      shouldScrollRef.current = true;
      setResult(data.result);
      setFallback(Boolean(data.fallback));
      setFallbackMessage(data.fallback ? data.error : undefined);
      setErrors({});
      setIsEditing(false);
    } catch (error) {
      console.error("Generate request failed", error);
      setErrors({
        submit:
          error instanceof Error && error.message
            ? error.message
            : "เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้งนะ",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePickPhotos() {
    const nextErrors: PickerErrors = {};

    if (images.length < 2 || images.length > 6) {
      nextErrors.images = "กรุณาเลือกรูปภาพ 2 ถึง 6 รูปนะ";
    }
    if (!pickerPlatform) {
      nextErrors.platform = "กรุณาเลือกแพลตฟอร์มก่อนนะ";
    }
    if (!pickerMood) {
      nextErrors.mood = "กรุณาเลือก Mood ก่อนนะ";
    }

    setPickerErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoadingIndex(Math.floor(Math.random() * 4));
    setIsLoading(true);
    setPickerFallback(false);
    setPickerFallbackMessage(undefined);

    try {
      const formData = new FormData();
      images.forEach((img) => {
        formData.append("images", img.file);
      });
      formData.append("platform", pickerPlatform);
      formData.append("mood", pickerMood);

      const response = await fetch("/api/pick-photos", {
        method: "POST",
        body: formData,
      });

      const data = await readPickResponse(response);

      if (!response.ok) {
        setPickerErrors({ submit: data.error ?? "ยังเลือกรูปให้ไม่ได้ ลองใหม่อีกครั้งนะ" });
        return;
      }

      if (!data.result) {
        setPickerErrors({ submit: data.error ?? "ยังไม่ได้ผลลัพธ์ ลองกดใหม่อีกครั้งนะ" });
        return;
      }

      shouldScrollRef.current = true;
      setPickerResult(data.result);
      setPickerFallback(Boolean(data.fallback));
      setPickerFallbackMessage(data.fallback ? data.error : undefined);
      setPickerErrors({});
      setIsEditing(false);
    } catch (error) {
      console.error("Pick photos request failed", error);
      setPickerErrors({
        submit:
          error instanceof Error && error.message
            ? error.message
            : "เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้งนะ",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 text-slate-950 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        
        {/* Left Column */}
        <div className="space-y-5 lg:sticky lg:top-6">
          {isSummaryShown ? (
            // Render Compact Summary Card when Result is present
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
                    {images.slice(0, 3).map((img, idx) => (
                      <div key={img.id} className="relative size-10 overflow-hidden rounded-xl border-2 border-white shadow-sm shrink-0">
                        <img src={img.previewUrl} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {images.length > 3 && (
                      <div className="relative size-10 rounded-xl bg-slate-900 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-[10px] font-bold text-white z-10 select-none">
                        +{images.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                      เลือกรูปให้หน่อย ({images.length} รูป)
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-650 font-semibold flex-wrap">
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
            // Normal input view
            <>
              <Hero />

              {/* Premium Glassmorphic Mode Switcher */}
              <div className="flex rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200 ring-1 ring-slate-100/50">
                <button
                  type="button"
                  onClick={() => {
                    setMode("thread");
                    setIsEditing(false);
                  }}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition cursor-pointer select-none ${
                    mode === "thread"
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  คิดเธรดจากรูป
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("picker");
                    setIsEditing(false);
                  }}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition cursor-pointer select-none ${
                    mode === "picker"
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  เลือกรูปให้หน่อย
                </button>
              </div>

              {mode === "thread" ? (
                <ImageUploader
                  file={image}
                  previewUrl={previewUrl}
                  error={errors.image}
                  onChange={handleImageChange}
                />
              ) : (
                <PhotoPickerUploader
                  images={images}
                  onChange={handleImagesChange}
                  error={pickerErrors.images}
                  onError={(err) => setPickerErrors((c) => ({ ...c, images: err }))}
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
                <CategorySelector
                  value={category}
                  onChange={(value) => {
                    setCategory(value);
                    setErrors((current) => ({ ...current, category: undefined }));
                  }}
                  error={errors.category}
                />
                <ToneSelector
                  value={tone}
                  onChange={(value) => {
                    setTone(value);
                    setErrors((current) => ({ ...current, tone: undefined }));
                  }}
                  error={errors.tone}
                />

                {errors.submit ? (
                  <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 font-medium">
                    {errors.submit}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 cursor-pointer select-none"
                >
                  {isLoading ? "กำลังคิดให้อยู่…" : "คิดเธรดให้หน่อย"}
                </button>
              </>
            ) : (
              <>
                <PlatformSelector
                  value={pickerPlatform}
                  onChange={(value) => {
                    setPickerPlatform(value);
                    setPickerErrors((current) => ({ ...current, platform: undefined }));
                  }}
                  error={pickerErrors.platform}
                />
                <MoodSelector
                  value={pickerMood}
                  onChange={(value) => {
                    setPickerMood(value);
                    setPickerErrors((current) => ({ ...current, mood: undefined }));
                  }}
                  error={pickerErrors.mood}
                />

                {pickerErrors.submit ? (
                  <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 font-medium">
                    {pickerErrors.submit}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handlePickPhotos}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 cursor-pointer select-none"
                >
                  {isLoading ? "กำลังเลือกรูปภาพให้อยู่…" : "เลือกรูปให้หน่อย"}
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
            <div ref={threadResultRef}>
              <ResultPanel
                result={result}
                fallback={fallback}
                fallbackMessage={fallbackMessage}
                onRegenerate={handleGenerate}
                disabled={isLoading}
              />
            </div>
          ) : null}

          {mode === "picker" && pickerResult ? (
            <div ref={pickerResultRef}>
              <PhotoPickResultPanel
                result={pickerResult}
                images={images}
                platform={pickerPlatform}
                fallback={pickerFallback}
                fallbackMessage={pickerFallbackMessage}
                onRegenerate={handlePickPhotos}
                disabled={isLoading}
              />
            </div>
          ) : null}
        </div>

      </div>
    </main>
  );
}

async function readGenerateResponse(response: Response): Promise<GenerateThreadResponse> {
  const text = await response.text();

  if (!text) {
    throw new Error(`เซิร์ฟเวอร์ตอบกลับว่างเปล่า (${response.status})`);
  }

  try {
    return JSON.parse(text) as GenerateThreadResponse;
  } catch {
    if (response.status === 413) {
      throw new Error("รูปใหญ่เกินไป ลองใช้ไฟล์ที่เล็กลงนะ");
    }

    if (response.ok) {
      throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง ลองรีเฟรชแล้วกดใหม่อีกครั้งนะ");
    }

    throw new Error(
      `เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (${response.status}) ลองรีเฟรชแล้วกดใหม่อีกครั้งนะ`,
    );
  }
}

async function readPickResponse(response: Response): Promise<{ result: PhotoPickResult; fallback?: boolean; error?: string }> {
  const text = await response.text();

  if (!text) {
    throw new Error(`เซิร์ฟเวอร์ตอบกลับว่างเปล่า (${response.status})`);
  }

  try {
    return JSON.parse(text) as { result: PhotoPickResult; fallback?: boolean; error?: string };
  } catch {
    if (response.status === 413) {
      throw new Error("รูปใหญ่เกินไป ลองลดขนาดรูปหรือลดจำนวนรูปที่เลือกนะ");
    }

    if (response.ok) {
      throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง ลองรีเฟรชแล้วกดใหม่อีกครั้งนะ");
    }

    throw new Error(
      `เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (${response.status}) ลองรีเฟรชแล้วกดใหม่อีกครั้งนะ`,
    );
  }
}
