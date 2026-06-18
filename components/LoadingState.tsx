"use client";

import { motion } from "framer-motion";

const loadingMessages = [
  "กำลังอ่าน mood ของรูป…",
  "กำลังหาเธรดที่ทำให้คนหยุดดู…",
  "กำลังจับคู่เพลงกับอารมณ์ของคลิป…",
  "กำลังจัดชุดพร้อมลง Reels…",
];

type LoadingStateProps = {
  messageIndex: number;
};

export function LoadingState({ messageIndex }: LoadingStateProps) {
  const message = loadingMessages[messageIndex % loadingMessages.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-sky-100 bg-sky-50 p-5 text-center"
    >
      <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
      <p className="font-medium text-sky-900">{message}</p>
      <p className="mt-1 text-sm text-sky-700/80">รอสักครู่ เดี๋ยวจัดชุดให้พร้อมใช้</p>
    </motion.div>
  );
}
