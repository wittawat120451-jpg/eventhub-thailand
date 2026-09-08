# 🎟️ EventHub Thailand - ระบบจัดกิจกรรมและจอง Event ระดับมืออาชีพ

ระบบจัดกิจกรรมและจอง Event สไตล์โมเดิร์น สวยงาม หรูหรา ด้วย **Next.js (App Router)** + **Tailwind CSS** + **Supabase** พร้อมแอนิเมชัน การแสดงผลรองรับภาษาไทย และระบบบริหารจัดการครบวงจร

---

## ✨ ฟีเจอร์เด่นของระบบ (Features)

- 🎨 **ดีไซน์ระดับพรีเมียม (Modern UI)**: โทนสีม่วง-คราม-น้ำเงิน (Purple-Indigo-Blue) พร้อม Glassmorphism, Gradient Glow และ Hover Effects
- 📱 **Fully Responsive**: รองรับทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์ 100%
- 🏠 **หน้าแรก (Landing Page)**: Hero Section อลังการ, ค้นหาแบบ Instant Search, หมวดหมู่อีเวนต์, ไฮไลต์กิจกรรมเด่น
- 🔍 **ค้นหาและกรองกิจกรรม (`/events`)**: ค้นหาตามคีย์เวิร์ด, กรองตามหมวดหมู่, กรองราคา (ฟรี/มีค่าใช้จ่าย), กรองรูปแบบ (Onsite/Online) และจัดเรียงลำดับ
- 📄 **หน้ารายละเอียดกิจกรรม (`/events/[id]`)**: แบนเนอร์ขนาดใหญ่, กำหนดการ (Agenda Timeline), แถบจองบัตร Sticky แสดงจำนวนที่นั่งคงเหลือแบบ Real-time
- 🎟️ **ระบบจองกิจกรรมและออก E-Ticket**:
  - เลือกจำนวนบัตร กรอกข้อมูลผู้เข้าร่วม
  - เอฟเฟกต์พลุเฉลิมฉลอง (Confetti Animation) เมื่อจองสำเร็จ
  - สร้างบัตร E-Ticket พร้อม **QR Code** สำหรับสแกนเข้างานจริง
  - สามารถสั่งพิมพ์ (Print) หรือบันทึกบัตรเป็น PDF ได้
- 👤 **หน้า "การจองของฉัน" (`/my-bookings`)**: ดูบัตรที่จองไว้, ดู QR Code, และฟังก์ชัน **ยกเลิกการจอง** เพื่อคืนที่นั่งให้ระบบโดยอัตโนมัติ
- ⚙️ **หน้า Admin Dashboard (`/admin`)**:
  - สรุปสถิติกิจกรรม ยอดการจอง จำนวนผู้เข้าร่วม และรายได้
  - เพิ่มกิจกรรมใหม่ (`/admin/new`) พร้อมระบบเลือกภาพหน้าปกสำเร็จรูป
  - แก้ไขกิจกรรม (`/admin/edit/[id]`)
  - ลบกิจกรรม พร้อมกล่องยืนยันความปลอดภัย
  - ดูรายชื่อผู้ลงทะเบียน (Attendees) ในแต่ละกิจกรรม
