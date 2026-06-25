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

export type PhotoRank = {
  index: number;
  score: number;
  suggestedUse: string;
};

export type PhotoSkip = {
  index: number;
  reason: string;
};

export type StorySlide = {
  index: number;
  transitionText: string;
};

export type PhotoPickResult = {
  moodSummary: string;
  bestPhotoIndex: number;
  bestPhotoReason: string;
  rankedPhotos: PhotoRank[];
  skipPhotos: PhotoSkip[];
  storySequence?: StorySlide[];
  feedOrder?: number[];
  coverIndex?: number;
  captionSuggestion?: string;
  hashtags?: string[];
  totalUploaded?: number;
  shortlistedCount?: number;
  shortlistedIndices?: number[];
};

export type PickPhotosResponse = {
  result: PhotoPickResult;
  fallback?: boolean;
  error?: string;
};

export const PICK_PLATFORMS = [
  "Story",
  "Feed",
  "Reels cover",
] as const;

export const PICK_MOODS = [
  "เท่",
  "มินิมอล",
  "เหงา",
  "ฮีลใจ",
  "แมส",
  "ธรรมชาติ",
  "คาเฟ่",
  "วิ่ง",
  "ท้องฟ้า",
] as const;

export type PickPlatform = (typeof PICK_PLATFORMS)[number];
export type PickMood = (typeof PICK_MOODS)[number];

