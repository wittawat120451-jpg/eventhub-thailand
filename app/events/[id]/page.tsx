'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatThaiDateFull, formatPrice } from '@/lib/utils';
import { BookingModal } from '@/components/BookingModal';
import { EventCard } from '@/components/EventCard';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Video, 
  Ticket, 
  Building,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, events } = useApp();
  const eventId = params.id as string;
  const event = getEventById(eventId);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white font-['Kanit']">ไม่พบข้อมูลกิจกรรมนี้</h1>
        <p className="text-xs text-slate-400">กิจกรรมที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link href="/events" className="btn-primary px-6 py-2.5 rounded-full text-xs font-semibold inline-block">
          กลับไปดูกิจกรรมทั้งหมด
        </Link>
      </div>
    );
  }

  const seatsLeft = Math.max(0, event.max_seats - event.booked_seats);
  const percentBooked = Math.min(100, Math.round((event.booked_seats / event.max_seats) * 100));
  const isSoldOut = seatsLeft <= 0;

  const relatedEvents = events
    .filter((e) => e.id !== event.id && e.category === event.category)
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('คัดลอกลิงก์กิจกรรมแล้ว!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-dark-800 border border-purple-500/20 text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'คัดลอกแล้ว' : 'แชร์กิจกรรม'}</span>
        </button>
      </div>

      {/* Main Grid: Details (Left 8 cols) & Sticky Booking Bar (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Cols: Media & Detailed Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Hero Media Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-dark-850 shadow-2xl">
            <div className="relative h-[300px] sm:h-[420px] w-full">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />

              {/* Badges on Banner */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-brand-900/90 text-brand-200 border border-brand-500/40">
                  {event.category}
                </span>
                {event.location_type === 'online' && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-cyan-900/90 text-cyan-200 border border-cyan-500/40 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    Online Event
                  </span>
                )}
              </div>
            </div>

            {/* Event Title Header inside Card */}
            <div className="p-6 sm:p-8 -mt-16 relative z-10 space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Kanit'] leading-tight">
                {event.title}
              </h1>

              {/* Organizer Bar */}
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={event.organizer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={event.organizer}
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                />
                <div>
                  <p className="text-xs text-slate-400">จัดโดย (Organized by)</p>
                  <p className="text-sm font-semibold text-white">{event.organizer}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Facts Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">วันที่จัดงาน</p>
                <p className="text-sm font-bold text-white font-['Kanit']">{formatThaiDateFull(event.date)}</p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">เวลาจัดงาน</p>
                <p className="text-sm font-bold text-white font-['Kanit']">{event.time}</p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 flex items-center gap-3.5 sm:col-span-2">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400">สถานที่จัดงาน</p>
                <p className="text-sm font-bold text-white font-['Kanit'] truncate">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-4">
            <h2 className="text-xl font-bold text-white font-['Kanit'] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <span>เกี่ยวกับกิจกรรมนี้</span>
            </h2>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-light">
              <p className="whitespace-pre-line">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-purple-500/15 flex flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs bg-dark-800 text-slate-300 border border-purple-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Event Agenda / Timeline */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-6">
              <h2 className="text-xl font-bold text-white font-['Kanit'] flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>กำหนดการกิจกรรม (Agenda)</span>
              </h2>

              <div className="relative pl-6 space-y-6 border-l-2 border-purple-500/30">
                {event.agenda.map((item, index) => (
                  <div key={index} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand-600 border-2 border-dark-900 group-hover:scale-125 transition-transform" />
                    
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-semibold text-brand-300 px-2 py-0.5 rounded bg-brand-500/10">
                        {item.time}
                      </span>
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      {item.speaker && (
                        <p className="text-xs text-slate-400">วิทยากร: {item.speaker}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 4 Cols: Sticky Reservation Card */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-500 via-indigo-500 to-pink-500" />

            {/* Price Box */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">ราคาบัตรเข้าร่วมงาน</span>
              <div className="text-3xl font-extrabold text-white font-['Kanit']">
                {formatPrice(event.price)}
                {event.price > 0 && <span className="text-xs text-slate-400 font-normal ml-1">/ ที่นั่ง</span>}
              </div>
            </div>

            {/* Seat Capacity Bar */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-dark-850/90 border border-purple-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  <span>สถานะที่นั่ง:</span>
                </span>
                <span className={`font-bold ${isSoldOut ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isSoldOut ? 'เต็มแล้ว (Sold Out)' : `เหลือ ${seatsLeft} ที่นั่ง`}
                </span>
              </div>

              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSoldOut ? 'bg-rose-500' : 'bg-gradient-to-r from-brand-500 to-cyan-400'
                  }`}
                  style={{ width: `${percentBooked}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                จองแล้ว {event.booked_seats} จากทั้งหมด {event.max_seats} ที่นั่ง ({percentBooked}%)
              </p>
            </div>

            {/* Highlights bullet points */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>รับ E-Ticket QR Code ทันที</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>สามารถยกเลิกการจองได้ตลอดเวลา</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>มีระบบแจ้งเตือนและแผนที่จัดงาน</span>
              </div>
            </div>

            {/* Big Action Button */}
            <button
              onClick={() => setIsBookingOpen(true)}
              disabled={isSoldOut}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow transition-all ${
                isSoldOut
                  ? 'bg-dark-700 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'btn-primary text-white hover:scale-[1.02]'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{isSoldOut ? 'ขออภัย ที่นั่งเต็มแล้ว' : 'จองบัตรเข้าร่วมงานทันที'}</span>
            </button>

          </div>

        </div>

      </div>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <section className="pt-12 border-t border-purple-500/20 space-y-6">
          <h2 className="text-2xl font-bold text-white font-['Kanit']">
            กิจกรรมอื่น ๆ ในหมวดหมู่นี้
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((rel) => (
              <EventCard key={rel.id} event={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Booking Modal Instance */}
      <BookingModal
        event={event}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

    </div>
  );
}
