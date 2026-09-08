'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { TicketPass } from '@/components/TicketPass';
import { 
  Ticket, 
  Sparkles, 
  Calendar, 
  Compass, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function MyBookingsPage() {
  const { getUserBookings, cancelBooking, currentUser } = useApp();
  const bookings = getUserBookings();

  const [activeTab, setActiveTab] = useState<'active' | 'cancelled'>('active');
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const displayedBookings = activeTab === 'active' ? activeBookings : cancelledBookings;

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    await cancelBooking(cancellingBooking.id);
    setCancellingBooking(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-300 border border-pink-500/20">
            <Ticket className="w-3.5 h-3.5" />
            <span>บัตรและประวัติการจอง</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Kanit']">
            การจองของฉัน (My Tickets)
          </h1>
          <p className="text-xs text-slate-400">
            ดูบัตร E-Ticket, สแกน QR Code เพื่อเข้างาน หรือจัดการยกเลิกการจอง
          </p>
        </div>

        <Link
          href="/events"
          className="btn-primary text-xs px-4 py-2.5 rounded-full font-semibold flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-glow"
        >
          <Compass className="w-4 h-4" />
          <span>ค้นหากิจกรรมเพิ่ม</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-500/15 pb-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 font-['Kanit'] ${
            activeTab === 'active'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-dark-800'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>บัตรที่ใช้งานได้ ({activeBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 font-['Kanit'] ${
            activeTab === 'cancelled'
              ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-dark-800'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>ยกเลิกแล้ว ({cancelledBookings.length})</span>
        </button>
      </div>

      {/* Bookings List */}
      {displayedBookings.length > 0 ? (
        <div className="space-y-6">
          {displayedBookings.map((booking) => (
            <TicketPass
              key={booking.id}
              booking={booking}
              onCancel={() => setCancellingBooking(booking)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-850/60 rounded-3xl border border-purple-500/20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Kanit']">
            {activeTab === 'active'
              ? 'คุณยังไม่มีบัตรกิจกรรมที่กำลังจะมาถึง'
              : 'ไม่มีประวัติการยกเลิกบัตร'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ค้นหากิจกรรมที่คุณสนใจ สัมมนา เวิร์กช็อป หรือคอนเสิร์ต แล้วกดจองเพื่อรับบัตร E-Ticket ทันที
          </p>
          <Link
            href="/events"
            className="btn-primary px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-glow"
          >
            <span>สำรวจกิจกรรมทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-dark-850 border border-rose-500/30 p-6 rounded-3xl space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white font-['Kanit']">
                ยืนยันการยกเลิกการจอง?
              </h3>
              <p className="text-xs text-slate-300">
                รหัสบัตร: <strong className="text-brand-300 font-mono">{cancellingBooking.ticket_code}</strong>
                <br />
                ระบบจะยกเลิกตั๋วและคืนโควต้าที่นั่งให้แก่ผู้อื่นโดยอัตโนมัติ
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="flex-1 btn-secondary py-2.5 rounded-xl text-xs font-semibold"
              >
                ไม่ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                ยืนยันยกเลิกบัตร
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
