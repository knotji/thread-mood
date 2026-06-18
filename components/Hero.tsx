"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-5 pt-8"
    >
      <div className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
        ThreadMood · คิดเธรดให้หน่อย
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
          บางทีคลิปดีอยู่แล้ว
          <br />
          แค่ยังขาดประโยคที่ทำให้คนหยุดดู
        </h1>
        <p className="text-base leading-7 text-slate-600 sm:text-lg">
          อัปโหลดรูปจากคลิป แล้วให้ AI ช่วยคิดคำแปะคลิป แคปชั่น เพลง และ #
          สำหรับ Reels
        </p>
      </div>
      <p className="rounded-2xl bg-white/75 px-4 py-3 text-sm leading-6 text-slate-500 ring-1 ring-slate-100">
        เหมาะกับคลิปวิ่ง ท้องฟ้า พระอาทิตย์ตก คาเฟ่ อกหัก ฮีลใจ
        และชีวิตประจำวัน
      </p>
    </motion.section>
  );
}
