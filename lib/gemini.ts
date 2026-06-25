import { GoogleGenAI, Type, type GenerateContentParameters } from "@google/genai";
import type { ThreadResult, PhotoPickResult } from "@/types/thread";

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

const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_GEMINI_MODELS = [
  DEFAULT_GEMINI_MODEL,
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
];

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

async function generateContentWithModelFallback(
  ai: GoogleGenAI,
  params: Omit<GenerateContentParameters, "model">,
) {
  const models = Array.from(new Set([getGeminiModel(), ...FALLBACK_GEMINI_MODELS]));
  let lastError: unknown;

  for (const model of models) {
    try {
      return await ai.models.generateContent({ ...params, model });
    } catch (error) {
      lastError = error;

      if (!isRetryableModelError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

function isRetryableModelError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  return /404|NOT_FOUND|429|RESOURCE_EXHAUSTED|quota|rate/i.test(message);
}

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
    "#viralreels",
    "#fyp",
    "#เธรดความรู้สึก",
    "#ฮีลใจ",
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

export function createLocalFallbackResult(category: string, tone: string): ThreadResult {
  const isRunning = category === "วิ่ง";
  const isHeartbreak = category === "อกหัก";
  const isSky = category === "ท้องฟ้า" || category === "พระอาทิตย์ตก";
  const isPlayful = tone === "กวนตีน" || category === "กวน ๆ";

  if (isRunning) {
    return {
      imageMood: "ให้ฟีลมีแรงอยู่ข้างใน เหนื่อยได้ แต่ยังอยากพาตัวเองไปต่อ",
      contentAngle: "การวิ่งในฐานะการกลับมาชนะใจตัวเองทีละนิด",
      overlayThreads: [
        "ไม่ได้เก่งทุกวัน\nแต่ยังไปต่อทุกวัน",
        "วิ่งช้าไม่เป็นไร\nใจอย่าหยุดก็พอ",
        "เหนื่อยแค่ไหน\nก็ยังพาตัวเองมาได้",
        "ไม่ต้องชนะใคร\nแค่ไม่แพ้ใจตัวเอง",
        "วันนี้วิ่งเพื่อใจ\nไม่ใช่เพื่อสถิติ",
      ],
      captions: [
        "บางวันไม่ได้วิ่งเพื่อเร็วขึ้น แค่วิ่งเพื่อไม่ทิ้งตัวเองไว้ที่เดิม",
        "เหนื่อยก็พักได้ แต่อย่าลืมกลับมาพาตัวเองไปต่อ",
        "ทุกก้าวไม่ได้เปลี่ยนโลก แต่เปลี่ยนใจเราให้แข็งแรงขึ้นได้",
      ],
      hashtags: ["#reelsไทย", "#viralreels", "#fyp", "#runningmotivation", "#วิ่งไหนดี"],
      musicMatch: {
        mood: "เพลงจังหวะกลาง ๆ มีพลังบวก ฟังแล้วอยากก้าวต่อ",
        whyItFits:
          "เข้ากับเธรดที่พูดถึงความพยายาม การกลับมาหาตัวเอง และพลังใจระหว่างทาง",
        songKeywords: ["running reels audio", "thai pop motivation", "upbeat healing"],
        songSuggestions: [
          {
            title: "Golden Hour",
            artist: "JVKE",
            reason: "ให้ฟีลสว่าง มีพลัง และเข้ากับคลิปวิ่งช่วงแสงสวย",
          },
          {
            title: "เดินมาส่ง",
            artist: "First Anuwat",
            reason: "มีความอบอุ่นและเดินหน้าต่อ เหมาะกับ mood ฮีลใจ",
          },
          {
            title: "Good Days",
            artist: "SZA",
            reason: "ฟีลปล่อยใจและกลับมาอยู่กับตัวเอง ใช้กับคลิป aesthetic ได้ดี",
          },
        ],
      },
      bestPick: {
        overlay: "ไม่ต้องชนะใคร\nแค่ไม่แพ้ใจตัวเอง",
        caption: "บางวันไม่ได้วิ่งเพื่อเร็วขึ้น แค่วิ่งเพื่อไม่ทิ้งตัวเองไว้ที่เดิม",
        reason: "อ่านง่าย แมส และเชื่อมกับมุมวิ่ง/ฮีลใจได้ชัด",
      },
    };
  }

  if (isHeartbreak) {
    return {
      imageMood: "มีความเงียบ เหงา และเหมือนกำลังค่อย ๆ ปล่อยบางอย่างออกจากใจ",
      contentAngle: "อกหักแบบโตขึ้น ไม่ฟูมฟาย แต่ยอมรับว่ามันยังรู้สึก",
      overlayThreads: [
        "ไม่ได้ลืมง่าย\nแค่ไม่อยากเจ็บซ้ำ",
        "บางคนไม่กลับมา\nแต่เราต้องกลับมาหาตัวเอง",
        "รักมากแค่ไหน\nก็ต้องรักตัวเองให้ทัน",
        "คิดถึงได้\nแต่ไม่กลับไปแล้ว",
        "เสียใจได้\nแต่อย่าเสียตัวเอง",
      ],
      captions: [
        "โตขึ้นคือยอมรับว่า บางความรักสอนเราได้ แม้ไม่ได้อยู่กับเราแล้ว",
        "คิดถึงเขาได้ แต่อย่าลืมคิดถึงตัวเองด้วย",
        "บางการจากลาไม่ได้ทำให้เราแพ้ แค่ทำให้เรารู้ว่าควรรักตัวเองยังไง",
      ],
      hashtags: ["#reelsไทย", "#viralreels", "#fyp", "#เธรดความรู้สึก", "#อกหัก"],
      musicMatch: {
        mood: "เพลงเศร้านิด ๆ แต่ยังสวยและไม่ดาร์กเกินไป",
        whyItFits:
          "เข้ากับเธรดที่ยอมรับความเสียใจแต่ยังเลือกพาตัวเองออกมา",
        songKeywords: ["sad thai pop reels", "heartbreak healing", "thai indie sad"],
        songSuggestions: [
          {
            title: "ใจหายอ่ะ สงสัยอยู่ที่เธอ",
            artist: "Milli",
            reason: "มีความเจ็บแบบร่วมสมัยและเข้ากับคลิป Reels ได้ง่าย",
          },
          {
            title: "Until I Found You",
            artist: "Stephen Sanchez",
            reason: "โรแมนติก เหงา และใช้กับภาพ mood ละมุนได้ดี",
          },
          {
            title: "double take",
            artist: "dhruv",
            reason: "ฟีลคิดถึงนุ่ม ๆ ไม่ดราม่าเกินไป",
          },
        ],
      },
      bestPick: {
        overlay: "เสียใจได้\nแต่อย่าเสียตัวเอง",
        caption: "คิดถึงเขาได้ แต่อย่าลืมคิดถึงตัวเองด้วย",
        reason: "สั้น จำง่าย และมีมุมฮีลใจที่คนอินได้กว้าง",
      },
    };
  }

  if (isSky) {
    return {
      imageMood: "นุ่ม เงียบ และมีความคิดถึงปนปล่อยวาง เหมือนช่วงเวลาที่ใจเริ่มเบาลง",
      contentAngle: "ท้องฟ้าเป็นพื้นที่พักใจสำหรับวันที่พูดอะไรไม่ออก",
      overlayThreads: [
        "ฟ้ายังเปลี่ยนสี\nเราก็เปลี่ยนใจได้",
        "บางเย็นไม่ได้เศร้า\nแค่เงียบขึ้น",
        "ปล่อยบางอย่าง\nให้เบาเหมือนฟ้า",
        "วันนี้ไม่ต้องเก่ง\nแค่หายใจให้ทั่วก็พอ",
        "ฟ้ากว้างพอ\nให้เราวางเรื่องเดิม ๆ",
      ],
      captions: [
        "บางวันฟ้าไม่ได้สวยเป็นพิเศษ แต่ทำให้ใจเรานิ่งขึ้นแบบพอดี",
        "ถ้ายังหาคำตอบไม่ได้ ลองปล่อยให้วันนี้ค่อย ๆ ผ่านไปก่อนก็ได้",
        "เราไม่จำเป็นต้องเข้าใจทุกอย่างในวันที่ยังเหนื่อย",
      ],
      hashtags: ["#reelsไทย", "#viralreels", "#fyp", "#aestheticreels", "#ท้องฟ้า"],
      musicMatch: {
        mood: "เพลงละมุน ฟุ้ง ๆ เหมาะกับภาพฟ้าและช่วงเย็น",
        whyItFits:
          "เข้ากับความนุ่ม เหงา และปล่อยวางของเธรด โดยไม่ทำให้เศร้าเกินไป",
        songKeywords: ["aesthetic reels audio", "sunset pop", "soft thai indie"],
        songSuggestions: [
          {
            title: "Moonlight",
            artist: "Kali Uchis",
            reason: "ฟีลนุ่ม ล่อง และเข้ากับคลิป aesthetic ได้ดี",
          },
          {
            title: "Glue Song",
            artist: "beabadoobee",
            reason: "ละมุน อบอุ่น และเหมาะกับภาพท้องฟ้านิ่ง ๆ",
          },
          {
            title: "ลืมไปแล้วว่าลืมยังไง",
            artist: "Jeff Satur",
            reason: "มีความคิดถึงละมุน ๆ เหมาะกับ sunset/sky mood",
          },
        ],
      },
      bestPick: {
        overlay: "ฟ้ายังเปลี่ยนสี\nเราก็เปลี่ยนใจได้",
        caption: "เราไม่จำเป็นต้องเข้าใจทุกอย่างในวันที่ยังเหนื่อย",
        reason: "เชื่อมภาพฟ้ากับความรู้สึกได้ดี และเป็นประโยคที่แชร์ง่าย",
      },
    };
  }

  return {
    ...fallbackResult,
    imageMood: isPlayful
      ? "ให้ฟีลเบา ๆ กวนหน่อย แต่ยังน่ารักและลง Reels ได้"
      : fallbackResult.imageMood,
    captions: isPlayful
      ? [
          "บางทีก็ไม่ได้ขี้เกียจ แค่ชีวิตยังไม่เปิดโหมดจริงจัง",
          "โตแล้วไม่ได้แปลว่าต้องไหวทุกเรื่อง แปลว่าเนียนเก่งขึ้น",
          "พักก่อน ไม่ได้แพ้ แค่แบตชีวิตเหลือ 12%",
        ]
      : fallbackResult.captions,
    hashtags: isPlayful
      ? ["#reelsไทย", "#viralreels", "#fyp", "#ชีวิตประจำวัน", "#กวนๆ"]
      : fallbackResult.hashtags,
    bestPick: isPlayful
      ? {
          overlay: "ไม่ได้ขี้เกียจ\nแค่ใจยังโหลดไม่เสร็จ",
          caption: "โตแล้วไม่ได้แปลว่าต้องไหวทุกเรื่อง แปลว่าเนียนเก่งขึ้น",
          reason: "กวนเบา ๆ อ่านง่าย และเข้ากับคอนเทนต์ชีวิตประจำวัน",
        }
      : fallbackResult.bestPick,
  };
}

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
- ทุก field หลักต้องเป็นภาษาไทย รวมถึง imageMood, contentAngle, captions, overlayThreads, hashtags, musicMatch.mood, musicMatch.whyItFits, songSuggestions.reason และ bestPick.reason
- อนุญาตให้มีภาษาอังกฤษได้เฉพาะชื่อเพลง ชื่อศิลปิน และ songKeywords
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
- hashtags ต้องมีแกนแมสอย่างน้อย 3 ตัวจากกลุ่มนี้: #reelsไทย, #viralreels, #fyp, #tiktokพาเพลิน, #เธรดความรู้สึก, #aestheticreels
- hashtags ที่เหลือค่อยเติมตาม mood/category เช่น running, cafe, healing, sky, heartbreak
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

  const response = await generateContentWithModelFallback(ai, {
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
- ทุก field หลักต้องเป็นภาษาไทย ยกเว้นชื่อเพลง ชื่อศิลปิน และ songKeywords
- captions ต้องเป็นคำคม ข้อคิด คำสอน ความรู้สึก หรือ mindset ที่นิยมใน IG Reels
- captions ใช้เป็นข้อความบนคลิปหรือใต้คลิปทันที อ่านแล้วรู้สึกว่า "จริง", "เคยเป็น", "ต้องแชร์"
- captions ต้องมี exactly 3 items สั้น กระชับ มี punchline หรือ insight ชัด ไม่เกิน 1-3 บรรทัด
- overlayThreads ต้องมี exactly 5 items และอ่านทันใน 1-2 วินาที
- hashtags ต้องมี exactly 5 items เป็นแนวแมส ๆ กว้าง ๆ เพื่อ reach และต้องมี #reelsไทย, #viralreels, #fyp อย่างน้อย 3 ตัว
- musicMatch.songKeywords ต้องมี exactly 3 items
- musicMatch.songSuggestions ต้องมี exactly 3 items และให้ฟีลตามกระแส Instagram Reels/TikTok มากขึ้น แต่ไม่อ้างว่า realtime trending
- หลีกเลี่ยงเพลงเดิม ๆ ที่เจอบ่อยเกินไป เช่น "ปล่อย", "ทางของฝุ่น", "ยินดี" เว้นแต่จำเป็นจริง ๆ
- bestPick.caption ต้องเลือก caption ที่ strongest ที่สุดสำหรับใช้เป็นข้อความบนคลิป / ใต้คลิป
- ต้องทำให้ overlayThreads, captions, bestPick.caption, musicMatch.mood และเหตุผลของเพลงสะท้อนโทน "${tone}" อย่างชัดเจน
`;

  const response = await generateContentWithModelFallback(ai, {
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

export async function generateThreadLoose({
  category,
  tone,
}: GenerateTextOnlyInput): Promise<ThreadResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const toneGuidance = getToneGuidance(tone);
  const prompt = `
สร้างไอเดีย ThreadMood สำหรับ Instagram Reels ภาษาไทย

หมวด: ${category}
โทน: ${tone}
วิธีใช้โทน: ${toneGuidance}

ตอบเป็น JSON เท่านั้น โดยใช้โครงนี้:
{
  "imageMood": "string",
  "contentAngle": "string",
  "overlayThreads": ["string", "string", "string", "string", "string"],
  "captions": ["string", "string", "string"],
  "hashtags": ["string", "string", "string", "string", "string"],
  "musicMatch": {
    "mood": "string",
    "whyItFits": "string",
    "songKeywords": ["string", "string", "string"],
    "songSuggestions": [
      { "title": "string", "artist": "string", "reason": "string" },
      { "title": "string", "artist": "string", "reason": "string" },
      { "title": "string", "artist": "string", "reason": "string" }
    ]
  },
  "bestPick": {
    "overlay": "string",
    "caption": "string",
    "reason": "string"
  }
}

captions คือเธรด/คำบนคลิปแบบคำคม ข้อคิด คำสอน หรือ mindset ที่คนไทยนิยมใน IG Reels
ทุก field หลักต้องเป็นภาษาไทย ยกเว้นชื่อเพลง ชื่อศิลปิน และ songKeywords
bestPick.caption ต้องเป็นข้อความหลักสำหรับใช้บนคลิป / ใต้คลิป
hashtags ต้องแมส ๆ กว้าง ๆ เพื่อ reach และต้องมี #reelsไทย, #viralreels, #fyp อย่างน้อย 3 ตัว
เพลงต้องฟีลตามกระแส Reels/TikTok แต่ไม่ต้องอ้างว่า realtime trending
`;

  const response = await generateContentWithModelFallback(ai, {
    contents: prompt,
    config: {
      responseMimeType: "application/json",
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
  const massCore = ["#reelsไทย", "#viralreels", "#fyp"];
  const broadPool = [
    "#เธรดความรู้สึก",
    "#aestheticreels",
    "#ฮีลใจ",
    "#ชีวิตประจำวัน",
    "#moodoftheday",
  ];
  const items = fixedStrings(value, fallback, length * 2)
    .map((item) => item.replace(/\s+/g, ""))
    .map((item) => (item.startsWith("#") ? item : `#${item}`));
  const unique = Array.from(new Set([...massCore, ...items, ...fallback, ...broadPool]));

  return unique.slice(0, length);
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

type PickPhotosInput = {
  images: { base64: string; mimeType: string }[];
  platform: string;
  mood: string;
};

const pickPhotosResponseSchema = {
  type: Type.OBJECT,
  properties: {
    moodSummary: { type: Type.STRING },
    bestPhotoIndex: { type: Type.INTEGER },
    bestPhotoReason: { type: Type.STRING },
    rankedPhotos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER },
          score: { type: Type.INTEGER },
          suggestedUse: { type: Type.STRING },
        },
        required: ["index", "score", "suggestedUse"],
      },
    },
    skipPhotos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER },
          reason: { type: Type.STRING },
        },
        required: ["index", "reason"],
      },
    },
    storySequence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER },
          transitionText: { type: Type.STRING },
        },
        required: ["index", "transitionText"],
      },
    },
    feedOrder: {
      type: Type.ARRAY,
      items: { type: Type.INTEGER },
    },
    coverIndex: { type: Type.INTEGER },
    captionSuggestion: { type: Type.STRING },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "moodSummary",
    "bestPhotoIndex",
    "bestPhotoReason",
    "rankedPhotos",
    "skipPhotos",
  ],
};

