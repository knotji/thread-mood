import { GoogleGenAI, Type } from "@google/genai";
import type { ThreadResult } from "@/types/thread";

type GenerateThreadInput = {
  imageBase64: string;
  mimeType: string;
  category: string;
  tone: string;
};

type GenerateTextOnlyInput = {
  category: string;
  tone: string;
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    imageMood: { type: Type.STRING },
    contentAngle: { type: Type.STRING },
    overlayThreads: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 5,
      maxItems: 5,
    },
    captions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 3,
      maxItems: 3,
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 5,
      maxItems: 5,
    },
    musicMatch: {
      type: Type.OBJECT,
      properties: {
        mood: { type: Type.STRING },
        whyItFits: { type: Type.STRING },
        songKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          minItems: 3,
          maxItems: 3,
        },
        songSuggestions: {
          type: Type.ARRAY,
          minItems: 3,
          maxItems: 3,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["title", "artist", "reason"],
          },
        },
      },
      required: ["mood", "whyItFits", "songKeywords", "songSuggestions"],
    },
    bestPick: {
      type: Type.OBJECT,
      properties: {
        overlay: { type: Type.STRING },
        caption: { type: Type.STRING },
        reason: { type: Type.STRING },
      },
      required: ["overlay", "caption", "reason"],
    },
  },
  required: [
    "imageMood",
    "contentAngle",
    "overlayThreads",
    "captions",
    "hashtags",
    "musicMatch",
    "bestPick",
  ],
};

export const fallbackResult: ThreadResult = {
  imageMood:
    "ภาพนี้ให้ความรู้สึกนิ่ง อบอุ่น และมีจังหวะให้กลับมาอยู่กับตัวเอง เหมาะกับคอนเทนต์ที่อยากให้คนหยุดอ่านสั้น ๆ",
  contentAngle:
    "เล่าโมเมนต์ธรรมดาให้กลายเป็นประโยคที่คนรู้สึกว่าเคยผ่านเหมือนกัน",
  overlayThreads: [
    "บางวันไม่ได้แย่\nแค่ต้องการใจดีกับตัวเอง",
    "โตขึ้นคือรู้ว่า\nพักก็เป็นความพยายามเหมือนกัน",
    "ไม่ได้หายไปไหน\nแค่กำลังกลับมาหาตัวเอง",
    "ชีวิตไม่ต้องรีบทุกซีน\nบางซีนแค่รู้สึกก็พอ",
    "วันนี้อาจยังไม่ดีมาก\nแต่เรายังอยู่ตรงนี้",
  ],
  captions: [
    "บางโมเมนต์ไม่ได้มีอะไรพิเศษมาก แต่อยู่ดี ๆ ก็ทำให้เราได้ยินเสียงตัวเองชัดขึ้น",
    "ไม่ต้องทำให้ทุกวันสมบูรณ์แบบ แค่ยังไม่ใจร้ายกับตัวเองก็เก่งแล้ว",
    "เก็บภาพนี้ไว้เตือนตัวเองว่า เรื่องธรรมดาก็มีความหมายได้เหมือนกัน",
  ],
  hashtags: [
    "#reelsไทย",
    "#ฮีลใจ",
    "#ชีวิตประจำวัน",
    "#แคปชั่นไทย",
    "#ใจดีกับตัวเอง",
  ],
  musicMatch: {
    mood: "เพลงไทยละมุน ๆ ฟังสบาย มีความเหงาเล็กน้อยแต่ไม่หม่น",
    whyItFits:
      "เข้ากับเธรดที่เล่าอารมณ์นิ่ง ๆ และให้พื้นที่กับความรู้สึก เพลงควรช่วยพยุง mood ให้คนอ่านต่อจนจบ",
    songKeywords: ["thai indie healing", "soft acoustic thai", "เพลงฮีลใจ"],
    songSuggestions: [
      {
        title: "ยินดี",
        artist: "Boy Imagine",
        reason: "ให้ความรู้สึกอบอุ่น เรียบง่าย และเหมาะกับคลิปที่มีจังหวะช้า",
      },
      {
        title: "เธอทั้งนั้น",
        artist: "Groove Riders",
        reason: "ละมุน ฟังง่าย และทำให้ภาพธรรมดาดูมีความรู้สึกขึ้น",
      },
      {
        title: "ปล่อย",
        artist: "Pop Pongkool",
        reason: "เหมาะกับ mood ปล่อยวางและค่อย ๆ กลับมาดูแลใจตัวเอง",
      },
    ],
  },
  bestPick: {
    overlay: "ไม่ได้หายไปไหน\nแค่กำลังกลับมาหาตัวเอง",
    caption:
      "บางโมเมนต์ไม่ได้มีอะไรพิเศษมาก แต่อยู่ดี ๆ ก็ทำให้เราได้ยินเสียงตัวเองชัดขึ้น",
    reason:
      "ชุดนี้อ่านเร็ว จำง่าย และมีอารมณ์ฮีลใจที่ใช้ได้กับหลายภาพโดยไม่ดราม่าเกินไป",
  },
};

