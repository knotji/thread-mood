"use client";

import Image from "next/image";
import { useRef } from "react";

type UploadedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type PhotoPickerUploaderProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  error?: string;
  onError: (error?: string) => void;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES = 6;

export function PhotoPickerUploader({
  images,
  onChange,
  error,
  onError,
}: PhotoPickerUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processFiles(files: FileList) {
    onError(undefined);
    const validNewImages: UploadedImage[] = [];
    let currentTotal = images.length;
    let limitExceeded = false;
    let typeError = false;
    let sizeError = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (currentTotal >= MAX_IMAGES) {
        limitExceeded = true;
        continue;
      }

      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        typeError = true;
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        sizeError = true;
        continue;
      }

      validNewImages.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
      });
      currentTotal++;
    }

    if (limitExceeded) {
      onError("อัปโหลดได้สูงสุด 6 รูปนะ");
    } else if (typeError) {
      onError("บางรูปไม่ใช่ไฟล์ JPG, PNG หรือ WebP จึงไม่ได้นำเข้าระบบ");
    } else if (sizeError) {
      onError("บางรูปใหญ่เกิน 5MB จึงไม่ได้นำเข้าระบบ");
    }

    if (validNewImages.length > 0) {
      onChange([...images, ...validNewImages]);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      processFiles(event.target.files);
    }
    // Reset file input value so same file can be selected again if deleted
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemove(id: string) {
    const target = images.find((img) => img.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const updated = images.filter((img) => img.id !== id);
    onChange(updated);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-950">อัปโหลดเซตรูปภาพ</h2>
          <p className="mt-1 text-sm text-slate-500 font-normal">
            เลือกรูปภาพ 2-6 รูปเพื่อจัดอันดับและวางแผนจัดลำดับคอนเทนต์
          </p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          {images.length} / 6 รูป
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
            >
              <Image
                src={img.previewUrl}
                alt={`รูปที่ ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 150px"
              />
              
              {/* Badge for Image index */}
              <div className="absolute top-2 left-2 rounded-lg bg-slate-950/80 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-[2px]">
                รูป {index + 1}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-red-600/90 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none"
                title="ลบรูปนี้"
              >
                ✕
              </button>
            </div>
          ))}

          {images.length < MAX_IMAGES ? (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 transition hover:border-sky-300 hover:bg-sky-50/50">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="grid size-10 place-items-center rounded-full bg-white text-xl shadow-sm text-slate-600 transition">
                +
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-700">เพิ่มรูปภาพ</p>
              <p className="mt-0.5 text-[10px] text-slate-400">สูงสุด 6 รูป</p>
            </label>
          ) : null}
        </div>

        <div className="rounded-2xl bg-slate-50/75 p-3 text-xs leading-5 text-slate-500 ring-1 ring-slate-100/50">
          🔒 <span className="font-medium text-slate-600">นโยบายความเป็นส่วนตัว:</span> รูปจะถูกใช้เพื่อวิเคราะห์ครั้งนี้เท่านั้น ระบบไม่บันทึกรูปหรือประวัติ
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600 font-medium">{error}</p> : null}
    </section>
  );
}
