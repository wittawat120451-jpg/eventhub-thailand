/**
 * ==============================================================================
 * ไฟล์: src/components/BookingList.jsx
 * หน้าที่: แสดงรายการการจองทั้งหมด พร้อมระบบค้นหา กรองข้อมูล และปุ่มยกเลิกการจอง
 * คำอธิบายสำหรับนักเรียน:
 *   - ใช้ React State (`useState`) จัดการคำค้นหา (Search Query) และตัวกรอง (Filter)
 *   - ใช้ `useMemo` เพื่อกรองข้อมูล (Filter Data) อย่างมีประสิทธิภาพ ไม่ทำให้เว็บช้า
 *   - มีหน้าต่าง Pop-up ยืนยันก่อนลบ (Delete Confirmation Modal) เพื่อความปลอดภัย
 * ==============================================================================
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Calendar as CalIcon, 
  Clock, 
  User, 
  Phone, 
  Users, 
  FileText, 
  LayoutGrid, 
  List, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  X
} from 'lucide-react';
import { 
  formatThaiDate, 
  formatDateKey, 
  EVENT_CATEGORIES, 
  TIME_SLOTS 
} from '../utils/localStorage';

export default function BookingList({ 
  bookings = [], 
  onDeleteBooking, 
  onAddNewBooking 
}) {
  // State สำหรับค้นหาและตัวกรอง
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'upcoming', 'past'
  const [filterDate, setFilterDate] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' หรือ 'table'

  // State สำหรับ Modal ลบข้อมูล และ Modal ดูรายละเอียด
  const [deletingBooking, setDeletingBooking] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);

  const todayStr = formatDateKey(new Date());

  /**
   * กรองรายการการจองตามเงื่อนไข (Search & Filter Logic)
   */
  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      // 1. กรองตามคำค้นหา (ชื่อกิจกรรม, ชื่อผู้จอง, หรือ เบอร์โทร)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        item.title.toLowerCase().includes(q) ||
        item.bookerName.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      // 2. กรองตามหมวดหมู่
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // 3. กรองตามวันที่เจาะจง
      const matchDate = !filterDate || item.date === filterDate;

      // 4. กรองตามสถานะ (กำลังจะมาถึง vs ผ่านมาแล้ว)
      let matchStatus = true;
      if (selectedStatus === 'upcoming') {
        matchStatus = item.date >= todayStr;
      } else if (selectedStatus === 'past') {
        matchStatus = item.date < todayStr;
      }

      return matchSearch && matchCategory && matchDate && matchStatus;
    }).sort((a, b) => a.date.localeCompare(b.date)); // เรียงตามวันที่จัดงานจากใกล้ไปไกล
  }, [bookings, searchQuery, selectedCategory, selectedStatus, filterDate, todayStr]);

  // ฟังก์ชันหาป้ายชื่อหมวดหมู่
  const getCategoryInfo = (catId) => {
    return EVENT_CATEGORIES.find((c) => c.id === catId) || { label: 'ทั่วไป', color: '#6B7280', bg: '#F3F4F6' };
  };

  // ฟังก์ชันหาข้อความช่วงเวลา
  const getTimeSlotLabel = (slotId, customTime) => {
    if (slotId === 'custom' && customTime) return `กำหนดเอง: ${customTime}`;
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    return slot ? slot.label : slotId;
  };

  // ยืนยันการลบการจอง
  const handleConfirmDelete = () => {
    if (deletingBooking) {
      onDeleteBooking(deletingBooking.id);
      setDeletingBooking(null);
    }
  };

  return (
    <div>
      {/* แถบเครื่องมือค้นหาและตัวกรอง (Search & Filter Bar) */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* ช่องค้นหาข้อความ */}
          <div style={{ position: 'relative', gridColumn: 'span 1' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อกิจกรรม, ผู้จอง, เบอร์โทร..." 
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* กรองตามหมวดหมู่ */}
          <div>
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">ทุกหมวดหมู่กิจกรรม</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* กรองตามสถานะ */}
          <div>
            <select 
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">ทุกสถานะ (ทั้งหมด)</option>
              <option value="upcoming">เฉพาะที่กำลังจะมาถึง</option>
              <option value="past">กิจกรรมที่ผ่านมาแล้ว</option>
            </select>
          </div>

          {/* กรองตามวันที่ */}
          <div>
            <input 
              type="date" 
              className="form-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              title="กรองตามวันที่จัดงาน"
            />
          </div>
        </div>

        {/* แถบสรุปผลลัพธ์และสลับมุมมอง (Grid/Table View) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            พบการจองทั้งหมด <strong style={{ color: 'var(--primary)' }}>{filteredBookings.length}</strong> รายการ
            {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || filterDate) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setFilterDate('');
                }}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '0.75rem', padding: '2px 8px', fontSize: '0.75rem' }}
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>

          {/* ปุ่มสลับมุมมอง Grid / Table */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button 
              onClick={() => setViewMode('grid')}
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : ''}`}
              style={{ padding: '0.35rem 0.65rem' }}
              title="มุมมองการ์ด (Grid View)"
            >
              <LayoutGrid size={16} />
              <span style={{ fontSize: '0.8rem' }}>การ์ด</span>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
              style={{ padding: '0.35rem 0.65rem' }}
              title="มุมมองตาราง (Table View)"
            >
              <List size={16} />
              <span style={{ fontSize: '0.8rem' }}>ตาราง</span>
            </button>
          </div>
        </div>
      </div>

      {/* กรณีไม่พบรายการจองตามเงื่อนไข (Empty State) */}
      {filteredBookings.length === 0 && (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--bg-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            marginBottom: '1rem'
          }}>
            <CalIcon size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>ไม่พบรายการจอง</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchQuery || selectedCategory !== 'all' || filterDate 
              ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง' 
              : 'ยังไม่มีรายการจองในระบบ เริ่มต้นจองวันกิจกรรมแรกของคุณได้เลย!'}
          </p>
          {onAddNewBooking && (
            <button onClick={onAddNewBooking} className="btn btn-primary">
              + จองกิจกรรมใหม่ทันที
            </button>
          )}
        </div>
      )}

      {/* 1. มุมมองแบบการ์ด (Card Grid View) */}
      {viewMode === 'grid' && filteredBookings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredBookings.map((item) => {
            const cat = getCategoryInfo(item.category);
            const isUpcoming = item.date >= todayStr;
            const isToday = item.date === todayStr;

            return (
              <div 
                key={item.id} 
                className="glass-card" 
                style={{ 
                  padding: '1.35rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${cat.color}`
                }}
              >
                <div>
                  {/* หัวการ์ด: หมวดหมู่ และ สถานะ */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span 
                      className="badge" 
                      style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}30` }}
                    >
                      {cat.label}
                    </span>

                    {isToday ? (
                      <span className="badge badge-warning">จัดงานวันนี้!</span>
                    ) : isUpcoming ? (
                      <span className="badge badge-success">กำลังจะมาถึง</span>
                    ) : (
                      <span className="badge badge-neutral">เสร็จสิ้นแล้ว</span>
                    )}
                  </div>

                  {/* ชื่อกิจกรรม */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {item.title}
                  </h3>

                  {/* ข้อมูลวันและเวลา */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-main)' }}>
                      <CalIcon size={16} color="var(--primary)" />
                      <span>{formatThaiDate(item.date)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} color="var(--secondary)" />
                      <span>{getTimeSlotLabel(item.timeSlot, item.customTime)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} color="var(--text-muted)" />
                      <span>ผู้จอง: <strong>{item.bookerName}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} color="var(--text-muted)" />
                      <span>{item.phone}</span>
                    </div>

                    {item.guestsCount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} color="var(--text-muted)" />
                        <span>ผู้เข้าร่วมประมาณ: {item.guestsCount} คน</span>
                      </div>
                    )}
                  </div>

                  {/* รายละเอียดเพิ่มเติม (ถ้ามี) */}
                  {item.description && (
                    <p style={{
                      fontSize: '0.83rem',
                      background: 'var(--bg-subtle)',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1rem',
                      color: 'var(--text-secondary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      📝 {item.description}
                    </p>
                  )}
                </div>

                {/* ปุ่มการกระทำ: ดูรายละเอียด & ยกเลิกการจอง */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <button 
                    onClick={() => setViewingBooking(item)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    title="ดูรายละเอียดการจอง"
                  >
                    <Eye size={15} />
                    <span>รายละเอียด</span>
                  </button>

                  <button 
                    onClick={() => setDeletingBooking(item)}
                    className="btn btn-danger btn-sm"
                    title="ยกเลิกรายการจองนี้"
                  >
                    <Trash2 size={15} />
                    <span>ยกเลิก</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. มุมมองแบบตาราง (Table View) */}
      {viewMode === 'table' && filteredBookings.length > 0 && (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>วันที่จัดงาน</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>ชื่อกิจกรรม</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>หมวดหมู่</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>ช่วงเวลา</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>ผู้จอง / เบอร์โทร</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((item) => {
                const cat = getCategoryInfo(item.category);
                const isUpcoming = item.date >= todayStr;
                const isToday = item.date === todayStr;

                return (
                  <tr 
                    key={item.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* วันที่จัดงาน */}
                    <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {formatThaiDate(item.date)}
                      </div>
                      {isToday ? (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>วันนี้</span>
                      ) : isUpcoming ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>กำลังจะมาถึง</span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>ผ่านมาแล้ว</span>
                      )}
                    </td>

                    {/* ชื่อกิจกรรม */}
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>
                      <div style={{ color: 'var(--text-main)', maxWidth: '240px' }}>{item.title}</div>
                      {item.guestsCount > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ผู้เข้าร่วม {item.guestsCount} คน
                        </span>
                      )}
                    </td>

                    {/* หมวดหมู่ */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span 
                        className="badge" 
                        style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}30` }}
                      >
                        {cat.label}
                      </span>
                    </td>

                    {/* ช่วงเวลา */}
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
                      {getTimeSlotLabel(item.timeSlot, item.customTime)}
                    </td>

                    {/* ผู้จอง */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 500 }}>{item.bookerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.phone}</div>
                    </td>

                    {/* จัดการ */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button 
                          onClick={() => setViewingBooking(item)}
                          className="btn btn-secondary btn-sm"
                          title="ดูรายละเอียด"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => setDeletingBooking(item)}
                          className="btn btn-danger btn-sm"
                          title="ยกเลิกการจอง"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL 1: ยืนยันการยกเลิกการจอง (Delete Confirmation Modal) --- */}
      {deletingBooking && (
        <div className="modal-overlay" onClick={() => setDeletingBooking(null)}>
          <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem 1.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>ยืนยันการยกเลิกการจอง?</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                คุณต้องการยกเลิกการจองกิจกรรม <strong>"{deletingBooking.title}"</strong> ในวันที่ <strong>{formatThaiDate(deletingBooking.date)}</strong> ใช่หรือไม่?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => setDeletingBooking(null)} 
                  className="btn btn-secondary"
                >
                  ย้อนกลับ
                </button>
                <button 
                  onClick={handleConfirmDelete} 
                  className="btn btn-danger"
                  style={{ background: 'var(--danger)', color: '#fff' }}
                >
                  <Trash2 size={16} />
                  <span>ยืนยันยกเลิกการจอง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ดูรายละเอียดการจองแบบเต็ม (View Details Modal) --- */}
      {viewingBooking && (
        <div className="modal-overlay" onClick={() => setViewingBooking(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <FileText size={20} />
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>รายละเอียดการจองกิจกรรม</h3>
              </div>
              <button 
                onClick={() => setViewingBooking(null)}
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
                    background: getCategoryInfo(viewingBooking.category).bg, 
                    color: getCategoryInfo(viewingBooking.category).color,
                    marginBottom: '0.5rem'
                  }}
                >
                  {getCategoryInfo(viewingBooking.category).label}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                  {viewingBooking.title}
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
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>วันที่จัดกิจกรรม</div>
                  <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                    📅 {formatThaiDate(viewingBooking.date)}
                  </strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ช่วงเวลา</div>
                  <strong>⏰ {getTimeSlotLabel(viewingBooking.timeSlot, viewingBooking.customTime)}</strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ชื่อผู้จอง</div>
                  <strong>👤 {viewingBooking.bookerName}</strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>เบอร์โทรติดต่อ</div>
                  <strong>📞 {viewingBooking.phone}</strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>จำนวนผู้เข้าร่วม</div>
                  <strong>👥 {viewingBooking.guestsCount || '-'} คน</strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>รหัสการจอง (ID)</div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {viewingBooking.id}
                  </span>
                </div>
              </div>

              {viewingBooking.description && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>รายละเอียด / ข้อกำหนดเพิ่มเติม:</h4>
                  <p style={{
                    fontSize: '0.9rem',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-light)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    whiteSpace: 'pre-line'
                  }}>
                    {viewingBooking.description}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setViewingBooking(null)} 
                className="btn btn-primary"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
