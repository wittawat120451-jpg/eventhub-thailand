-- ==========================================================================
-- EVENTSPHERE - Complete Supabase SQL Database Schema
-- Run this in Supabase SQL Editor to create all tables and sample data
-- ==========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  speaker TEXT,
  capacity INTEGER NOT NULL DEFAULT 50,
  booked_seats INTEGER NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  organizer TEXT,
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  ref_code TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'checked_in', 'cancelled'
  event_date DATE,
  qr_payload TEXT,
  promoted_from_waitlist BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Waitlists Table
CREATE TABLE IF NOT EXISTS public.waitlists (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  queue_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'promoted', 'cancelled'
  promoted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Users Profile Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin'
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT DEFAULT 'home',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- 7. Insert Initial Sample Events
-- ==========================================================================
INSERT INTO public.events (id, title, category, date, time, location, description, speaker, capacity, booked_seats, price, image_url, organizer, featured, tags)
VALUES
('evt-001', 'Cat Expo 2026: เทศกาลดนตรีของคนรักเสียงเพลง', 'music', '2026-09-19', '14:00 - 23:30 น.', 'สวนสนุกวันเดอร์เวิลด์ รามอินทรา กรุงเทพฯ', 'เทศกาลดนตรีประจำปีที่ยิ่งใหญ่ที่สุด รวบรวมศิลปินอินดี้และป๊อปกว่า 100 วงทั่วฟ้าเมืองไทย', 'ผู้จัด: Cat Radio & ทีมงาน', 300, 288, 1500, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80', 'Cat Radio Official', true, ARRAY['คอนเสิร์ต', 'CatExpo', 'ดนตรี', 'อินดี้']),

('evt-002', 'T-POP All Stars Live Concert 2026', 'music', '2026-09-27', '18:00 - 22:00 น.', 'อิมแพ็ค อารีน่า เมืองทองธานี', 'รวมพลไอดอลและศิลปิน T-POP แถวหน้าของเมืองไทย จัดเต็มโปรดักชัน แสง สี เสียง และเวที 360 องศา', 'ผู้จัด: T-POP Universe Group', 500, 500, 2500, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80', 'T-POP Universe', true, ARRAY['T-POP', 'Concert', 'ImpactArena', 'ไอดอล']),

('evt-003', 'Tech & AI Hands-on Workshop: สร้าง Web App ด้วย AI', 'tech', '2026-09-13', '09:30 - 16:30 น.', 'สามย่านมิตรทาวน์ฮอลล์ (ชั้น 5) / MRT สามย่าน', 'เวิร์กช็อป 1 วันเต็ม ลงมือเขียนโค้ดและเชื่อมต่อ Generative AI API สร้างเว็บแอปพลิเคชันที่ใช้งานได้จริง', 'คุณณัฐพล เกียรติ์เจริญ (Lead AI Specialist)', 60, 42, 1990, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', 'DevClub Thailand', false, ARRAY['AI', 'Coding', 'Workshop', 'สามย่านมิตรทาวน์']),

('evt-004', 'Bangkok City Midnight Run 2026 (10K / 21K)', 'sport', '2026-10-03', '23:00 - 04:00 น.', 'ลานคนเมือง เสาชิงช้า - ถ.ราชดำเนิน กรุงเทพฯ', 'วิ่งรับลมหนาวยามค่ำคืนใจกลางเกาะรัตนโกสินทร์ ผ่านวัดพระแก้ว โลหะปราสาท และสะพานพระราม 8', 'ผู้จัด: สมาคมวิ่งเพื่อสุขภาพกรุงเทพมหานคร', 800, 650, 650, 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=80', 'BKK Runners Guild', true, ARRAY['วิ่งมาราธอน', 'NightRun', 'สุขภาพ', 'เสาชิงช้า']),

('evt-005', 'Specialty Coffee & Slow Bar Drip Masterclass', 'workshop', '2026-09-12', '13:00 - 17:00 น.', 'Roots Coffee Lab (สุขุมวิท 49 / BTS พร้อมพงษ์)', 'เรียนรู้ศาสตร์การดริปกาแฟพิเศษ คัดสรรเมล็ดกาแฟไทยยอดนิยม ทดลองปรับ Ratio และชิมรสชาติ', 'คุณกฤษฎา เลิศศิริ (บาริสต้าแชมป์ประเทศไทย)', 20, 14, 1850, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80', 'Craft Coffee Studio BKK', false, ARRAY['กาแฟดริป', 'เวิร์กช็อป', 'Coffee', 'สุขุมวิท']),

('evt-006', 'สัมมนาเจาะลึกเทรนด์การตลาดออนไลน์ & TikTok Commerce 2026', 'seminar', '2026-09-24', '10:00 - 15:30 น.', 'True Digital Park (Auditorium ชั้น 6) / BTS ปุณณวิถี', 'กลยุทธ์ปั้นยอดขายด้วย Short Video, Live Streaming และ TikTok Shop เปลี่ยนยอดวิวเป็นยอดสั่งซื้อจริง', 'ผู้เชี่ยวชาญด้าน Digital Marketing & Top Creator', 120, 75, 0, 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', 'Digital Growth Academy Thailand', false, ARRAY['การตลาด', 'TikTok', 'ธุรกิจ', 'สัมมนาฟรี'])
ON CONFLICT (id) DO NOTHING;

-- 8. Enable Row Level Security (RLS) & Allow Read/Write
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public access for demonstration & ease of use
CREATE POLICY "Public full access events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access waitlists" ON public.waitlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