export function createLocalPhotoPickFallback(
  platform: string,
  mood: string,
): PhotoPickResult {
  return {
    moodSummary: `รูปภาพเซตนี้เน้นอารมณ์แบบ ${mood} เหมาะมากสำหรับนำเสนอแนวชีวิตประจำวันและท่องเที่ยว`,
    bestPhotoIndex: 1,
    bestPhotoReason: `รูปที่ 1 มีองค์ประกอบและแสงที่ดึงดูดสายตาดีที่สุด เข้ากับ mood แบบ ${mood} ที่ต้องการ`,
    rankedPhotos: [
      { index: 1, score: 9, suggestedUse: "รูปเปิดเรื่องหรือจุดดึงสายตาแรก" },
      { index: 2, score: 8, suggestedUse: "รูปเสริมอารมณ์ความรู้สึกหรือรายละเอียดเสริม" },
    ],
    skipPhotos: [],
    ...(platform === "Story"
      ? {
          storySequence: [
            { index: 1, transitionText: "เปิดเรื่องให้น่าติดตาม" },
            { index: 2, transitionText: "เล่าบรรยากาศต่อ" },
          ],
        }
      : {}),
    ...(platform === "Feed"
      ? {
          feedOrder: [1, 2],
          coverIndex: 1,
        }
      : {}),
    captionSuggestion: `ปล่อยใจสบาย ๆ ในวันที่มีความสุข 🌿✨`,
    hashtags: ["#reelsไทย", "#viralreels", "#fyp", `#${mood}`, "#เธรดความรู้สึก"],
  };
}