export async function generateThreadWithGemini({
  imageBase64,
  mimeType,
  category,
  tone,
}: GenerateThreadInput): Promise<ThreadResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const variationSeed = `${category}-${tone}-${Date.now().toString(36)}`;
  const toneGuidance = getToneGuidance(tone);

  const prompt = `
คุณคือผู้ช่วยคิดคอนเทนต์ Instagram Reels ภาษาไทยชื่อ ThreadMood

อินพุต:
- หมวดคอนเทนต์: ${category}
- โทนการเขียน: ${tone}
- วิธีใช้โทนนี้: ${toneGuidance}
- variation seed: ${variationSeed}

ให้วิเคราะห์ mood ของรูป แล้วสร้าง JSON ตาม schema เท่านั้น

กติกา:
- ใช้ภาษาไทยเป็นหลัก และให้เหมือนคนไทยเขียน Reels จริง
- overlayThreads ต้องมี exactly 5 items
- captions ต้องมี exactly 3 items
- captions ในแอปนี้หมายถึง "เธรด/คำบนคลิป" ไม่ใช่แคปชั่นบรรยายโพสต์ยาว ๆ
- captions ต้องเป็นประโยคแนวคำคม ข้อคิด คำสอน ความรู้สึก หรือ mindset ที่กำลังนิยมใน IG Reels
- captions ควรใช้ได้เป็นข้อความบนคลิปหรือใต้คลิปทันที อ่านแล้วคนรู้สึกว่า "จริง", "เคยเป็น", "ต้องแชร์"
- captions ต้องสั้น กระชับ มี punchline หรือ insight ชัด ไม่เกิน 1-3 บรรทัด และไม่ใช่ paragraph ยาว
- สไตล์ caption ที่ควรทำ: ฮีลใจแบบไม่โลกสวย, โตขึ้น/รักตัวเอง, ปล่อยวาง, เจ็บแต่ไม่มืด, ชีวิตประจำวันแต่มีข้อคิด, กวนนิด ๆ ถ้าโทนเหมาะ
- หลีกเลี่ยง caption ที่เป็นคำขายของ คำบรรยายภาพตรง ๆ หรือแคปชั่นทั่วไปแบบ "วันนี้อากาศดี"
- bestPick.caption ต้องเลือก caption ที่ strongest ที่สุดสำหรับใช้เป็นข้อความบนคลิป / ใต้คลิป
- hashtags ต้องมี exactly 5 items และเป็น broad hashtag เพื่อ reach
- hashtags ต้องเป็นแนวแมส ๆ กว้าง ๆ มีโอกาส reach ดี เหมาะกับ Reels ไทย
- hashtags ควรผสม hashtag ทั่วไปกับ hashtag ตาม mood/category เช่น reels, viral, mood, lifestyle, running, cafe, healing
- หลีกเลี่ยง hashtag แคบเกินไป ยาวเกินไป หรือ hashtag ชื่อเพลง
- musicMatch.songKeywords ต้องมี exactly 3 items
- musicMatch.songSuggestions ต้องมี exactly 3 items
- overlay text ต้องสั้น อ่านทันใน 1-2 วินาที และมี 1-2 บรรทัดเท่านั้น
- หลีกเลี่ยง quote ที่ cringe, dramatic เกินไป, หรือ generic เกินไป
- เพลงให้เลือกจาก mood ของเธรดที่สร้าง ไม่ใช่แค่ภาพ
- เพลงควรให้ฟีลตามกระแส Instagram Reels/TikTok มากขึ้น แต่ไม่ต้องอ้างว่าเป็น realtime trending
- หลีกเลี่ยงการแนะนำเพลงเดิม ๆ ที่เจอบ่อยเกินไป เช่น "ปล่อย", "ทางของฝุ่น", "ยินดี" เว้นแต่จำเป็นจริง ๆ กับ mood
- แนะนำเพลงให้หลากหลายทั้งไทย/สากล/indie/pop โดยเลือกเพลงที่น่าค้นเจอใน IG Music และเข้ากับคลิป
- songKeywords ต้องช่วยค้นเพลงแนวแมสหรือตามกระแสได้ เช่น viral thai pop, trending reels audio, aesthetic pop
- ถ้าหมวดเป็น "วิ่ง" ให้มีมุม running, self-growth, effort, moving forward หรือ healing
- ถ้าหมวดเป็น "ท้องฟ้า" หรือ "พระอาทิตย์ตก" ให้มีมุม soft, lonely, nostalgic, letting-go หรือ healing
- ถ้าหมวดเป็น "อกหัก" ให้ emotional แต่ไม่มืดเกินไป
- ถ้าโทนเป็น "กวนตีน" ให้ playful และ funny แต่ไม่หยาบคาย
- ถ้าโทนเป็น "รักตัวเอง" ให้ warm, confident และ self-kind
- ต้องทำให้ overlayThreads, captions, bestPick.caption, musicMatch.mood และเหตุผลของเพลงสะท้อนโทน "${tone}" อย่างชัดเจน

ตอบเป็น JSON เท่านั้น ห้ามมี markdown หรือคำอธิบายนอก JSON
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.9,
      topP: 0.95,
    },
  });

  return normalizeThreadResult(parseJson(response.text ?? ""));
}

export async function generateThreadWithoutImage({
  category,
  tone,
}: GenerateTextOnlyInput): Promise<ThreadResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const toneGuidance = getToneGuidance(tone);
  const variationSeed = `${category}-${tone}-text-${Date.now().toString(36)}`;
  const prompt = `
