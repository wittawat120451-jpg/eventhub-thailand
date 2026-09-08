'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatThaiDate, formatPrice } from '@/lib/utils';
import { 
  ShieldCheck, 
  PlusCircle, 
  Calendar, 
  Users, 
  Ticket, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye, 
  RotateCcw, 
  Search,
  ExternalLink,
  AlertTriangle,
  X,
  CheckCircle,
  Database
} from 'lucide-react';
import { EventItem } from '@/lib/types';

export default function AdminDashboardPage() {
  const { events, bookings, deleteEvent, resetToSampleData, isSupabaseMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState<EventItem | null>(null);

  // Calculate Metrics
  const totalEvents = events.length;
  const totalBookings = bookings.length;
  const totalBookedSeats = events.reduce((sum, e) => sum + e.booked_seats, 0);
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.total_price, 0);

  // Filter events
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Attendee bookings for modal
  const eventAttendees = viewingAttendeesEvent
    ? bookings.filter((b) => b.event_id === viewingAttendeesEvent.id)
    : [];

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    await deleteEvent(deletingEvent.id);
    setDeletingEvent(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Management Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Kanit']">
            แผงควบคุมระบบผู้จัดงาน
          </h1>
          <p className="text-xs text-slate-400">
            จัดการกิจกรรม ตรวจสอบยอดการจอง รายชื่อผู้เข้าร่วม และรายงานสถิติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={resetToSampleData}
            className="btn-secondary text-xs px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-1.5"
            title="รีเซ็ตกลับเป็นข้อมูลตัวอย่างเริ่มต้น 6 กิจกรรม"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>รีเซ็ตข้อมูลตัวอย่าง</span>
          </button>

          <Link
            href="/admin/new"
            className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-glow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>สร้างกิจกรรมใหม่</span>
          </Link>
        </div>
      </div>

      {/* Database Mode Banner */}
      <div className="p-4 rounded-2xl bg-dark-850 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-white">
              สถานะฐานข้อมูล: <span className={isSupabaseMode ? 'text-emerald-400' : 'text-purple-300'}>
                {isSupabaseMode ? 'เชื่อมต่อ Supabase Live Database' : 'โหมดสาธิต (Local Storage Demo Mode)'}
              </span>
            </p>
            <p className="text-slate-400 text-[11px]">
              {isSupabaseMode 
                ? 'ข้อมูลการสร้าง แก้ไข ลบ และการจองจะซิงค์ไปยังตาราง Supabase ของคุณโดยตรง' 
                : 'ข้อมูลจะถูกบันทึกและซิงค์ผ่านเบราว์เซอร์ พร้อมสคริปต์ supabase/schema.sql สำหรับ Deploy ใช้งานจริง'}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>กิจกรรมทั้งหมด</span>
            <Calendar className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-['Kanit']">{totalEvents}</p>
          <p className="text-[11px] text-brand-300">พร้อมเปิดรับสมัคร</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ยอดการจองบัตร (ใบ)</span>
            <Ticket className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-['Kanit']">{totalBookings}</p>
          <p className="text-[11px] text-pink-300">รายการสั่งซื้อ/ลงทะเบียน</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ผู้เข้าร่วมทั้งหมด</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-['Kanit']">{totalBookedSeats} ที่นั่ง</p>
          <p className="text-[11px] text-cyan-300">คิดเป็นยอดที่นั่งที่ถูกจอง</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ยอดเงินโดยประมาณ</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-['Kanit']">{formatPrice(totalRevenue)}</p>
          <p className="text-[11px] text-emerald-400">จากยอดบัตรที่มีค่าใช้จ่าย</p>
        </div>

      </div>

      {/* Events Table Container */}
      <div className="glass-panel rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
        
        {/* Table Header Bar */}
        <div className="p-5 border-b border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-['Kanit']">รายการกิจกรรมทั้งหมด</h2>
            <p className="text-xs text-slate-400">คลิกดูรายชื่อผู้ลงทะเบียน แก้ไข หรือลบกิจกรรม</p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อกิจกรรม..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-purple-500/15">
              <tr>
                <th className="p-4">กิจกรรม</th>
                <th className="p-4">หมวดหมู่</th>
                <th className="p-4">วันที่จัด</th>
                <th className="p-4">ราคา</th>
                <th className="p-4">จำนวนที่นั่ง</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredEvents.map((ev) => {
                const seatsLeft = Math.max(0, ev.max_seats - ev.booked_seats);
                const percentBooked = Math.round((ev.booked_seats / ev.max_seats) * 100);

                return (
                  <tr key={ev.id} className="hover:bg-purple-950/20 transition-colors">
                    
                    {/* Event thumbnail & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ev.image_url}
                          alt={ev.title}
                          className="w-12 h-12 rounded-xl object-cover border border-purple-500/20 shrink-0"
                        />
                        <div className="max-w-xs space-y-0.5">
                          <p className="font-bold text-white text-sm font-['Kanit'] line-clamp-1">
                            {ev.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{ev.location}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {ev.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 font-medium text-white">
                      {formatThaiDate(ev.date)}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-bold text-white font-['Kanit']">
                      {formatPrice(ev.price)}
                    </td>

                    {/* Seats status */}
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {ev.booked_seats} / {ev.max_seats}
                        </span>
                        <span className="text-[10px] text-slate-400">({percentBooked}%)</span>
                      </div>
                      <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            seatsLeft <= 0 ? 'bg-rose-500' : 'bg-gradient-to-r from-brand-500 to-cyan-400'
                          }`}
                          style={{ width: `${percentBooked}%` }}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Attendees */}
                        <button
                          type="button"
                          onClick={() => setViewingAttendeesEvent(ev)}
                          className="p-2 rounded-lg bg-dark-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 border border-slate-700/50 transition-colors"
                          title="ดูรายชื่อผู้ลงทะเบียน"
                        >
                          <Users className="w-4 h-4" />
                        </button>

                        {/* View Live */}
                        <Link
                          href={`/events/${ev.id}`}
                          className="p-2 rounded-lg bg-dark-800 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-slate-700/50 transition-colors"
                          title="ดูหน้ากิจกรรมจริง"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/admin/edit/${ev.id}`}
                          className="p-2 rounded-lg bg-dark-800 hover:bg-amber-600/20 text-slate-300 hover:text-amber-300 border border-slate-700/50 transition-colors"
                          title="แก้ไขกิจกรรม"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeletingEvent(ev)}
                          className="p-2 rounded-lg bg-dark-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-700/50 transition-colors"
                          title="ลบกิจกรรม"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: View Attendees */}
      {viewingAttendeesEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-dark-850 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
                  รายชื่อผู้ลงทะเบียน (Attendees)
                </span>
                <h3 className="text-lg font-bold text-white font-['Kanit'] mt-1">
                  {viewingAttendeesEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingAttendeesEvent(null)}
                className="p-2 rounded-full bg-dark-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {eventAttendees.length > 0 ? (
                eventAttendees.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-2xl bg-dark-900/80 border border-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-white text-sm font-['Kanit']">{bk.user_name}</p>
                      <p className="text-slate-400">{bk.user_email} • {bk.user_phone}</p>
                      <p className="text-[11px] font-mono text-brand-300">รหัสบัตร: {bk.ticket_code}</p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        bk.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {bk.status === 'confirmed' ? '✓ จองสำเร็จ' : '✗ ยกเลิกแล้ว'}
                      </span>
                      <span className="text-slate-300 font-medium">
                        จำนวน {bk.ticket_count} ใบ ({formatPrice(bk.total_price)})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  ยังไม่มีผู้ลงทะเบียนในกิจกรรมนี้
                </div>
              )}
            </div>

            <div className="p-4 bg-dark-900/60 border-t border-purple-500/15 text-right">
              <button
                type="button"
                onClick={() => setViewingAttendeesEvent(null)}
                className="btn-secondary px-5 py-2 rounded-xl text-xs font-semibold"
              >
                ปิด
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-dark-850 border border-rose-500/30 p-6 rounded-3xl space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white font-['Kanit']">
                ยืนยันการลบกิจกรรม?
              </h3>
              <p className="text-xs text-slate-300">
                คุณกำลังจะลบ: <strong className="text-white">&quot;{deletingEvent.title}&quot;</strong>
                <br />
                กิจกรรมและข้อมูลการจองที่เกี่ยวข้องทั้งหมดจะถูกลบออกจากระบบ
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                className="flex-1 btn-secondary py-2.5 rounded-xl text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                ลบกิจกรรมทันที
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