function normalizePhotoPickResult(
  value: unknown,
  numImages: number,
  platform: string,
  mood: string,
): PhotoPickResult {
  const fallback = createLocalPhotoPickFallback(platform, mood);
  const record = value as Partial<PhotoPickResult>;

  // Ensure index is valid (between 1 and numImages)
  const isValidIndex = (idx: unknown): boolean =>
    typeof idx === "number" && idx >= 1 && idx <= numImages;

  const bestPhotoIndex = isValidIndex(record.bestPhotoIndex)
    ? (record.bestPhotoIndex as number)
    : 1;

  const rankedPhotos = Array.isArray(record.rankedPhotos)
    ? record.rankedPhotos
        .map((p) => {
          const idx = typeof p?.index === "number" ? p.index : 1;
          const score = typeof p?.score === "number" ? p.score : 8;
          const suggestedUse = typeof p?.suggestedUse === "string" ? p.suggestedUse : "";
          return { index: idx, score, suggestedUse };
        })
        .filter((p) => isValidIndex(p.index))
    : fallback.rankedPhotos;

  const skipPhotos = Array.isArray(record.skipPhotos)
    ? record.skipPhotos
        .map((p) => {
          const idx = typeof p?.index === "number" ? p.index : 1;
          const reason = typeof p?.reason === "string" ? p.reason : "";
          return { index: idx, reason };
        })
        .filter((p) => isValidIndex(p.index))
    : [];

  const storySequence = Array.isArray(record.storySequence)
    ? record.storySequence
        .map((s) => {
          const idx = typeof s?.index === "number" ? s.index : 1;
          const transitionText =
            typeof s?.transitionText === "string" ? s.transitionText : "";
          return { index: idx, transitionText };
        })
        .filter((s) => isValidIndex(s.index))
    : platform === "Story" ? fallback.storySequence : undefined;

  const feedOrder = Array.isArray(record.feedOrder)
    ? record.feedOrder.filter(isValidIndex)
    : platform === "Feed" ? fallback.feedOrder : undefined;

  const coverIndex = isValidIndex(record.coverIndex)
    ? (record.coverIndex as number)
    : platform === "Feed" ? 1 : undefined;

  const hashtags = Array.isArray(record.hashtags)
    ? record.hashtags.filter((h): h is string => typeof h === "string" && h.trim().length > 0)
    : fallback.hashtags;

  return {
    moodSummary: stringOr(record.moodSummary, fallback.moodSummary),
    bestPhotoIndex,
    bestPhotoReason: stringOr(record.bestPhotoReason, fallback.bestPhotoReason),
    rankedPhotos,
    skipPhotos,
    storySequence,
    feedOrder,
    coverIndex,
    captionSuggestion: record.captionSuggestion || fallback.captionSuggestion,
    hashtags,
  };
}