คุณคือผู้ช่วยคิดคอนเทนต์ Instagram Reels ภาษาไทยชื่อ ThreadMood

ตอนนี้ AI อ่านรูปไม่ได้ ให้สร้างไอเดียจากหมวดและโทนแทน

อินพุต:
- หมวดคอนเทนต์: ${category}
- โทนการเขียน: ${tone}
- วิธีใช้โทนนี้: ${toneGuidance}
- variation seed: ${variationSeed}

ตอบเป็น JSON ตาม schema เท่านั้น

กติกา:
- captions ในแอปนี้หมายถึง "เธรด/คำบนคลิป" ไม่ใช่แคปชั่นบรรยายโพสต์ยาว ๆ
- captions ต้องเป็นคำคม ข้อคิด คำสอน ความรู้สึก หรือ mindset ที่นิยมใน IG Reels
- captions ใช้เป็นข้อความบนคลิปหรือใต้คลิปทันที อ่านแล้วรู้สึกว่า "จริง", "เคยเป็น", "ต้องแชร์"
- captions ต้องมี exactly 3 items สั้น กระชับ มี punchline หรือ insight ชัด ไม่เกิน 1-3 บรรทัด
- overlayThreads ต้องมี exactly 5 items และอ่านทันใน 1-2 วินาที
- hashtags ต้องมี exactly 5 items เป็นแนวแมส ๆ กว้าง ๆ เพื่อ reach
- musicMatch.songKeywords ต้องมี exactly 3 items
- musicMatch.songSuggestions ต้องมี exactly 3 items และให้ฟีลตามกระแส Instagram Reels/TikTok มากขึ้น แต่ไม่อ้างว่า realtime trending
- หลีกเลี่ยงเพลงเดิม ๆ ที่เจอบ่อยเกินไป เช่น "ปล่อย", "ทางของฝุ่น", "ยินดี" เว้นแต่จำเป็นจริง ๆ
- bestPick.caption ต้องเลือก caption ที่ strongest ที่สุดสำหรับใช้เป็นข้อความบนคลิป / ใต้คลิป
- ต้องทำให้ overlayThreads, captions, bestPick.caption, musicMatch.mood และเหตุผลของเพลงสะท้อนโทน "${tone}" อย่างชัดเจน
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.95,
      topP: 0.95,
    },
  });

  return normalizeThreadResult(parseJson(response.text ?? ""));
}

function parseJson(text: string): unknown {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(withoutFence);
}

