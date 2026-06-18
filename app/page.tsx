"use client";

import { useEffect, useState } from "react";
import { CategorySelector } from "@/components/CategorySelector";
import { Hero } from "@/components/Hero";
import { ImageUploader } from "@/components/ImageUploader";
import { LoadingState } from "@/components/LoadingState";
import { ResultPanel } from "@/components/ResultPanel";
import { ToneSelector } from "@/components/ToneSelector";
import type { GenerateThreadResponse, ThreadResult } from "@/types/thread";

type Errors = {
  image?: string;
  category?: string;
  tone?: string;
  submit?: string;
};

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<ThreadResult | null>(null);
  const [fallback, setFallback] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleImageChange(nextImage: File | null, error?: string) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(nextImage);
    setPreviewUrl(nextImage ? URL.createObjectURL(nextImage) : "");
    setErrors((current) => ({ ...current, image: error, submit: undefined }));
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

      setResult(data.result);
      setFallback(Boolean(data.fallback));
      setFallbackMessage(data.fallback ? data.error : undefined);
      setErrors({});
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

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 text-slate-950 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-5 lg:sticky lg:top-6">
          <Hero />
          <ImageUploader
            file={image}
            previewUrl={previewUrl}
            error={errors.image}
            onChange={handleImageChange}
          />
        </div>

        <div className="space-y-4 pb-10 lg:pt-8">
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
            <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {errors.submit}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "กำลังคิดให้อยู่…" : "คิดเธรดให้หน่อย"}
          </button>

          {isLoading ? <LoadingState messageIndex={loadingIndex} /> : null}

          {result ? (
            <ResultPanel
              result={result}
              fallback={fallback}
              fallbackMessage={fallbackMessage}
              onRegenerate={handleGenerate}
              disabled={isLoading}
            />
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
