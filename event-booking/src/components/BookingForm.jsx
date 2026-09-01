/**
 * ==============================================================================
 * ไฟล์: src/components/BookingForm.jsx
 * หน้าที่: ฟอร์มกรอกข้อมูลเพื่อจองวันกิจกรรม/อีเวนต์ (Modal Window)
 * คำอธิบายสำหรับนักเรียน:
 *   - จัดการ State ของฟอร์มด้วย `useState`
 *   - มีการตรวจสอบความถูกต้องของข้อมูล (Form Validation) ก่อนบันทึกลง localStorage
 *   - ตรวจสอบห้ามจองย้อนหลัง และ ห้ามจองซ้ำวัน/เวลาที่มีผู้อื่นจองแล้ว
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalIcon, 
  Clock, 
  User, 
  Phone, 
  Tag, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  saveBooking, 
  isPastDate, 
  isDateBooked, 
  formatThaiDate, 
  EVENT_CATEGORIES, 
  TIME_SLOTS 
} from '../utils/localStorage';

export default function BookingForm({ 
  initialDate, 
  isOpen, 
  onClose, 
  onBookingSuccess 
}) {
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    title: '',
    bookerName: '',
    phone: '',
    date: initialDate || '',
    timeSlot: 'all-day',
    customStartTime: '09:00',
    customEndTime: '16:00',
    category: 'seminar',
    guestsCount: 50,
    description: ''
  });

  // State สำหรับข้อความแจ้งเตือนความผิดพลาดในฟอร์ม (Validation Error)
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // อัปเดตวันที่ในฟอร์มเมื่อ prop `initialDate` เปลี่ยนแปลง
  useEffect(() => {
    if (initialDate) {
      setFormData((prev) => ({ ...prev, date: initialDate }));
      setErrorMessage('');
    }
  }, [initialDate]);

  if (!isOpen) return null;

  // ฟังก์ชันอัปเดตข้อมูล State เมื่อผู้ใช้พิมพ์หรือเลือก
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // เคลียร์ error เมื่อผู้ใช้เริ่มแก้ไข
    if (errorMessage) setErrorMessage('');
  };

  // ฟังก์ชันจัดการการ Submit ฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // 1. ตรวจสอบฟิลด์บังคับ
    if (!formData.title.trim()) {
      setErrorMessage('กรุณากรอกชื่อกิจกรรม/งานอีเวนต์');
      setIsSubmitting(false);
      return;
    }
    if (!formData.bookerName.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้จอง');
      setIsSubmitting(false);
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('กรุณากรอกเบอร์โทรศัพท์ติดต่อ');
      setIsSubmitting(false);
      return;
    }
    if (!formData.date) {
      setErrorMessage('กรุณาเลือกวันที่ต้องการจอง');
      setIsSubmitting(false);
      return;
    }

    // 2. ตรวจสอบห้ามจองวันที่ผ่านมาแล้ว
    if (isPastDate(formData.date)) {
      setErrorMessage('❌ ไม่สามารถจองวันที่ผ่านมาแล้วได้ กรุณาเลือกวันปัจจุบันหรืออนาคต');
      setIsSubmitting(false);
      return;
    }

    // 3. ตรวจสอบการจองซ้ำ (Double booking check)
    const conflict = isDateBooked(formData.date, formData.timeSlot);
    if (conflict) {
      setErrorMessage(`❌ วันที่ ${formatThaiDate(formData.date)} ในช่วงเวลานี้ถูกจองไปแล้วโดย "${conflict.title}"`);
      setIsSubmitting(false);
      return;
    }

    // รวมข้อมูลเวลากรณีเลือก "ระบุเวลาเอง"
    const bookingPayload = {
      ...formData,
      customTime: formData.timeSlot === 'custom' 
        ? `${formData.customStartTime} - ${formData.customEndTime} น.` 
        : ''
    };

    // บันทึกลง Supabase Cloud + LocalStorage
    const result = await saveBooking(bookingPayload);

    if (result.success) {
      // เอฟเฟกต์พลุเฉลิมฉลองเมื่อจองสำเร็จ
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // canvas-confetti fallback
      }

      // รีเซ็ตฟอร์มและแจ้ง Component แม่
      onBookingSuccess(result.message, result.data);
      onClose();
    } else {
      setErrorMessage(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} // ป้องกันการคลิกข้างในแล้ว Modal ปิด
      >
        {/* หัวข้อ Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <CalIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>แบบฟอร์มจองวันกิจกรรม</h3>
              <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)' }}>
                กรอกข้อมูลรายละเอียดเพื่อบันทึกการจองเข้าสู่ระบบ
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
            title="ปิดหน้าต่าง"
          >
            <X size={18} />
          </button>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* กล่องแสดงข้อความ Error (ถ้ามี) */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                border: '1px solid var(--danger-border)',
                marginBottom: '1.25rem',
                fontSize: '0.9rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. วันที่ต้องการจอง */}
            <div className="form-group">
              <label className="form-label">
                <CalIcon size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                วันที่ต้องการจัดงาน <span className="required">*</span>
              </label>
              <input 
                type="date" 
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // ป้องกันเลือกวันย้อนหลังใน datepicker
                required
              />
              {formData.date && (
                <div className="form-helper" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                  📅 ตรงกับ: {formatThaiDate(formData.date)}
                </div>
              )}
            </div>

            {/* 2. ชื่อกิจกรรม/งานอีเวนต์ */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                ชื่อกิจกรรม / งานอีเวนต์ <span className="required">*</span>
              </label>
              <input 
                type="text" 
                name="title"
                placeholder="เช่น งานสัมมนา AI ประจำปี 2026, งานเลี้ยงเปิดตัวสินค้า..." 
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* 3. หมวดหมู่กิจกรรม และ จำนวนผู้เข้าร่วม */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Tag size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  หมวดหมู่กิจกรรม
                </label>
                <select 
                  name="category" 
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Users size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  จำนวนผู้เข้าร่วม (คน)
                </label>
                <input 
                  type="number" 
                  name="guestsCount"
                  min="1"
                  max="5000"
                  className="form-input"
                  value={formData.guestsCount}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 4. ชื่อผู้จอง และ เบอร์โทรติดต่อ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <User size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  ชื่อผู้จอง / องค์กร <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  name="bookerName"
                  placeholder="เช่น นายวิทวัส บุญยืน" 
                  className="form-input"
                  value={formData.bookerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  เบอร์โทรติดต่อ <span className="required">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="เช่น 081-234-5678" 
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* 5. ช่วงเวลา (Time Slot) */}
            <div className="form-group">
              <label className="form-label">
                <Clock size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                ช่วงเวลาที่ต้องการจอง <span className="required">*</span>
              </label>
              <select 
                name="timeSlot" 
                className="form-select"
                value={formData.timeSlot}
                onChange={handleChange}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ถ้าเลือก "ระบุเวลาเอง" ให้แสดงช่องกรอกเวลา เริ่ม - สิ้นสุด */}
            {formData.timeSlot === 'custom' && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                background: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>เวลาเริ่มต้น</label>
                  <input 
                    type="time" 
                    name="customStartTime"
                    className="form-input"
                    value={formData.customStartTime}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>เวลาสิ้นสุด</label>
                  <input 
                    type="time" 
                    name="customEndTime"
                    className="form-input"
                    value={formData.customEndTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* 6. รายละเอียดเพิ่มเติม (Optional) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">รายละเอียดเพิ่มเติม / ความต้องการพิเศษ (ถ้ามี)</label>
              <textarea 
                name="description"
                rows="3"
                placeholder="เช่น ต้องการโปรเจกเตอร์ 2 เครื่อง, จัดโต๊ะแบบเธียเตอร์, มีอาหารว่างช่วงเบรก..." 
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* ปุ่มบันทึก / ยกเลิก */}
          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <CheckCircle2 size={18} />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการจอง'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
