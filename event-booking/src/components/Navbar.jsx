/**
 * ==============================================================================
 * ไฟล์: src/components/Navbar.jsx
 * หน้าที่: แถบเมนูนำทางหลักของเว็บไซต์ (Navigation Bar)
 * คำอธิบายสำหรับนักเรียน:
 *   - ใช้ NavLink จาก 'react-router-dom' เพื่อไฮไลต์เมนูที่กำลังเปิดอยู่
 *   - รับ prop `bookingCount` เพื่อแสดงจำนวนการจองปัจจุบันบน Badge
 * ==============================================================================
 */

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ListOrdered, Home, PlusCircle, Sparkles } from 'lucide-react';

export default function Navbar({ bookingCount = 0 }) {
  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* โลโก้และชื่อเว็บไซต์ */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <CalendarIcon size={22} />
          </div>
          <div>
            <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EventFlow
            </span>
            <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-muted)', fontWeight: 400, marginTop: '-3px' }}>
              ระบบจองวันกิจกรรม & อีเวนต์
            </span>
          </div>
        </Link>

        {/* เมนูนำทางหลัก */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                <Home size={18} />
                <span>หน้าแรก</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/calendar" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <CalendarIcon size={18} />
                <span>ปฏิทินจองวัน</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/bookings" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <ListOrdered size={18} />
                <span>รายการจองทั้งหมด</span>
                {bookingCount > 0 && (
                  <span className="badge badge-primary" style={{ padding: '1px 7px', fontSize: '0.75rem' }}>
                    {bookingCount}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* ปุ่ม Quick Action และ Badge Supabase */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span 
            className="badge" 
            style={{ 
              background: '#ECFDF5', 
              color: '#047857', 
              border: '1px solid #A7F3D0',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="เชื่อมต่อฐานข้อมูล Supabase Cloud Database เรียบร้อยแล้ว"
          >
            <Sparkles size={13} color="#10B981" />
            <span>Supabase DB</span>
          </span>

          <Link to="/calendar" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>+ จองกิจกรรม</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
