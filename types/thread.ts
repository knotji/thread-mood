export type SongSuggestion = {
  title: string;
  artist: string;
  reason: string;
};

export type ThreadResult = {
  imageMood: string;
  contentAngle: string;
  overlayThreads: string[];
  captions: string[];
  hashtags: string[];
  musicMatch: {
    mood: string;
    whyItFits: string;
    songKeywords: string[];
    songSuggestions: SongSuggestion[];
  };
  bestPick: {
    overlay: string;
    caption: string;
    reason: string;
  };
};

export type GenerateThreadResponse = {
  result: ThreadResult;
  fallback?: boolean;
  error?: string;
};

export const CATEGORIES = [
  "วิ่ง",
  "ท้องฟ้า",
  "พระอาทิตย์ตก",
  "คาเฟ่",
  "อยู่คนเดียว",
  "อกหัก",
  "ฮีลใจ",
  "ชีวิตประจำวัน",
  "เท่ ๆ",
  "กวน ๆ",
] as const;

export const TONES = [
  "แมส ๆ",
  "สั้น ๆ",
  "เจ็บนิด ๆ",
  "ฮีลใจ",
  "กวนตีน",
  "เท่",
  "ละมุน",
  "เหงา",
  "รักตัวเอง",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Tone = (typeof TONES)[number];