export async function pickPhotosWithGemini({
  images,
  platform,
  mood,
}: PickPhotosInput): Promise<PhotoPickResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
คุณคือผู้ช่วยเลือกและจัดระเบียบรูปภาพสำหรับลงโซเชียลมีเดียในภาษาไทย

วิเคราะห์รูปภาพทั้ง ${images.length} รูปที่ส่งมาให้ โดยรูปแรกที่ส่งมาคือ "รูป 1", รูปที่สองคือ "รูป 2" ไปเรื่อย ๆ จนครบ เรียงตามลำดับ (1-based index)

เป้าหมายการลง:
- แพลตฟอร์ม/การใช้งาน: ${platform}
- Mood/โทนที่ต้องการ: ${mood}

ให้เลือกรูป จัดอันดับ และให้คำแนะนำตาม schema JSON ต่อไปนี้เท่านั้น:
- moodSummary: คำอธิบายสรุปบรรยากาศรวมของเซตรูปภาพนี้ (ภาษาไทย)
- bestPhotoIndex: หมายเลขรูปภาพที่ดีที่สุด (1 ถึง ${images.length})
- bestPhotoReason: เหตุผลภาษาไทยที่รูปนี้เหมาะกับแพลตฟอร์มและ mood ที่ต้องการมากที่สุด
- rankedPhotos: จัดอันดับรูปภาพที่เด่นที่สุด 3 อันดับแรก (มี index, score (คะแนน 1-10), suggestedUse (คำแนะนำในการนำไปใช้เป็นภาษาไทย))
- skipPhotos: รูปที่แนะนำให้ข้าม (เช่น มืดเกินไป ซ้ำ หรือหลุด mood) (มี index และ reason ภาษาไทย)
- storySequence: (เฉพาะถ้าแพลตฟอร์มคือ Story) ลำดับรูปที่ควรลงเรียงต่อกันเป็น Story พร้อมประโยคข้อความสั้นหรือคำทรานซิชันสอดแทรก (มี index และ transitionText ภาษาไทย)
- feedOrder: (เฉพาะถ้าแพลตฟอร์มคือ Feed) ลำดับดัชนีรูปที่ควรจัดเรียงใน Carousel/Swipe Feed (เช่น [2, 1, 3])
- coverIndex: (เฉพาะถ้าแพลตฟอร์มคือ Feed หรือ Reels cover) หมายเลขรูปที่ดีที่สุดสำหรับใช้เป็นรูปหน้าปก
- captionSuggestion: ไอเดียคำบรรยาย/แคปชั่นภาษาไทยสั้น ๆ ที่เข้ากับเซตรูป
- hashtags: แฮชแท็กกว้าง ๆ 5 แฮชแท็ก (เป็นแนวแมส ๆ)

กติกา:
- ทุกคำอธิบายและเหตุผลต้องเป็นภาษาไทยทั้งหมด
- การระบุหมายเลขรูปภาพ (index) ต้องอยู่ในช่วง 1 ถึง ${images.length} เท่านั้น ห้ามเกินหรือต่ำกว่า
- ให้ผลลัพธ์เป็น JSON ตรงตาม schema เท่านั้น ห้ามมี markdown บล็อกครอบนอก JSON

ตอบเป็น JSON เท่านั้น
`;

  const imageParts = images.map((img) => ({
    inlineData: {
      data: img.base64,
      mimeType: img.mimeType,
    },
  }));

  const response = await generateContentWithModelFallback(ai, {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          ...imageParts,
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: pickPhotosResponseSchema,
      temperature: 0.8,
      topP: 0.95,
    },
  });

  return normalizePhotoPickResult(parseJson(response.text ?? ""), images.length, platform, mood);
}