function normalizeThreadResult(value: unknown): ThreadResult {
  const record = value as Partial<ThreadResult>;
  const musicMatch = record.musicMatch ?? fallbackResult.musicMatch;
  const bestPick = record.bestPick ?? fallbackResult.bestPick;

  return {
    imageMood: stringOr(record.imageMood, fallbackResult.imageMood),
    contentAngle: stringOr(record.contentAngle, fallbackResult.contentAngle),
    overlayThreads: fixedStrings(record.overlayThreads, fallbackResult.overlayThreads, 5),
    captions: fixedStrings(record.captions, fallbackResult.captions, 3),
    hashtags: fixedHashtags(record.hashtags, fallbackResult.hashtags, 5),
    musicMatch: {
      mood: stringOr(musicMatch.mood, fallbackResult.musicMatch.mood),
      whyItFits: stringOr(
        musicMatch.whyItFits,
        fallbackResult.musicMatch.whyItFits,
      ),
      songKeywords: fixedStrings(
        musicMatch.songKeywords,
        fallbackResult.musicMatch.songKeywords,
        3,
      ),
      songSuggestions: Array.isArray(musicMatch.songSuggestions)
        ? musicMatch.songSuggestions.slice(0, 3).map((song, index) => {
            const fallback = fallbackResult.musicMatch.songSuggestions[index];
            return {
              title: stringOr(song?.title, fallback.title),
              artist: stringOr(song?.artist, fallback.artist),
              reason: stringOr(song?.reason, fallback.reason),
            };
          })
        : fallbackResult.musicMatch.songSuggestions,
    },
    bestPick: {
      overlay: stringOr(bestPick.overlay, fallbackResult.bestPick.overlay),
      caption: stringOr(bestPick.caption, fallbackResult.bestPick.caption),
      reason: stringOr(bestPick.reason, fallbackResult.bestPick.reason),
    },
  };
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function fixedStrings(
  value: unknown,
  fallback: string[],
  length: number,
): string[] {
  const items = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && !!item.trim())
    : [];

  return [...items, ...fallback].slice(0, length);
}

function fixedHashtags(
  value: unknown,
  fallback: string[],
  length: number,
): string[] {
  const items = fixedStrings(value, fallback, length * 2)
    .map((item) => item.replace(/\s+/g, ""))
    .map((item) => (item.startsWith("#") ? item : `#${item}`));
  const unique = Array.from(new Set(items));

  return [...unique, ...fallback].slice(0, length);
}

function getToneGuidance(tone: string): string {
  const guidance: Record<string, string> = {
    "แมส ๆ":
      "เขียนให้เข้าใจง่าย แชร์ง่าย มีประโยค hook ชัด อ่านแล้วรู้สึกว่าโดนใจคนจำนวนมาก",
    "สั้น ๆ":
      "ใช้ประโยคสั้น คม ไม่อธิบายเยอะ ทุกบรรทัดต้องจำง่ายและอ่านจบไว",
    "เจ็บนิด ๆ":
      "มีความจุก เศร้านิด ๆ แต่ไม่ดาร์ก ไม่ประชดแรง และยังมีความสวยงามในประโยค",
    "ฮีลใจ":
      "อบอุ่น ปลอบใจแบบไม่โลกสวย ให้ความรู้สึกค่อย ๆ ไปต่อได้",
    "กวนตีน":
      "ขำแบบฉลาด กวนเบา ๆ ไม่หยาบ ไม่เหยียด และยังเหมาะกับการลง Reels",
    "เท่":
      "นิ่ง คม มั่นใจ ไม่เวิ่นเว้อ มีความ self-respect และไม่ต้องอธิบายเยอะ",
    "ละมุน":
      "นุ่ม อ่อนโยน ภาษาสวยแต่ไม่เลี่ยน เหมาะกับภาพแสงนุ่ม คาเฟ่ ท้องฟ้า หรือ moment เงียบ ๆ",
    "เหงา":
      "เหงาแบบโตขึ้น เงียบ ๆ คิดถึงเล็กน้อย แต่ไม่หม่นจนเกินไป",
    "รักตัวเอง":
      "มั่นคง อบอุ่น เคารพตัวเอง ไม่ง้อเกินไป และทำให้คนอ่านรู้สึกกลับมาหาตัวเอง",
  };

  return guidance[tone] ?? "เขียนให้ตรงกับโทนที่ผู้ใช้เลือกอย่างชัดเจน";
}
