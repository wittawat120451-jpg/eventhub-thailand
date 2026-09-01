/**
 * ==============================================================================
 * ไฟล์: src/pages/CalendarPage.jsx
 * หน้าที่: หน้าปฏิทินจองวัน (Calendar View Page) พร้อม Modal ฟอร์มจองและดูรายละเอียด
 * คำอธิบายสำหรับนักเรียน:
 *   - ควบคุมการเปิด/ปิด Pop-up Modal ด้วย State `isBookingModalOpen`
 *   - รับข้อมูลการจองใหม่แล้วอัปเดต State `bookings` ทำให้ปฏิทินเปลี่ยนสีทันที (Re-render)
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import BookingForm from '../components/BookingForm';
import Toast from '../components/Toast';
import { 
  PlusCircle, 
  Calendar as CalIcon, 
  Info, 
  CheckCircle2, 
  X, 
  FileText, 
  Clock, 
  User, 
  Phone, 
  Users 
} from 'lucide-react';
import { 
  getBookings, 
  fetchBookingsFromCloud,
  formatThaiDate, 
  formatDateKey, 
  EVENT_CATEGORIES, 
  TIME_SLOTS 
} from '../utils/localStorage';

export default function CalendarPage({ onBookingListChange }) {
  // State รายการจองทั้งหมด
  const [bookings, setBookings] = useState(getBookings());
  
  // State สำหรับ Modal จองกิจกรรม
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDateForBooking, setSelectedDateForBooking] = useState('');

  // State สำหรับ Modal ดูรายละเอียดการจองเมื่อคลิกวันที่ถูกจองแล้ว
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  // State สำหรับ Toast แจ้งเตือน
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // โหลดรายการจองจาก Supabase Cloud (พร้อม fallback เป็น localStorage)
  const loadBookings = async () => {
    const res = await fetchBookingsFromCloud();
    setBookings(res.data);
    if (onBookingListChange) onBookingListChange(res.data.length);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // เมื่อผู้ใช้คลิกเลือก "วันว่าง" ในปฏิทิน
  const handleSelectDate = (dateKey) => {
    setSelectedDateForBooking(dateKey);
    setIsBookingModalOpen(true);
  };

  // เมื่อผู้ใช้คลิก "วันที่ถูกจองแล้ว" เพื่อดูรายละเอียด
  const handleViewBookingDetails = (booking) => {
    setSelectedBookingDetail(booking);
  };

  // เมื่อบันทึกการจองสำเร็จ
  const handleBookingSuccess = (message, newBooking) => {
    loadBookings(); // โหลดข้อมูลใหม่เพื่อให้ปฏิทินอัปเดตสีทันที
    setToast({
      message: `🎉 ${message} ("${newBooking.title}" วันที่ ${formatThaiDate(newBooking.date)})`,
      type: 'success'
    });
  };

  // หาหมวดหมู่สำหรับแสดงผล
  const getCategoryInfo = (catId) => {
    return EVENT_CATEGORIES.find((c) => c.id === catId) || { label: 'ทั่วไป', color: '#6B7280', bg: '#F3F4F6' };
  };

  // หาข้อความช่วงเวลา
  const getTimeSlotLabel = (slotId, customTime) => {
    if (slotId === 'custom' && customTime) return `กำหนดเอง: ${customTime}`;
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    return slot ? slot.label : slotId;
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* หัวข้อหน้าปฏิทิน */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
              <CalIcon size={14} />
              <span>ปฏิทินจองวันจัดกิจกรรม</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
              ปฏิทินตรวจสอบวันว่าง & จองกิจกรรม
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              คลิกที่ช่อง <strong style={{ color: 'var(--success)' }}>วันว่าง (สีเขียว)</strong> เพื่อเปิดแบบฟอร์มจองได้ทันที
            </p>
          </div>

          {/* ปุ่มเปิดฟอร์มจองแบบกำหนดวันเอง */}
          <button 
            onClick={() => {
              setSelectedDateForBooking(formatDateKey(new Date()));
              setIsBookingModalOpen(true);
            }} 
            className="btn btn-primary btn-lg"
          >
            <PlusCircle size={20} />
            <span>+ จองกิจกรรมใหม่</span>
          </button>
        </div>

        {/* คอมโพเนนต์ปฏิทิน */}
        <Calendar 
          bookings={bookings}
          onSelectDate={handleSelectDate}
          onViewBookingDetails={handleViewBookingDetails}
        />

        {/* Modal ฟอร์มจองกิจกรรม */}
        <BookingForm 
          isOpen={isBookingModalOpen}
          initialDate={selectedDateForBooking}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />

        {/* Modal ดูรายละเอียดกิจกรรมที่ถูกจองแล้ว */}
        {selectedBookingDetail && (
          <div className="modal-overlay" onClick={() => setSelectedBookingDetail(null)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CalIcon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>รายละเอียดวันที่ถูกจองแล้ว</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      ข้อมูลการจัดงานในวันที่ {formatThaiDate(selectedBookingDetail.date)}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedBookingDetail(null)} 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px', borderRadius: '50%' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ marginBottom: '1.25rem' }}>
                  <span 
                    className="badge" 
                    style={{ 
                      background: getCategoryInfo(selectedBookingDetail.category).bg, 
                      color: getCategoryInfo(selectedBookingDetail.category).color,
                      marginBottom: '0.5rem'
                    }}
                  >
                    {getCategoryInfo(selectedBookingDetail.category).label}
                  </span>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                    {selectedBookingDetail.title}
                  </h2>
                </div>

                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>วันที่จัดงาน</div>
                    <strong style={{ color: 'var(--danger)', fontSize: '1rem' }}>
                      📅 {formatThaiDate(selectedBookingDetail.date)}
                    </strong>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ช่วงเวลา</div>
                    <strong>⏰ {getTimeSlotLabel(selectedBookingDetail.timeSlot, selectedBookingDetail.customTime)}</strong>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ผู้จอง</div>
                    <strong>👤 {selectedBookingDetail.bookerName}</strong>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>เบอร์โทรศัพท์</div>
                    <strong>📞 {selectedBookingDetail.phone}</strong>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ผู้เข้าร่วมประมาณ</div>
                    <strong>👥 {selectedBookingDetail.guestsCount || '-'} คน</strong>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>สถานะ</div>
                    <span className="badge badge-danger">🔒 ถูกจองแล้ว</span>
                  </div>
                </div>

                {selectedBookingDetail.description && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>รายละเอียดเพิ่มเติม:</h4>
                    <p style={{
                      fontSize: '0.88rem',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-light)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {selectedBookingDetail.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  onClick={() => setSelectedBookingDetail(null)} 
                  className="btn btn-primary"
                >
                  เข้าใจแล้ว
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast แจ้งเตือน */}
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      </div>
    </div>
  );
}
