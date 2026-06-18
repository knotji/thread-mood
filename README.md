# ThreadMood

ThreadMood หรือ “คิดเธรดให้หน่อย” คือเว็บแอป mobile-first สำหรับครีเอเตอร์ไทยที่ทำ Instagram Reels
ผู้ใช้สามารถอัปโหลดรูปจากคลิป เลือกหมวดคอนเทนต์ เลือกโทนการเขียน แล้วให้ Gemini ช่วยคิด:

- คำแปะคลิป / overlay thread
- แคปชั่น Reels
- 5 แฮชแท็กกว้าง ๆ สำหรับ reach
- ไอเดียเพลงและ keyword สำหรับค้นใน Instagram Music
- Best pick ที่แนะนำให้ใช้

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Gemini API ผ่าน `@google/genai`
- ไม่มี database, authentication, payment หรือ analytics

## Install

```bash
npm install
```

บน Windows PowerShell ที่ block script execution ให้ใช้:

```bash
npm.cmd install
```

## Environment

สร้างไฟล์ `.env.local` จาก `.env.example`

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

API key จะถูกใช้เฉพาะฝั่ง server ใน `app/api/generate-thread/route.ts` และไม่ถูกส่งไป client

## Run Locally

```bash
npm run dev
```

หรือบนเครื่องที่ต้องเรียกผ่าน `.cmd`:

```bash
npm.cmd run dev
```

เปิด `http://localhost:3000`

สำหรับทดสอบบนมือถือในวง Wi-Fi เดียวกัน:

```bash
npm.cmd run dev:lan
```

เปิด `http://192.168.1.100:3001`

## Install as App

โปรเจกต์นี้ตั้งค่าเป็น PWA แล้ว สามารถติดตั้งจาก browser ได้

- Chrome / Edge บนคอม: เปิดเว็บ แล้วกดไอคอน Install ที่ address bar
- Android Chrome: เปิดเว็บ แล้วเลือก Add to Home screen หรือ Install app
- iPhone Safari: เปิดเว็บ กด Share แล้วเลือก Add to Home Screen

หมายเหตุ: Service worker จะ register ใน production build เท่านั้น หากต้องการทดสอบ install แบบจริงจังให้รัน:

```bash
npm.cmd run build
npm.cmd run start:pwa
```

จากนั้นเปิด `http://localhost:3001` บนเครื่องนี้แล้วกด Install ใน browser

## Notes

- จำกัดรูปไม่เกิน 5MB
- ถ้า Gemini ใช้งานไม่ได้ แอปจะแสดง fallback result แทนการ crash
- เพลงเป็นไอเดียตาม mood ของเธรด แนะนำให้ค้นชื่อเพลงหรือ keyword ใน IG Music อีกครั้งก่อนใช้งานจริง
