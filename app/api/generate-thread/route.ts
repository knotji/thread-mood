import { NextResponse } from "next/server";
import { CATEGORIES, TONES } from "@/types/thread";
import {
  fallbackResult,
  createLocalFallbackResult,
  generateThreadLoose,
  generateThreadWithGemini,
  generateThreadWithoutImage,
} from "@/lib/gemini";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  let selectedCategory = "";
  let selectedTone = "";

  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const category = formData.get("category");
    const tone = formData.get("tone");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "กรุณาอัปโหลดรูปก่อนนะ" },
        { status: 400 },
      );
    }

    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "รูปใหญ่เกินไป ลองใช้ไฟล์ไม่เกิน 5MB นะ" },
        { status: 400 },
      );
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะรูป JPG, PNG หรือ WebP นะ ถ้าเป็น HEIC ให้แปลงไฟล์ก่อน" },
        { status: 400 },
      );
    }

    if (typeof category !== "string" || !CATEGORIES.includes(category as never)) {
      return NextResponse.json(
        { error: "กรุณาเลือกหมวดคอนเทนต์ก่อนนะ" },
        { status: 400 },
      );
    }

    if (typeof tone !== "string" || !TONES.includes(tone as never)) {
      return NextResponse.json(
        { error: "กรุณาเลือกโทนการเขียนก่อนนะ" },
        { status: 400 },
      );
    }

    selectedCategory = category;
    selectedTone = tone;

    const buffer = Buffer.from(await image.arrayBuffer());
    const result = await generateThreadWithGemini({
      imageBase64: buffer.toString("base64"),
      mimeType: image.type,
      category,
      tone,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("generate-thread failed", error);
    const isImageError =
      error instanceof Error && /image|INVALID_ARGUMENT|process input/i.test(error.message);

    if (isImageError) {
      try {
        if (selectedCategory && selectedTone) {
          const result = await generateThreadWithoutImage({
            category: selectedCategory,
            tone: selectedTone,
          });

          return NextResponse.json({
            result,
            fallback: true,
            error:
              "AI อ่านรูปนี้ไม่สำเร็จ เลยคิดจากหมวดและโทนให้ก่อนนะ ถ้าอยากให้ตรงรูปขึ้น ลองใช้ JPG/PNG/WebP ที่ชัดขึ้น",
          });
        }
      } catch (textOnlyError) {
        console.error("text-only fallback failed", textOnlyError);
      }
    }

    if (selectedCategory && selectedTone) {
      try {
        const result = await generateThreadLoose({
          category: selectedCategory,
          tone: selectedTone,
        });

        return NextResponse.json({
          result,
          fallback: true,
          error:
            "AI วิเคราะห์รูปไม่สำเร็จ เลยคิดจากหมวดและโทนให้ก่อนนะ",
        });
      } catch (looseError) {
        console.error("loose fallback failed", looseError);
      }
    }

    return NextResponse.json({
      result: selectedCategory && selectedTone
        ? createLocalFallbackResult(selectedCategory, selectedTone)
        : fallbackResult,
      fallback: true,
      error: selectedCategory && selectedTone
        ? getFallbackErrorMessage(error)
        : "AI สะดุดนิดหน่อย เลยส่งชุดไอเดียสำรองให้ก่อนนะ",
    });
  }
}

function getFallbackErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (/quota|RESOURCE_EXHAUSTED|429|rate/i.test(message)) {
    return "โควต้า Gemini เต็มชั่วคราว เลยจัดชุดสำรองตามหมวดและโทนให้ก่อนนะ";
  }

  return "AI ยังตอบไม่ได้ เลยจัดชุดสำรองตามหมวดและโทนให้ก่อนนะ";
}
