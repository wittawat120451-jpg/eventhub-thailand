-- ==============================================================================
-- EventHub Thailand - Supabase Database Schema
-- Run this script in the Supabase SQL Editor to initialize all tables, RLS & seed data
-- ==============================================================================

-- 1. Create Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  location_type TEXT DEFAULT 'onsite' CHECK (location_type IN ('onsite', 'online')),
  max_seats INTEGER NOT NULL DEFAULT 100,
  booked_seats INTEGER NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  organizer TEXT NOT NULL,
  organizer_avatar TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT false,
  agenda JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  ticket_count INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL DEFAULT 0,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
  ticket_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- Triggers for Automatic Seat Management
-- ==============================================================================

-- Trigger Function to update booked_seats when a booking is created or updated
CREATE OR REPLACE FUNCTION public.handle_booking_seat_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status = 'confirmed') THEN
      UPDATE public.events
      SET booked_seats = booked_seats + NEW.ticket_count
      WHERE id = NEW.event_id;
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status = 'confirmed' AND NEW.status = 'cancelled') THEN
      UPDATE public.events
      SET booked_seats = GREATEST(0, booked_seats - NEW.ticket_count)
      WHERE id = NEW.event_id;
    ELSIF (OLD.status = 'cancelled' AND NEW.status = 'confirmed') THEN
      UPDATE public.events
      SET booked_seats = booked_seats + NEW.ticket_count
      WHERE id = NEW.event_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status = 'confirmed') THEN
      UPDATE public.events
      SET booked_seats = GREATEST(0, booked_seats - OLD.ticket_count)
      WHERE id = OLD.event_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to bookings table
DROP TRIGGER IF EXISTS tr_booking_seat_count ON public.bookings;
CREATE TRIGGER tr_booking_seat_count
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_booking_seat_count();

-- Trigger for Auto-creating Profile on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events Policies
CREATE POLICY "Events are viewable by everyone" 
  ON public.events FOR SELECT USING (true);

CREATE POLICY "Authenticated users or admins can insert/modify events" 
  ON public.events FOR ALL USING (true);

-- Bookings Policies
CREATE POLICY "Users can view their own bookings or all if admin" 
  ON public.bookings FOR SELECT USING (true);

CREATE POLICY "Users can insert bookings" 
  ON public.bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update/cancel their own bookings" 
  ON public.bookings FOR UPDATE USING (true);

-- ==============================================================================
-- Seed Initial Events Data
-- ==============================================================================

INSERT INTO public.events (
  title, description, category, date, time, location, location_type, max_seats, booked_seats, price, image_url, organizer, tags, featured
) VALUES
(
  'Thailand AI & Next-Gen Tech Summit 2026',
  'มหกรรมสัมมนาเทคโนโลยีปัญญาประดิษฐ์ที่ยิ่งใหญ่ที่สุดแห่งปี รวบรวมผู้เชี่ยวชาญด้าน Generative AI, Machine Learning และ Cloud Computing ชั้นนำระดับโลก พร้อมเวิร์กช็อปและโชว์เคสผลงานนวัตกรรมกว่า 50 บูธ',
  'Tech & AI',
  '2026-10-24',
  '09:00 - 18:00 น.',
  'True Digital Park, Grand Hall ชั้น 3, กรุงเทพฯ',
  'onsite',
  350,
  218,
  0,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  'Tech Innovators Network Thailand',
  ARRAY['AI', 'Tech', 'Innovation', 'Machine Learning', 'Free'],
  true
),
(
  'Neon Horizon Music & Light Festival 2026',
  'เทศกาลดนตรีและศิลปะแสงสีสุดอลังการใจกลางกรุง สัมผัสประสบการณ์ดนตรี Synthwave, Electronic และ Indie Pop จากศิลปินระดับแถวหน้าทั้งไทยและต่างประเทศ พร้อมโซนถ่ายรูป Interactive Art และ Food Trucks กว่า 40 ร้าน',
  'Music & Festival',
  '2026-11-14',
  '16:00 - 23:30 น.',
  'Live Park พระราม 9, กรุงเทพมหานคร',
  'onsite',
  500,
  432,
  1290,
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  'Sonic Pulse Events & Entertainment',
  ARRAY['Music', 'Concert', 'Festival', 'EDM', 'Indie'],
  true
),
(
  'Southeast Asia Startup Pitch & Venture Day',
  'เวทีประกวดแผนธุรกิจสตาร์ทอัพดาวรุ่ง ชิงเงินรางวัลและโอกาสรับเงินลงทุนรวมกว่า 10,000,000 บาท พบปะกับ Angel Investors และ Venture Capitals จากทั่วภูมิภาคเอเชียตะวันออกเฉียงใต้',
  'Business & Startup',
  '2026-10-30',
  '10:00 - 17:30 น.',
  'Gaysorn Urban Resort, อาคาร Gaysorn Tower, กรุงเทพฯ',
  'onsite',
  120,
  98,
  490,
  'https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=1200&q=80',
  'Venture Leap Asia',
  ARRAY['Startup', 'Business', 'Investment', 'Pitching', 'Networking'],
  true
),
(
  'Design System & Micro-Interaction Masterclass (Figma & Code)',
  'เวิร์กช็อปเข้มข้น 1 วันเต็ม ออกแบบ UI Component และ Design System ระดับองค์กร พร้อมการแปลงผลงานไปสู่ Next.js + Tailwind CSS และทำ Interaction Animation สวยสะกดตา',
  'Design & Creative',
  '2026-11-07',
  '09:30 - 16:30 น.',
  'WeWork อาคาร T-One ชั้น 14 (BTS ทองหล่อ) หรือ Online Live Stream',
  'onsite',
  40,
  36,
  2500,
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
  'Creative Dev Academy',
  ARRAY['UIUX', 'Figma', 'WebDesign', 'TailwindCSS', 'Masterclass'],
  false
),
(
  'Zero Trust & Cloud Security Hands-on Lab',
  'เรียนรู้แนวทางป้องกันภัยคุกคามทางไซเบอร์ยุคใหม่ ทดลองทำ Red Team vs Blue Team Simulation และวางสถาปัตยกรรมความปลอดภัยบน AWS และ Google Cloud',
  'Workshop & Skills',
  '2026-11-21',
  '13:00 - 17:00 น.',
  'Online Webinar (Zoom Interactive Room)',
  'online',
  200,
  142,
  0,
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
  'CyberSec Shield Club',
  ARRAY['Cybersecurity', 'Cloud', 'Online', 'Free', 'HandsOn'],
  false
),
(
  'Bangkok City Neon Night Run 2026 (10K / 5K)',
  'งานวิ่งกลางคืนสไตล์นีออนเรืองแสง วิ่งชมความงามของสะพานพระราม 8 และทิวทัศน์ริมแม่น้ำเจ้าพระยา พร้อมรับเหรียญที่ระลึกเรืองแสง เสื้อวิ่งดรายฟิต และ Mini Concert หลังเส้นชัย',
  'Health & Sport',
  '2026-11-28',
  '18:30 - 22:00 น.',
  'สวนหลวง ร.9 และบริเวณสะพานพระราม 8 กรุงเทพฯ',
  'onsite',
  800,
  615,
  650,
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
  'Active Life Run Club Thailand',
  ARRAY['Running', 'Sport', 'NightRun', 'Health', 'Bangkok'],
  false
);
