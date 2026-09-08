'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking, EventItem } from '@/lib/types';
import { formatThaiDateFull, formatPrice } from '@/lib/utils';
import { Calendar, MapPin, User, Ticket, Clock, CheckCircle, XCircle, Printer } from 'lucide-react';

interface TicketPassProps {
  booking: Booking;
  event?: EventItem;
  onCancel?: () => void;
}

export const TicketPass: React.FC<TicketPassProps> = ({ booking, event, onCancel }) => {
  const currentEvent = event || booking.event;
  const isCancelled = booking.status === 'cancelled';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border ${
      isCancelled 
        ? 'border-red-500/30 bg-dark-850 opacity-75' 
        : 'border-purple-500/30 bg-gradient-to-br from-dark-850 via-dark-800 to-dark-850 shadow-glass'
    }`}>
      
      {/* Top Header Badge */}
      <div className={`px-6 py-4 flex items-center justify-between border-b ${
        isCancelled 
          ? 'bg-rose-950/40 border-rose-900/40' 
          : 'bg-gradient-to-r from-brand-900/60 to-indigo-900/60 border-purple-500/20'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Ticket className="w-4 h-4 text-brand-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-300 block">
              Official E-Ticket
            </span>
            <span className="text-xs font-mono font-bold text-white tracking-widest">
              {booking.ticket_code}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isCancelled ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              ยกเลิกแล้ว
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              ยืนยันแล้ว
            </span>
          )}
        </div>
      </div>

      {/* Main Ticket Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Event Details (Left 2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wide">
              {currentEvent?.category || 'กิจกรรม'}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-white font-['Kanit'] leading-snug">
              {currentEvent?.title || 'Event Pass'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Date & Time */}
            <div className="p-2.5 rounded-xl bg-dark-900/60 border border-purple-500/15 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>วันที่จัดงาน</span>
              </div>
              <p className="font-semibold text-white">
                {currentEvent ? formatThaiDateFull(currentEvent.date) : '-'}
              </p>
            </div>

            {/* Time */}
            <div className="p-2.5 rounded-xl bg-dark-900/60 border border-purple-500/15 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>เวลา</span>
              </div>
              <p className="font-semibold text-white">
                {currentEvent?.time || '-'}
              </p>
            </div>

            {/* Attendee Info */}
            <div className="p-2.5 rounded-xl bg-dark-900/60 border border-purple-500/15 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5 text-pink-400" />
                <span>ผู้ถือบัตร ({booking.ticket_count} ที่นั่ง)</span>
              </div>
              <p className="font-semibold text-white truncate">
                {booking.user_name}
              </p>
            </div>

            {/* Venue Location */}
            <div className="p-2.5 rounded-xl bg-dark-900/60 border border-purple-500/15 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>สถานที่</span>
              </div>
              <p className="font-semibold text-white truncate">
                {currentEvent?.location || '-'}
              </p>
            </div>

          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>จองเมื่อ: {new Date(booking.created_at).toLocaleDateString('th-TH')}</span>
            <span className="font-semibold text-white font-['Kanit']">
              ยอดชำระ: <strong className="text-brand-300">{formatPrice(booking.total_price)}</strong>
            </span>
          </div>
        </div>

        {/* QR Code Pass (Right 1 col) */}
        <div className="flex flex-col items-center justify-center p-4 bg-dark-900/80 rounded-2xl border border-purple-500/20 text-center space-y-3">
          <div className="p-3 bg-white rounded-xl shadow-lg">
            <QRCodeSVG
              value={`EVENTHUB-TICKET:${booking.ticket_code}:${booking.id}:${booking.user_email}`}
              size={120}
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400">สแกน QR Code เพื่อเช็คอินเข้างาน</p>
            <p className="font-mono text-xs font-bold text-brand-300 tracking-wider">
              {booking.ticket_code}
            </p>
          </div>
        </div>

      </div>

      {/* Ticket Footer Action Bar */}
      <div className="px-6 py-3.5 bg-dark-900/90 border-t border-purple-500/15 flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={handlePrint}
          className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-4 h-4 text-purple-400" />
          <span>พิมพ์บัตร (Print / PDF)</span>
        </button>

        {!isCancelled && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-rose-400 hover:text-rose-300 hover:underline font-medium transition-colors"
          >
            ยกเลิกการจองนี้
          </button>
        )}
      </div>

    </div>
  );
};
