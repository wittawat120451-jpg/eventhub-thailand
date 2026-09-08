'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EventItem, Booking } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatThaiDate } from '@/lib/utils';
import { TicketPass } from './TicketPass';
import confetti from 'canvas-confetti';
import { 
  X, 
  Ticket, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface BookingModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ event, isOpen, onClose }) => {
  const { currentUser, createBooking } = useApp();
  const [ticketCount, setTicketCount] = useState(1);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '081-234-5678');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const seatsLeft = Math.max(0, event.max_seats - event.booked_seats);
  const maxAvailable = Math.min(6, seatsLeft);
  const totalPrice = event.price * ticketCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('กรุณากรอกชื่อ-นามสกุล และอีเมลให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBooking(event.id, {
        name,
        email,
        phone,
        ticketCount,
      });

      if (result) {
        setConfirmedBooking(result);
        // Trigger celebratory confetti animation
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B'],
          });
        } catch {
          // ignore if canvas not ready
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    setTicketCount(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Card Box */}
      <div className="relative w-full max-w-lg bg-dark-850 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Header Background Glow */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-brand-600/20 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-dark-900/80 text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-slate-700/50"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* SUCCESS STATE: Confirmed & View Ticket */
          <div className="p-6 md:p-8 space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-300 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                🎉 การจองสำเร็จ (Booking Confirmed)
              </span>
              <h2 className="text-2xl font-bold text-white mt-3 font-['Kanit']">
                ขอบคุณสำหรับการจองบัตร!
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ระบบได้ส่งรายละเอียดไปยัง <strong className="text-brand-300">{confirmedBooking.user_email}</strong> แล้ว
              </p>
            </div>

            {/* Generated E-Ticket Pass */}
            <div className="text-left">
              <TicketPass booking={confirmedBooking} event={event} />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/my-bookings"
                onClick={handleClose}
                className="flex-1 btn-primary py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>ดูในการจองของฉัน</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary py-3 px-6 rounded-xl text-sm font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE: Input Booking Information */
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Modal Title */}
            <div>
              <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Ticket className="w-4 h-4" />
                <span>จองบัตรเข้าร่วมกิจกรรม</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white font-['Kanit'] leading-snug">
                {event.title}
              </h2>
            </div>

            {/* Event Summary Mini Card */}
            <div className="p-3.5 rounded-2xl bg-dark-800/80 border border-purple-500/20 flex gap-3.5 items-center">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="text-xs space-y-1 overflow-hidden">
                <div className="flex items-center gap-1.5 text-brand-300 font-medium">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{formatThaiDate(event.date)} • {event.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="text-white font-semibold font-['Kanit']">
                  ราคาบัตร: <span className="text-brand-300">{formatPrice(event.price)}</span> / ท่าน
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Ticket Quantity Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  จำนวนบัตร (สูงสุด {maxAvailable} ใบ)
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800 border border-purple-500/20">
                  <span className="text-sm font-semibold text-white font-['Kanit']">
                    จำนวน {ticketCount} ที่นั่ง
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      disabled={ticketCount <= 1}
                      className="w-8 h-8 rounded-lg bg-dark-700 border border-slate-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-purple-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-base text-purple-300 w-4 text-center">
                      {ticketCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTicketCount(Math.min(maxAvailable, ticketCount + 1))}
                      disabled={ticketCount >= maxAvailable}
                      className="w-8 h-8 rounded-lg bg-dark-700 border border-slate-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-purple-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendee Info Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อ-นามสกุล ผู้จอง <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      อีเมล (สำหรับรับตั๋ว E-Ticket) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      เบอร์โทรศัพท์ <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="p-3.5 rounded-xl bg-dark-900 border border-purple-500/20 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>ราคาบัตร ({ticketCount} ใบ)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ค่าบริการระบบ</span>
                  <span className="text-emerald-400 font-medium">฿0 (ฟรี)</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white font-['Kanit']">
                  <span>ยอดชำระสุทธิ:</span>
                  <span className="text-base text-brand-300">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || maxAvailable <= 0}
                className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>กำลังดำเนินการจอง...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ยืนยันการจองบัตร ({formatPrice(totalPrice)})</span>
                  </>
                )}
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
