"use client";

import Image from "next/image";

type ImageUploaderProps = {
  file: File | null;
  previewUrl: string;
  error?: string;
  onChange: (file: File | null, error?: string) => void;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({
  file,
  previewUrl,
  error,
  onChange,
}: ImageUploaderProps) {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    if (!selected) {
      onChange(null);
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(selected.type)) {
      onChange(null, "รองรับเฉพาะ JPG, PNG หรือ WebP นะ ถ้าเป็น HEIC ให้แปลงไฟล์ก่อน");
      return;
    }

    if (selected.size > MAX_IMAGE_SIZE) {
      onChange(null, "รูปใหญ่เกินไป ลองใช้ไฟล์ไม่เกิน 5MB นะ");
      return;
    }

    onChange(selected);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-950">อัปโหลดรูปจากคลิป</h2>
          <p className="mt-1 text-sm text-slate-500">ใช้ 1 รูปที่แทน mood ของ Reels</p>
        </div>
        {file ? (
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            พร้อม
          </span>
        ) : null}
      </div>

      <label className="block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 transition hover:border-sky-300 hover:bg-sky-50/50">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
        />
        {previewUrl ? (
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
