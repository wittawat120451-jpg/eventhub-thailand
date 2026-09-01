-- ==============================================================================
-- SQL SCHEMA FOR SUPABASE: ระบบจองวันกิจกรรม/งานอีเวนต์ (EventFlow)
-- นำโค้ดนี้ไปวางในเมนู SQL Editor ใน Supabase Dashboard แล้วกด Run
-- ==============================================================================

-- 1. สร้างตาราง bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    booker_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL DEFAULT 'all-day',
    custom_time TEXT DEFAULT '',
    category TEXT DEFAULT 'other',
    guests_count INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. กำหนด Policy อนุญาตให้ผู้ใช้ทุกคนสามารถอ่าน (SELECT) ข้อมูลการจองได้
CREATE POLICY "Allow public read access on bookings"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. กำหนด Policy อนุญาตให้ผู้ใช้ทุกคนสามารถเพิ่ม (INSERT) รายการจองใหม่ได้
CREATE POLICY "Allow public insert access on bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. กำหนด Policy อนุญาตให้แก้ไข (UPDATE) รายการจองได้
CREATE POLICY "Allow public update access on bookings"
ON public.bookings
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. กำหนด Policy อนุญาตให้ลบ (DELETE) รายการจองได้
CREATE POLICY "Allow public delete access on bookings"
ON public.bookings
FOR DELETE
TO anon, authenticated
USING (true);

-- 7. เพิ่มข้อมูลตัวอย่างเริ่มต้น (Mock Data)
INSERT INTO public.bookings (id, title, booker_name, phone, date, time_slot, category, guests_count, description)
VALUES
    ('bk-sb-01', 'งานสัมมนา AI & Modern Web Development 2026', 'อาจารย์วิทวัส บุญยืน', '081-234-5678', TO_CHAR(CURRENT_DATE + INTERVAL '2 days', 'YYYY-MM-DD'), 'all-day', 'seminar', 80, 'งานสัมมนาเทคโนโลยี AI และการพัฒนาเว็บแอปพลิเคชันยุคใหม่'),
    ('bk-sb-02', 'เวิร์กช็อป React & Supabase สำหรับนักศึกษา', 'สมชาย พัฒนาการ', '089-987-6543', TO_CHAR(CURRENT_DATE + INTERVAL '5 days', 'YYYY-MM-DD'), 'morning', 'workshop', 35, 'ลงมือสร้างเว็บด้วย React + Supabase Cloud Database'),
    ('bk-sb-03', 'งานเลี้ยงต้อนรับและสังสรรค์ประจำปี', 'สุดาพร มงคลศิลป์', '092-345-6789', TO_CHAR(CURRENT_DATE + INTERVAL '9 days', 'YYYY-MM-DD'), 'evening', 'party', 120, 'งานสังสรรค์ฉลองความสำเร็จองค์กร')
ON CONFLICT (id) DO NOTHING;
