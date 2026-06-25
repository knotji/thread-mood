import { NextResponse } from "next/server";
import { PICK_PLATFORMS, PICK_MOODS } from "@/types/thread";
import {
  pickPhotosWithGemini,
  createLocalPhotoPickFallback,
} from "@/lib/gemini";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  let selectedPlatform = "";
  let selectedMood = "";
  let indices: number[] = [];

  try {
    const formData = await request.formData();
    const images = formData.getAll("images");
    const platform = formData.get("platform");
    const mood = formData.get("mood");
    const indicesStr = formData.get("indices");

    if (typeof indicesStr === "string") {
      indices = indicesStr.split(",").map(Number).filter((n) => !isNaN(n));
    }
    if (indices.length !== images.length) {
      indices = images.map((_, idx) => idx + 1);
    }

    if (!images || images.length < 2 || images.length > 6) {
      return NextResponse.json(
        { error: "กรุณาเลือกรูปภาพ 2 ถึง 6 รูปนะ" },
        { status: 400 },
      );
    }

    // Validate images
    for (const img of images) {
      if (!(img instanceof File)) {
        return NextResponse.json(
          { error: "ข้อมูลที่อัปโหลดไม่ถูกต้อง กรุณาอัปโหลดรูปภาพใหม่นะ" },
          { status: 400 },
        );
      }

      if (img.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `รูป ${img.name} ใหญ่เกินไป ลองใช้ไฟล์ไม่เกิน 5MB นะ` },
          { status: 400 },
        );
      }

      if (!SUPPORTED_IMAGE_TYPES.includes(img.type)) {
        return NextResponse.json(
          { error: `รูป ${img.name} ไม่รองรับ รองรับเฉพาะ JPG, PNG หรือ WebP นะ` },
          { status: 400 },
        );
      }
    }

    if (typeof platform !== "string" || !PICK_PLATFORMS.includes(platform as never)) {
      return NextResponse.json(
        { error: "กรุณาเลือกแพลตฟอร์มก่อนนะ" },
        { status: 400 },
      );
    }

    if (typeof mood !== "string" || !PICK_MOODS.includes(mood as never)) {
      return NextResponse.json(
        { error: "กรุณาเลือก Mood ก่อนนะ" },
        { status: 400 },
      );
    }

    selectedPlatform = platform;
    selectedMood = mood;

    const base64Images = await Promise.all(
      images.map(async (img, idx) => {
        const file = img as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          base64: buffer.toString("base64"),
          mimeType: file.type,
          originalIndex: indices[idx],
        };
      })
    );

    const result = await pickPhotosWithGemini({
      images: base64Images,
      platform,
      mood,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("pick-photos failed", error);
    
    // Provide fallback
    if (selectedPlatform && selectedMood) {
      const fallbackResult = createLocalPhotoPickFallback(selectedPlatform, selectedMood, indices);
      return NextResponse.json({
        result: fallbackResult,
        fallback: true,
        error: "AI สะดุดนิดหน่อย เลยวิเคราะห์รูปให้ตามหมวดหมู่และ Mood สำรองแทนนะ",
      });
    }

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ ลองใหม่อีกครั้งนะ" },
      { status: 500 }
    );
  }
}
