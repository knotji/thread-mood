"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { compressImageFile } from "@/lib/image-compress";

type ImageUploaderProps = {
  file: File | null;
  previewUrl: string;
  error?: string;
  onChange: (file: File | null, error?: string) => void;
  onCompressingChange?: (compressing: boolean) => void;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({
  file,
  previewUrl,
  error,
  onChange,
  onCompressingChange,
}: ImageUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedSuccess, setCompressedSuccess] = useState(false);

  useEffect(() => {
    onCompressingChange?.(isCompressing);
  }, [isCompressing, onCompressingChange]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    if (!selected) {
      onChange(null);
      setCompressedSuccess(false);
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(selected.type)) {
      onChange(null, "รองรับเฉพาะ JPG, PNG หรือ WebP นะ ถ้าเป็น HEIC ให้แปลงไฟล์ก่อน");
      setCompressedSuccess(false);
      return;
    }

    setIsCompressing(true);
    setCompressedSuccess(false);
    onChange(null); // Clear previous files/errors while compressing

    try {
      const compressedFile = await compressImageFile(selected);
      const didCompress = compressedFile.size < selected.size;

      if (compressedFile.size > MAX_IMAGE_SIZE) {
        onChange(null, "รูปนี้ยังใหญ่เกินไปหลังปรับขนาด ลองเลือกรูปอื่นหรือลดจำนวนรูปนะ");
        setCompressedSuccess(false);
      } else {
        onChange(compressedFile);
        if (didCompress) {
          setCompressedSuccess(true);
        }
      }
    } catch (err) {
      console.error("Compression failed, using original file", err);
      if (selected.size > MAX_IMAGE_SIZE) {
        onChange(null, "รูปนี้ยังใหญ่เกินไปหลังปรับขนาด ลองเลือกรูปอื่นหรือลดจำนวนรูปนะ");
      } else {
        onChange(selected);
      }
      setCompressedSuccess(false);
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-950">อัปโหลดรูปจากคลิป</h2>
          <p className="mt-1 text-sm text-slate-500">ใช้ 1 รูปที่แทน mood ของ Reels</p>
        </div>
        <div className="flex items-center gap-2">
          {compressedSuccess && (
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50 uppercase tracking-wide">
              ปรับขนาดรูปเรียบร้อย
            </span>
          )}
          {file ? (
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              พร้อม
            </span>
          ) : null}
        </div>
      </div>

      <label className="block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 transition hover:border-sky-300 hover:bg-sky-50/50">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isCompressing}
        />
        {isCompressing ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 animate-spin text-2xl">⏳</div>
            <p className="font-medium text-slate-800">กำลังปรับขนาดรูปให้เบาลง…</p>
            <p className="mt-1 text-sm text-slate-500">กรุณารอสักครู่</p>
          </div>
        ) : previewUrl ? (
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={previewUrl}
              alt="รูปตัวอย่างที่อัปโหลด"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 grid size-12 place-items-center rounded-full bg-white text-2xl shadow-sm">
              +
            </div>
            <p className="font-medium text-slate-800">แตะเพื่อเลือกรูป</p>
            <p className="mt-1 text-sm text-slate-500">JPG, PNG หรือ WebP ไม่เกิน 5MB</p>
          </div>
        )}
      </label>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
