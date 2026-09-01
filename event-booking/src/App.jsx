/**
 * ==============================================================================
 * ไฟล์: src/App.jsx
 * หน้าที่: Root Component หลักของระบบ กำหนดระบบ Routing (React Router DOM)
 * คำอธิบายสำหรับนักเรียน:
 *   - ใช้ `<BrowserRouter>`, `<Routes>`, `<Route>` เพื่อจัดการหน้าต่างๆ โดยไม่ต้องโหลดหน้าเว็บใหม่ (SPA - Single Page Application)
 *   - Route ประกอบด้วย:
 *       1. `/` -> หน้าแรก (Home)
 *       2. `/calendar` -> หน้าปฏิทินจองวัน (CalendarPage)
 *       3. `/bookings` -> หน้ารายการจองทั้งหมด (BookingListPage)
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CalendarPage from './pages/CalendarPage';
import BookingListPage from './pages/BookingListPage';
import { getBookings } from './utils/localStorage';
import { Calendar, AlertCircle } from 'lucide-react';

export default function App() {
  // State นับจำนวนรายการจองเพื่อส่งให้ Navbar แสดง Badge
  const [bookingCount, setBookingCount] = useState(0);

  // ฟังก์ชันอัปเดตจำนวนการจอง
  const updateBookingCount = () => {
    const data = getBookings();
    setBookingCount(data.length);
  };

  useEffect(() => {
    updateBookingCount();
  }, []);

  return (
    <HashRouter>
      {/* ภาพพื้นหลัง Background Gradient */}
      <div className="app-bg-gradient"></div>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* แถบเมนูด้านบน */}
        <Navbar bookingCount={bookingCount} />

        {/* ส่วนเนื้อหาหลักตามแต่ละ Route */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/calendar" 
              element={<CalendarPage onBookingListChange={updateBookingCount} />} 
            />
            <Route 
              path="/bookings" 
              element={<BookingListPage onBookingListChange={updateBookingCount} />} 
            />

            {/* หน้า 404 Not Found กรณีเข้า URL ผิด */}
            <Route 
              path="*" 
              element={
                <div className="page-wrapper">
                  <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'var(--danger-light)',
                      color: 'var(--danger)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <AlertCircle size={36} />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404 - ไม่พบหน้าที่ต้องการ</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                      หน้าที่คุณพยายามเข้าถึงอาจถูกลบหรือไม่มีอยู่ในระบบ
                    </p>
                    <Link to="/" className="btn btn-primary">
                      กลับสู่หน้าหลัก
                    </Link>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>

        {/* ส่วนท้ายเว็บไซต์ */}
        <Footer />
      </div>
    </HashRouter>
  );
}
