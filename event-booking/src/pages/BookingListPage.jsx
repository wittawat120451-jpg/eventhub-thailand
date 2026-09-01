/**
 * ==============================================================================
 * ไฟล์: src/pages/BookingListPage.jsx
 * หน้าที่: หน้ารายการจองทั้งหมด (Booking List Page) พร้อมการค้นหา กรองข้อมูล และยกเลิกการจอง
 * คำอธิบายสำหรับนักเรียน:
 *   - รวมคอมโพเนนต์ `BookingList` และฟอร์มจอง `BookingForm` เข้าด้วยกัน
 *   - เมื่อมีการลบข้อมูล จะเรียก `deleteBooking(id)` ใน `localStorage.js` และโหลดข้อมูลใหม่
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import BookingList from '../components/BookingList';
import BookingForm from '../components/BookingForm';
import Toast from '../components/Toast';
import { ListOrdered, PlusCircle, Calendar as CalIcon } from 'lucide-react';
import { getBookings, fetchBookingsFromCloud, deleteBooking, formatDateKey } from '../utils/localStorage';

export default function BookingListPage({ onBookingListChange }) {
  // State รายการจองทั้งหมด
  const [bookings, setBookings] = useState(getBookings());
  
  // State สำหรับ Modal เพิ่มการจองใหม่
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State สำหรับ Toast แจ้งเตือน
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // ฟังก์ชันโหลดข้อมูลการจองล่าสุดจาก Supabase Cloud + LocalStorage
  const loadBookings = async () => {
    const res = await fetchBookingsFromCloud();
    setBookings(res.data);
    if (onBookingListChange) onBookingListChange(res.data.length);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ฟังก์ชันจัดการการยกเลิก / ลบการจอง
  const handleDeleteBooking = async (bookingId) => {
    const success = await deleteBooking(bookingId);
    if (success) {
      await loadBookings();
      setToast({
        message: '🗑️ ยกเลิกรายการจองกิจกรรมเรียบร้อยแล้ว',
        type: 'success'
      });
    } else {
      setToast({
        message: '❌ ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง',
        type: 'error'
      });
    }
  };

  // ฟังก์ชันเมื่อเพิ่มการจองใหม่สำเร็จ
  const handleBookingSuccess = async (message, newBooking) => {
    await loadBookings();
    setToast({
      message: `🎉 ${message} ("${newBooking.title}")`,
      type: 'success'
    });
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* ส่วนหัวของหน้า */}
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
              <ListOrdered size={14} />
              <span>รายการการจองทั้งหมด</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
              จัดการและตรวจสอบรายการจอง
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              ค้นหา ตรวจสอบรายละเอียด และจัดการยกเลิกรายการจองในระบบ
            </p>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="btn btn-primary btn-lg"
          >
            <PlusCircle size={20} />
            <span>+ จองกิจกรรมใหม่</span>
          </button>
        </div>

        {/* คอมโพเนนต์รายการจอง */}
        <BookingList 
          bookings={bookings}
          onDeleteBooking={handleDeleteBooking}
          onAddNewBooking={() => setIsAddModalOpen(true)}
        />

        {/* Modal ฟอร์มจองกิจกรรม */}
        <BookingForm 
          isOpen={isAddModalOpen}
          initialDate={formatDateKey(new Date())}
          onClose={() => setIsAddModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />

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