- 🛡️ **ระบบ Auth & สลับบทบาท**: รองรับทั้ง Login/Register และปุ่มสลับโหมด Demo (User / Admin) สำหรับการทดสอบ
- 🗄️ **รองรับทั้ง Supabase Live และ Local Demo Mode**: ใช้งานได้ทันที 100% แม้ยังไม่ได้ต่อ Supabase และเชื่อมต่อ Supabase ได้อย่างง่ายดาย

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism & Neon Glow Tokens
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Code Generator**: [qrcode.react](https://github.com/zpao/qrcode.react)
- **Animations & Notifications**: [Framer Motion](https://www.framer.com/motion/), [Canvas Confetti](https://github.com/catdad/canvas-confetti), [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันเซิร์ฟเวอร์สำหรับทดสอบ
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 🗄️ การตั้งค่า Supabase Database (ทางเลือกสำหรับการใช้งานจริง)

หากต้องการเชื่อมต่อกับฐานข้อมูล Supabase จริง ให้ทำตามขั้นตอนดังนี้:

1. สมัครใช้งานและสร้าง Project ใหม่ที่ [supabase.com](https://supabase.com)
2. ไปที่เมนู **SQL Editor** ใน Supabase Dashboard
3. คัดลอกโค้ดจากไฟล์ `supabase/schema.sql` ในโปรเจกต์นี้ ไปวางแล้วกด **Run**
4. ไปที่ **Project Settings -> API** เพื่อคัดลอก `Project URL` และ `anon public Key`
5. สร้างไฟล์ `.env.local` ในโฟลเดอร์โปรเจกต์:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
6. รีสตาร์ทเซิร์ฟเวอร์ด้วย `npm run dev` ระบบจะเชื่อมต่อกับ Supabase Live Database โดยอัตโนมัติ!

---

## 🐙 วิธีการ Upload ขึ้น GitHub

เปิด Terminal ในโฟลเดอร์นี้ แล้วรันคำสั่ง:

```bash
# 1. ตรวจสอบสถานะและ Add ไฟล์ทั้งหมด
git add .

# 2. บันทึก Commit
git commit -m "feat: Initial commit for EventHub Thailand"

# 3. กำหนด Branch หลักเป็น main
git branch -M main

# 4. เชื่อมต่อกับ GitHub Repository ของคุณ (แทนที่ URL ด้านล่างด้วย URL บน GitHub ของคุณ)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 5. Push โค้ดขึ้น GitHub
git push -u origin main
```

---

## 🚀 วิธีการ Deploy ขึ้น Vercel ใน 1 คลิก

1. ไปที่ [vercel.com](https://vercel.com) แล้วล็อกอินด้วยบัญชี GitHub ของคุณ
2. กดปุ่ม **"Add New..." -> "Project"**
3. เลือก Repository ที่คุณเพิ่ง Push ขึ้นไป แล้วกด **"Import"**
4. ในส่วน **Environment Variables** (หากใช้ Supabase):
   - เพิ่ม `NEXT_PUBLIC_SUPABASE_URL`
   - เพิ่ม `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. กดปุ่ม **"Deploy"** แล้วรอประมาณ 1 นาที เว็บไซต์จะพร้อมใช้งานทั่วโลกทันที!

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── app/
│   ├── layout.tsx              # Root Layout พร้อม Providers & Theme
│   ├── page.tsx                # Landing Page (Hero, Categories, Featured, Grid)
│   ├── globals.css             # Tailwind CSS + Custom Design System
│   ├── events/
│   │   ├── page.tsx            # หน้ารวมและค้นหากิจกรรม (Filter & Sort)
│   │   └── [id]/page.tsx       # หน้ารายละเอียดกิจกรรม & Sticky Booking
│   ├── my-bookings/page.tsx    # หน้าการจองของฉัน & E-Tickets QR Code
│   ├── auth/
│   │   ├── login/page.tsx      # หน้าเข้าสู่ระบบ (พร้อม 1-Click Demo)
│   │   └── register/page.tsx   # หน้าสมัครสมาชิก
│   └── admin/
│       ├── page.tsx            # Admin Dashboard (สถิติ, จัดการกิจกรรม & ผู้จอง)
│       ├── new/page.tsx        # สร้างกิจกรรมใหม่
│       └── edit/[id]/page.tsx  # แก้ไขกิจกรรม
├── components/
│   ├── Navbar.tsx              # เมนูนำทางแบบ Glassmorphism & Role Switcher
│   ├── Footer.tsx              # ส่วนท้ายเว็บไซต์
│   ├── EventCard.tsx           # การ์ดกิจกรรมพร้อม Seat Progress Bar
│   ├── BookingModal.tsx        # ป๊อปอัปจองบัตรพร้อม Confetti Animation
│   ├── TicketPass.tsx          # บัตร E-Ticket พร้อม QR Code สแกนได้จริง
│   ├── AdminEventForm.tsx      # ฟอร์มสร้าง/แก้ไขกิจกรรม
│   └── ToastProvider.tsx       # แจ้งเตือนสไตล์ Dark Theme
├── context/
│   └── AppContext.tsx          # Context จัดการ Auth, Event และ Booking
├── lib/
│   ├── supabase.ts             # การเชื่อมต่อ Supabase Client
│   ├── types.ts                # TypeScript Interfaces
│   ├── sample-data.ts          # ข้อมูลกิจกรรมตัวอย่างภาษาไทย
│   └── utils.ts                # Helper ฟังก์ชันแปลงวันที่และสกุลเงินบาท
├── supabase/
│   └── schema.sql              # สคริปต์สร้าง Tables, RLS และ Trigger ใน Supabase
└── README.md
```

---

© 2026 EventHub Thailand. All rights reserved.
