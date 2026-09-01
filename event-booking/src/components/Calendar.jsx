/**
 * ==============================================================================
 * ไฟล์: src/components/Calendar.jsx
 * หน้าที่: คอมโพเนนต์แสดงปฏิทินรายเดือน ตรวจสอบวันว่าง/วันที่มีการจอง พร้อม Interactive Grid
 * คำอธิบายสำหรับนักเรียน:
 *   - ใช้ JavaScript Date Object คำนวณวันแรกของเดือนและจำนวนวันทั้งหมดในแต่ละเดือน
 *   - แสดงผลแบบ Grid 7 คอลัมน์ (อาทิตย์ - เสาร์)
 *   - ตรวจสอบสถานะของแต่ละวัน:
 *       1. วันที่ผ่านมาแล้ว (Past) -> สีเทา, Disable
 *       2. วันที่มีการจอง (Booked) -> สีแดง/ชมพู, แสดงชื่อกิจกรรม
 *       3. วันว่าง (Available) -> สีเขียว, สามารถคลิกเพื่อจองได้
 * ==============================================================================
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { formatDateKey, formatThaiDate, isPastDate } from '../utils/localStorage';

export default function Calendar({ 
  bookings = [], 
  onSelectDate, 
  onViewBookingDetails 
}) {
  // State สำหรับเก็บปีและเดือนที่กำลังดูอยู่ในปฏิทิน (เดือน 0 = มกราคม, 11 = ธันวาคม)
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // รายชื่อวันในสัปดาห์
  const weekdaysThai = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  
  // รายชื่อเดือนภาษาไทย
  const monthsThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  /**
   * คำนวณตารางวันของเดือนปัจจุบัน (Calendar Grid Matrix)
   * ใช้ useMemo เพื่อไม่ให้คำนวณซ้ำถ้าเดือนและรายการจองไม่ได้เปลี่ยน
   */
  const calendarGrid = useMemo(() => {
    // หาวันแรกของเดือน (0 = วันอาทิตย์, 6 = วันเสาร์)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // หาจำนวนวันทั้งหมดในเดือนนี้
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // หาจำนวนวันในเดือนก่อนหน้า สำหรับเติมช่องว่างด้านหน้า
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const grid = [];
    const todayStr = formatDateKey(new Date());

    // 1. เติมวันของเดือนก่อนหน้า (Leading empty days)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dateKey = formatDateKey(prevDate);
      grid.push({
        dayNumber: dayNum,
        dateKey,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
        bookings: []
      });
    }

    // 2. เติมวันของเดือนปัจจุบัน
    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(currentYear, currentMonth, day);
      const dateKey = formatDateKey(thisDate);
      const dayBookings = bookings.filter((b) => b.date === dateKey);
      const isPast = isPastDate(dateKey);
      const isToday = dateKey === todayStr;

      grid.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: true,
        isPast,
        isToday,
        bookings: dayBookings,
        isBooked: dayBookings.length > 0
      });
    }

    // 3. เติมวันของเดือนถัดไปให้ครบสัปดาห์ (Trailing days)
    const totalCells = Math.ceil(grid.length / 7) * 7;
    const remainingCells = totalCells - grid.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      const dateKey = formatDateKey(nextDate);
      grid.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: false,
        isPast: false,
        isToday: false,
        bookings: []
      });
    }

    return grid;
  }, [currentYear, currentMonth, bookings]);

  // ฟังก์ชันเลื่อนไปยังเดือนก่อนหน้า
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // ฟังก์ชันเลื่อนไปยังเดือนถัดไป
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // ฟังก์ชันกลับมายังเดือนปัจจุบัน
  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // สรุปสถิติของเดือนที่กำลังเปิดดู
  const currentMonthStats = useMemo(() => {
    const currentMonthDays = calendarGrid.filter(cell => cell.isCurrentMonth);
    const bookedDays = currentMonthDays.filter(cell => cell.isBooked).length;
    const availableDays = currentMonthDays.filter(cell => !cell.isBooked && !cell.isPast).length;
    const pastDays = currentMonthDays.filter(cell => cell.isPast).length;

    return { total: currentMonthDays.length, bookedDays, availableDays, pastDays };
  }, [calendarGrid]);

  return (
    <div className="calendar-card">
      {/* ส่วนหัวปฏิทิน: เปลี่ยนเดือน, แสดงชื่อเดือนภาษาไทย และสถิติด่วน */}
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <CalIcon size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0 }}>
              {monthsThai[currentMonth]} {currentYear + 543}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ปุ่มควบคุมการเปลี่ยนเดือน */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={handleGoToday} 
            className="btn btn-secondary btn-sm"
            title="กลับไปที่เดือนปัจจุบัน"
          >
            วันนี้
          </button>
          
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button 
              onClick={handlePrevMonth} 
              className="btn btn-sm" 
              style={{ padding: '0.45rem 0.6rem' }}
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNextMonth} 
              className="btn btn-sm" 
              style={{ padding: '0.45rem 0.6rem' }}
              title="เดือนถัดไป"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* แถบคำอธิบายสัญลักษณ์สี (Legend) และ สถิติเดือนนี้ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem'
      }}>
        {/* สัญลักษณ์สี */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 500, color: '#065F46' }}>สีเขียว = วันว่าง (คลิกจองได้)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 500, color: '#991B1B' }}>สีแดง = ถูกจองแล้ว</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#94A3B8', display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-muted)' }}>สีเทา = วันที่ผ่านมาแล้ว</span>
          </div>
        </div>

        {/* สรุปจำนวนวัน */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
          <span className="badge badge-success">ว่าง {currentMonthStats.availableDays} วัน</span>
          <span className="badge badge-danger">จองแล้ว {currentMonthStats.bookedDays} วัน</span>
        </div>
      </div>

      {/* แถบหัวตาราง: วันในสัปดาห์ (อาทิตย์ - เสาร์) */}
      <div className="calendar-weekdays">
        {weekdaysThai.map((day, idx) => (
          <div 
            key={day} 
            style={{ 
              color: idx === 0 ? '#EF4444' : idx === 6 ? '#8B5CF6' : 'var(--text-secondary)' 
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* ตารางแสดงช่องวันที่ในเดือน (Days Grid) */}
      <div className="calendar-days-grid">
        {calendarGrid.map((cell, index) => {
          // วันของเดือนอื่น
          if (!cell.isCurrentMonth) {
            return (
              <div key={index} className="calendar-day-cell day-other-month">
                <span className="day-number" style={{ color: '#CBD5E1' }}>{cell.dayNumber}</span>
              </div>
            );
          }

          // วันที่ผ่านมาแล้ว (Past Date)
          if (cell.isPast) {
            return (
              <div 
                key={index} 
                className={`calendar-day-cell day-past ${cell.isToday ? 'day-today' : ''}`}
                title="วันที่ผ่านมาแล้ว ไม่สามารถจองย้อนหลังได้"
              >
                <div className="day-number">
                  <span>{cell.dayNumber}</span>
                  {cell.isToday && <span className="day-today-badge">วันนี้</span>}
                </div>
                
                {cell.bookings.length > 0 ? (
                  <div className="day-status-pill booked" style={{ opacity: 0.7 }}>
                    🔒 {cell.bookings[0].title}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 'auto' }}>
                    ผ่านมาแล้ว
                  </div>
                )}
              </div>
            );
          }

          // วันที่มีการจองแล้ว (Booked Date)
          if (cell.isBooked) {
            const booking = cell.bookings[0];
            return (
              <div
                key={index}
                className={`calendar-day-cell day-booked ${cell.isToday ? 'day-today' : ''}`}
                onClick={() => onViewBookingDetails && onViewBookingDetails(booking)}
                title={`จองแล้ว: ${booking.title} (คลิกดูรายละเอียด)`}
              >
                <div className="day-number">
                  <span>{cell.dayNumber}</span>
                  {cell.isToday && <span className="day-today-badge">วันนี้</span>}
                </div>

                <div className="day-status-pill booked">
                  <span style={{ fontWeight: 600 }}>🔴 {booking.title}</span>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '3px', marginTop: 'auto' }}>
                  <User size={11} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {booking.bookerName}
                  </span>
                </div>
              </div>
            );
          }

          // วันว่าง (Available Date) -> สีเขียว สามารถคลิกเพื่อจองได้
          return (
            <div
              key={index}
              className={`calendar-day-cell day-available ${cell.isToday ? 'day-today' : ''}`}
              onClick={() => onSelectDate && onSelectDate(cell.dateKey)}
              title={`วันที่ว่าง: ${formatThaiDate(cell.dateKey)} (คลิกเพื่อจองกิจกรรม)`}
            >
              <div className="day-number">
                <span>{cell.dayNumber}</span>
                {cell.isToday && <span className="day-today-badge">วันนี้</span>}
              </div>

              <div className="day-status-pill available">
                🟢 ว่าง จองได้
              </div>

              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--success)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '2px', 
                fontWeight: 500,
                marginTop: 'auto' 
              }}>
                <Plus size={13} />
                <span>คลิกจอง</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
