"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { compressImageFile } from "@/lib/image-compress";

type UploadedImage = {
  id: string;
  file: File;
  previewUrl: string;
  selected: boolean;
};

type PhotoPickerUploaderProps = {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  error?: string;
  onError: (error?: string) => void;
  onCompressingChange?: (compressing: boolean) => void;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES = 20;

export function PhotoPickerUploader({
  images,
  onChange,
  error,
  onError,
  onCompressingChange,
}: PhotoPickerUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedSuccess, setCompressedSuccess] = useState(false);

  useEffect(() => {
    onCompressingChange?.(isCompressing);
  }, [isCompressing, onCompressingChange]);

  async function processFiles(files: FileList) {
    onError(undefined);
    setCompressedSuccess(false);

    let currentTotal = images.length;
    let limitExceeded = false;
    let typeError = false;

    const filesToCompress: File[] = [];
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

      filesToCompress.push(file);
      currentTotal++;
    }

    if (filesToCompress.length === 0) {
      if (limitExceeded) {
        onError("อัปโหลดได้สูงสุด 20 รูปนะ");
      } else if (typeError) {
        onError("บางรูปไม่ใช่ไฟล์ JPG, PNG หรือ WebP จึงไม่ได้นำเข้าระบบ");
      }
      return;
    }

    setIsCompressing(true);

    try {
      const compressionPromises = filesToCompress.map(async (file) => {
        try {
          const compressed = await compressImageFile(file);
          return { original: file, compressed, success: true };
        } catch (err) {
          console.error("Compression failed for", file.name, err);
          return { original: file, compressed: file, success: false };
        }
      });

      const results = await Promise.all(compressionPromises);
      const validNewImages: UploadedImage[] = [];
      let sizeError = false;
      let didAnyCompress = false;

      const selectedCount = images.filter((img) => img.selected).length;
      let currentSelectedCount = selectedCount;

      results.forEach(({ original, compressed }) => {
        if (compressed.size > MAX_IMAGE_SIZE) {
          sizeError = true;
        } else {
          if (compressed.size < original.size) {
            didAnyCompress = true;
          }
          const shouldSelect = currentSelectedCount < 6;
          if (shouldSelect) {
            currentSelectedCount++;
          }
          validNewImages.push({
            id: Math.random().toString(36).substring(2, 9),
            file: compressed,
            previewUrl: URL.createObjectURL(compressed),
            selected: shouldSelect,
          });
        }
      });

      if (limitExceeded) {
        onError("อัปโหลดได้สูงสุด 20 รูปนะ");
      } else if (typeError) {
        onError("บางรูปไม่ใช่ไฟล์ JPG, PNG หรือ WebP จึงไม่ได้นำเข้าระบบ");
      } else if (sizeError) {
        onError("บางรูปใหญ่เกิน 5MB หลังปรับขนาด จึงไม่ได้นำเข้าระบบ");
      }

      if (validNewImages.length > 0) {
        onChange([...images, ...validNewImages]);
        if (didAnyCompress) {
          setCompressedSuccess(true);
        }
      }
    } catch (err) {
      console.error("Batch compression failed", err);
      onError("เกิดข้อผิดพลาดในการปรับขนาดรูปภาพ");
    } finally {
      setIsCompressing(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      processFiles(event.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemove(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const target = images.find((img) => img.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const updated = images.filter((img) => img.id !== id);
    onChange(updated);
  }

  function handleToggleSelect(id: string) {
    const target = images.find((img) => img.id === id);
    if (!target) return;

    if (!target.selected) {
      const selectedCount = images.filter((img) => img.selected).length;
      if (selectedCount >= 6) {
        onError("เลือกวิเคราะห์ได้สูงสุด 6 รูป เพื่อให้ AI เลือกได้แม่นขึ้น");
        return;
      }
    }

    const updated = images.map((img) => {
      if (img.id === id) {
        return { ...img, selected: !img.selected };
      }
      return img;
    });
    onChange(updated);
    onError(undefined);
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

  const selectedCount = images.filter((img) => img.selected).length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-950">อัปโหลดเซตรูปภาพ</h2>
          <p className="mt-1 text-sm text-slate-500 font-normal">
            เลือกรูปภาพ 2-20 รูปเพื่อจัดเรียง (และเลือกวิเคราะห์ 2-6 รูป)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {compressedSuccess && (
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50 uppercase tracking-wide">
              ปรับขนาดรูปเรียบร้อย
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            อัปโหลดแล้ว {images.length}/{MAX_IMAGES} รูป
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedCount >= 2 && selectedCount <= 6 ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"}`}>
            เลือกวิเคราะห์ {selectedCount}/6 รูป
          </span>
        </div>
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
              onClick={() => handleToggleSelect(img.id)}
              className={`group relative aspect-square overflow-hidden rounded-2xl border transition cursor-pointer select-none shadow-xs ${
                img.selected
                  ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/10"
                  : "border-slate-200 bg-slate-50 opacity-60 hover:opacity-85"
              }`}
            >
              <Image
                src={img.previewUrl}
                alt={`รูปที่ ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 150px"
              />
              
              {!img.selected && (
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[0.5px]" />
              )}

              <div className="absolute top-2 left-2 rounded-lg bg-slate-950/80 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-[2px]">
                รูป {index + 1}
              </div>

              <div className="absolute bottom-2 left-2">
                {img.selected ? (
                  <span className="rounded-md bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    ✓ เลือกแล้ว
                  </span>
                ) : (
                  <span className="rounded-md bg-slate-600/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-100 shadow-xs backdrop-blur-[1px]">
                    ยังไม่เลือก
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => handleRemove(e, img.id)}
                className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-red-600/80 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 hover:scale-105 focus:outline-none"
                title="ลบรูปนี้"
              >
                ✕
              </button>
            </div>
          ))}

          {isCompressing ? (
            <div className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-sky-300 bg-sky-50/30 text-center p-2">
              <div className="mb-2 animate-spin text-lg">⏳</div>
              <p className="text-[10px] font-bold text-sky-700 leading-tight">กำลังปรับขนาดรูปให้เบาลง…</p>
            </div>
          ) : images.length < MAX_IMAGES ? (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 transition hover:border-sky-300 hover:bg-sky-50/50">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                disabled={isCompressing}
              />
              <div className="grid size-10 place-items-center rounded-full bg-white text-xl shadow-sm text-slate-600 transition">
                +
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-700">เพิ่มรูปภาพ</p>
              <p className="mt-0.5 text-[10px] text-slate-400">สูงสุด 20 รูป</p>
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
