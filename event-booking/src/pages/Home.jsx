/**
 * ==============================================================================
 * ไฟล์: src/pages/Home.jsx
 * หน้าที่: หน้าแรก (Landing Page) แสดงภาพรวม สถิติ กิจกรรมเร็วๆ นี้ และปุ่มนำทาง
 * คำอธิบายสำหรับนักเรียน:
 *   - ดึงข้อมูลสถิติและการจองจริงจาก `localStorage` ผ่านฟังก์ชัน Helper
 *   - มีปุ่ม CTA (Call to Action) เชื่อมโยงไปยังหน้าปฏิทินและหน้ารายการจอง
 * ==============================================================================
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalIcon, 
  ListOrdered, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  CalendarCheck
} from 'lucide-react';
import { getBookings, getSystemStats, formatThaiDate, formatDateKey, EVENT_CATEGORIES } from '../utils/localStorage';

export default function Home() {
  // ดึงข้อมูลการจองและสถิติภาพรวม
  const bookings = useMemo(() => getBookings(), []);
  const stats = useMemo(() => getSystemStats(), [bookings]);

  const todayStr = formatDateKey(new Date());

  // ดึงกิจกรรมที่กำลังจะมาถึง 3 รายการล่าสุด
  const upcomingEvents = useMemo(() => {
    return bookings
      .filter((b) => b.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [bookings, todayStr]);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* --- 1. HERO SECTION: ส่วนต้อนรับและแนะนำระบบ --- */}
        <section style={{
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(79, 70, 229, 0.15)',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '780px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '1rem', padding: '0.35rem 0.85rem' }}>
              <Sparkles size={14} />
              <span>Event Booking & Calendar Management</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '1rem',
              color: 'var(--text-main)'
            }}>
              ระบบจองวันจัดกิจกรรมและอีเวนต์ <br />
              <span style={{
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                เช็กวันว่าง จองง่าย บันทึกทันที
              </span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              แพลตฟอร์มบริหารจัดการตารางจัดงานอีเวนต์ สัมมนา เวิร์กช็อป และงานเลี้ยง 
              ดูสถานะปฏิทินแบบเรียลไทม์ ป้องกันการจองซ้ำซ้อน บันทึกข้อมูลปลอดภัยด้วย LocalStorage
            </p>

            {/* ปุ่ม CTA นำทาง */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/calendar" className="btn btn-primary btn-lg">
                <CalIcon size={20} />
                <span>ดูปฏิทินและเลือกวันจอง</span>
                <ArrowRight size={18} />
              </Link>

              <Link to="/bookings" className="btn btn-secondary btn-lg">
                <ListOrdered size={20} />
                <span>ดูรายการที่จองไว้ ({stats.totalBookings})</span>
              </Link>
            </div>
          </div>
        </section>

        {/* --- 2. STATS CARDS: การ์ดแสดงสถิติภาพรวม --- */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            {/* สถิติ 1: ยอดจองทั้งหมด */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingUp size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>รายการจองทั้งหมดในระบบ</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {stats.totalBookings} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>รายการ</span>
                </div>
              </div>
            </div>

            {/* สถิติ 2: กิจกรรมที่กำลังจะมาถึง */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CalendarCheck size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>กิจกรรมที่กำลังจะมาถึง</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
                  {stats.upcomingCount} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>งาน</span>
                </div>
              </div>
            </div>

            {/* สถิติ 3: วันว่างเดือนนี้ */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Zap size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>วันว่างในเดือนปัจจุบัน</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#D97706' }}>
                  {stats.availableDaysInMonth} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>วัน</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. UPCOMING EVENTS PREVIEW: กิจกรรมเร็วๆ นี้ --- */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700 }}>📅 กิจกรรมที่กำลังจะเกิดขึ้นเร็วๆ นี้</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ตารางกิจกรรมที่มีการจองไว้ล่วงหน้า</p>
            </div>
            <Link to="/bookings" className="btn btn-secondary btn-sm">
              ดูทั้งหมด ({bookings.length})
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>ยังไม่มีกิจกรรมในเร็วๆ นี้</p>
              <Link to="/calendar" className="btn btn-primary btn-sm">
                + จองกิจกรรมตอนนี้
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.25rem'
            }}>
              {upcomingEvents.map((event) => {
                const cat = EVENT_CATEGORIES.find((c) => c.id === event.category) || { label: 'ทั่วไป', color: '#4F46E5', bg: '#EEF2FF' };
                return (
                  <div 
                    key={event.id} 
                    className="glass-card" 
                    style={{ 
                      padding: '1.35rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      borderLeft: `5px solid ${cat.color}`
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="badge" style={{ background: cat.bg, color: cat.color }}>
                          {cat.label}
                        </span>
                        <span className="badge badge-success">จองแล้ว</span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        {event.title}
                      </h3>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, color: 'var(--primary)' }}>
                          <CalIcon size={15} />
                          <span>{formatThaiDate(event.date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={15} color="var(--text-muted)" />
                          <span>ผู้จอง: {event.bookerName}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        โทร: {event.phone}
                      </span>
                      <Link to="/bookings" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
                        ดูข้อมูลเพิ่มเติม →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* --- 4. HOW IT WORKS: 3 ขั้นตอนง่ายๆ ในการจอง --- */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              วิธีการใช้งาน 3 ขั้นตอนง่ายๆ
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              จองวันจัดงานอีเวนต์สะดวกรวดเร็วได้ภายในไม่กี่นาที
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* ขั้นตอน 1 */}
            <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>เปิดดูปฏิทินรายเดือน</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                เลือกดูวันว่างที่มีสัญลักษณ์ <strong style={{ color: 'var(--success)' }}>สีเขียว</strong> บนปฏิทิน
              </p>
            </div>

            {/* ขั้นตอน 2 */}
            <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--secondary)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>กรอกรายละเอียดกิจกรรม</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                คลิกวันว่างเพื่อเปิดแบบฟอร์ม กรอกชื่อกิจกรรม ผู้จอง เบอร์โทร และช่วงเวลา
              </p>
            </div>

            {/* ขั้นตอน 3 */}
            <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--success)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>ยืนยันและบันทึกข้อมูล</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                ระบบจะตรวจสอบป้องกันการจองซ้ำ และบันทึกลงฐานข้อมูลในเครื่องทันที
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
