'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { CATEGORIES_LIST } from '@/lib/sample-data';
import { EventCard } from '@/components/EventCard';
import { BookingModal } from '@/components/BookingModal';
import { EventItem } from '@/lib/types';
import { 
  Sparkles, 
  Search, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Flame, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  Users, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function HomePage() {
  const { events } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);

  // Filtered events
  const filteredEvents = events.filter((ev) => {
    const matchSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = selectedCategory === 'all' || ev.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const featuredEvents = events.filter((ev) => ev.featured).slice(0, 3);

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-16 overflow-hidden">
        {/* Glowing aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-glow animate-pulse-subtle">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>แพลตฟอร์มจัดกิจกรรมและจอง Event อันดับ 1 ในไทย</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-['Kanit']">
              ค้นพบ & จองกิจกรรมที่คุณหลงใหล <br />
              <span className="gradient-text">ในทุกช่วงเวลาสำคัญ</span> ✨
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              ศูนย์รวมสัมมนา AI, เวิร์กช็อปพัฒนาทักษะ, อีเวนต์สตาร์ทอัพ และเทศกาลดนตรีระดับพรีเมียม จองง่าย ได้บัตร E-Ticket QR Code ทันที
            </p>
          </div>

          {/* Interactive Search Bar in Hero */}
          <div className="max-w-3xl mx-auto glass-panel p-3 rounded-2xl md:rounded-full border border-purple-500/30 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-2">
              
              {/* Search text */}
              <div className="flex-1 w-full flex items-center gap-2.5 px-4 py-2.5 bg-dark-900/80 rounded-xl md:rounded-full border border-purple-500/20">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อกิจกรรม, วิทยากร, สถานที่..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Category dropdown */}
              <div className="w-full md:w-56 px-4 py-2.5 bg-dark-900/80 rounded-xl md:rounded-full border border-purple-500/20">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
                >
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c.id} value={c.id} className="bg-dark-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Action */}
              <Link
                href={`/events?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`}
                className="w-full md:w-auto btn-primary px-6 py-3 rounded-xl md:rounded-full text-sm font-semibold flex items-center justify-center gap-2 shrink-0 shadow-glow"
              >
                <span>ค้นหา</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
            <div className="p-4 rounded-2xl bg-dark-850/60 border border-purple-500/15 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-['Kanit']">500+</p>
              <p className="text-xs text-slate-400 mt-0.5">กิจกรรมคุณภาพ</p>
            </div>
            <div className="p-4 rounded-2xl bg-dark-850/60 border border-purple-500/15 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-300 font-['Kanit']">85,000+</p>
              <p className="text-xs text-slate-400 mt-0.5">ผู้เข้าร่วมงาน</p>
            </div>
            <div className="p-4 rounded-2xl bg-dark-850/60 border border-purple-500/15 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-['Kanit']">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">QR Code สแกนได้จริง</p>
            </div>
            <div className="p-4 rounded-2xl bg-dark-850/60 border border-purple-500/15 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-pink-300 font-['Kanit']">4.9 / 5</p>
              <p className="text-xs text-slate-400 mt-0.5">คะแนนความพึงพอใจ</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORIES HORIZONTAL PILLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Kanit'] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <span>เลือกชมตามหมวดหมู่</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">ค้นพบกิจกรรมที่คุณสนใจในหลากหลายสาขา</p>
          </div>
          <Link
            href="/events"
            className="text-xs text-brand-300 hover:text-brand-200 flex items-center gap-1 font-medium transition-colors"
          >
            <span>ดูทั้งหมด</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-br from-brand-900/80 to-indigo-900/80 border-brand-400 shadow-glow'
                    : 'bg-dark-850/80 border-purple-500/20 hover:border-purple-400/50 hover:bg-dark-800'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block leading-tight font-['Kanit']">
                    {cat.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED HIGHLIGHT EVENTS */}
      {featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 fill-amber-300" />
                <span>ไฮไลต์ยอดนิยมประจำสัปดาห์</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Kanit']">
                กิจกรรมที่ไม่ควรพลาด 🔥
              </h2>
            </div>
            <Link
              href="/events"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-brand-300 hover:text-white font-semibold transition-colors"
            >
              <span>ดูกิจกรรมทั้งหมด ({events.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onQuickBook={(ev) => setBookingEvent(ev)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. ALL UPCOMING EVENTS WITH INSTANT FILTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-purple-500/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Kanit']">
              กิจกรรมทั้งหมด ({filteredEvents.length})
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              เลือกจองกิจกรรมและเวิร์กช็อปที่เปิดรับสมัครอยู่ในขณะนี้
            </p>
          </div>

          {/* Quick Category filter buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES_LIST.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'bg-dark-800 text-slate-400 hover:text-white border border-purple-500/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onQuickBook={(ev) => setBookingEvent(ev)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-dark-850/50 rounded-3xl border border-purple-500/20 space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Kanit']">ไม่พบกิจกรรมที่ตรงกับการค้นหา</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่เป็น &quot;ทั้งหมด&quot; เพื่อดูกิจกรรมอื่น ๆ
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-secondary text-xs px-4 py-2 rounded-full mt-2"
            >
              ล้างการค้นหา
            </button>
          </div>
        )}
      </section>

      {/* 5. WHY CHOOSE EVENTHUB (FEATURE HIGHLIGHTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/30 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-600/15 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-3xl mb-10 space-y-3">
            <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              ทำไมต้อง EventHub Thailand
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Kanit'] leading-snug">
              ยกระดับประสบการณ์การจัดงานและเข้าร่วมกิจกรรมอย่างสมบูรณ์แบบ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-dark-850/80 border border-purple-500/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white font-['Kanit']">
                E-Ticket & QR Code Real-time
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                รับบัตรดิจิทัลพร้อมรหัส QR Code ส่วนตัวทันทีหลังจอง ใช้สแกนเข้างานได้สะดวกรวดเร็ว ไม่ต้องพิมพ์กระดาษ
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-850/80 border border-purple-500/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white font-['Kanit']">
                จัดการที่นั่งและยกเลิกสะดวก
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ระบบหักและคืนโควต้าที่นั่งอัตโนมัติ หากติดธุระสามารถกดยกเลิกการจองผ่านหน้า &quot;การจองของฉัน&quot; ได้ตลอดเวลา
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-850/80 border border-purple-500/20 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white font-['Kanit']">
                ระบบ Admin ควบคุมครบวงจร
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                แผงควบคุมสำหรับผู้จัดงาน เพิ่ม/แก้ไข/ลบอีเวนต์ ติดตามสถิติผู้เข้าร่วม และรายงานผลแบบ Real-time
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOR ORGANIZERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-brand-900 via-indigo-900 to-purple-900 border border-brand-500/40 shadow-glow">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Kanit']">
                เป็นผู้จัดงานอีเวนต์กับ EventHub Thailand
              </h2>
              <p className="text-sm text-purple-200 max-w-xl font-light">
                สร้างกิจกรรมของคุณเอง เปิดรับผู้เข้าร่วมงาน และจัดการระบบจำหน่ายบัตรได้ในไม่กี่นาที
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/admin/new"
                className="px-6 py-3.5 rounded-xl bg-white text-dark-900 font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <PlusCircle className="w-4 h-4 text-brand-600" />
                <span>สร้าง Event ใหม่</span>
              </Link>
              <Link
                href="/admin"
                className="px-6 py-3.5 rounded-xl bg-dark-900/60 border border-purple-400/40 text-white font-semibold text-sm hover:bg-dark-900 transition-all flex items-center justify-center gap-2"
              >
                <span>เข้าสู่แดชบอร์ด</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal Instance */}
      {bookingEvent && (
        <BookingModal
          event={bookingEvent}
          isOpen={Boolean(bookingEvent)}
          onClose={() => setBookingEvent(null)}
        />
      )}

    </div>
  );
}
