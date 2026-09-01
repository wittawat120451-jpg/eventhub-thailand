/**
 * ==============================================================================
 * ไฟล์: src/components/Footer.jsx
 * หน้าที่: แสดงข้อมูลส่วนท้ายของเว็บไซต์ (Footer)
 * ==============================================================================
 */

import React from 'react';
import { Calendar, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid var(--border-light)',
      padding: '2.5rem 0 1.5rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--border-light)'
        }}>
          {/* ข้อมูลระบบ */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Calendar size={18} />
              </div>
              <strong style={{ fontSize: '1.1rem' }}>EventFlow</strong>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              ระบบจองวันกิจกรรมและงานอีเวนต์ออนไลน์ จัดการตารางงาน ดูวันว่าง ป้องกันการจองซ้ำ และบันทึกข้อมูลอย่างปลอดภัยด้วย React & LocalStorage
            </p>
          </div>

          {/* ลิงก์ด่วน */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.85rem' }}>เมนูด่วน (Quick Links)</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>หน้าแรก (Home)</Link>
              </li>
              <li>
                <Link to="/calendar" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>ปฏิทินจองวัน (Calendar View)</Link>
              </li>
              <li>
                <Link to="/bookings" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>รายการจองทั้งหมด (Booking List)</Link>
              </li>
            </ul>
          </div>

          {/* ไฮไลต์การทำงาน */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.85rem' }}>ความปลอดภัย & ข้อมูล</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span>Real-time LocalStorage Persistence</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ข้อมูลการจองจะถูกจัดเก็บในเครื่องเบราว์เซอร์อย่างปลอดภัย ไม่สูญหายเมื่อรีเฟรชหน้าเว็บ
            </p>
          </div>
        </div>

        {/* ลิขสิทธิ์ */}
        <div style={{
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} EventFlow Booking System. พัฒนาด้วย React + Vite
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>จัดทำเพื่อการศึกษาและการสอบโปรเจกต์</span>
            <Heart size={14} color="#EF4444" fill="#EF4444" />
          </div>
        </div>
      </div>
    </footer>
  );
}
