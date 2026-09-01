/**
 * ==============================================================================
 * ไฟล์: src/utils/localStorage.js
 * หน้าที่: จัดการข้อมูลการจอง (CRUD) รองรับทั้ง Supabase Cloud Database และ LocalStorage
 * คำอธิบายสำหรับนักเรียน:
 *   - ระบบจะพยายามเชื่อมต่อกับ Supabase ก่อน (Cloud Database)
 *   - หากยังไม่ได้สร้างตารางใน Supabase หรือไม่มีอินเทอร์เน็ต จะสลับมาใช้ LocalStorage อัตโนมัติ (Fallback)
 * ==============================================================================
 */

import { supabase } from './supabaseClient';

// คีย์หลักสำหรับเก็บข้อมูลใน localStorage
export const STORAGE_KEY = 'bookings';

/**
 * หมวดหมู่กิจกรรมตัวอย่างสำหรับระบบ
 */
export const EVENT_CATEGORIES = [
  { id: 'seminar', label: 'สัมมนา / อบรมวิชาการ', color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'party', label: 'งานเลี้ยง / สังสรรค์', color: '#EC4899', bg: '#FDF2F8' },
  { id: 'wedding', label: 'งานแต่งงาน / มงคลสมรส', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'workshop', label: 'เวิร์กช็อป / กิจกรรมกลุ่ม', color: '#10B981', bg: '#ECFDF5' },
  { id: 'meeting', label: 'การประชุมทางธุรกิจ', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'exhibition', label: 'นิทรรศการ / แสดงผลงาน', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'other', label: 'กิจกรรมทั่วไปอื่นๆ', color: '#6B7280', bg: '#F3F4F6' }
];

/**
 * ตัวเลือกช่วงเวลาจัดงาน
 */
export const TIME_SLOTS = [
  { id: 'all-day', label: 'เต็มวัน (08:30 - 17:00 น.)', timeRange: '08:30 - 17:00' },
  { id: 'morning', label: 'ช่วงเช้า (08:30 - 12:00 น.)', timeRange: '08:30 - 12:00' },
  { id: 'afternoon', label: 'ช่วงบ่าย (13:00 - 17:00 น.)', timeRange: '13:00 - 17:00' },
  { id: 'evening', label: 'ช่วงค่ำ (18:00 - 22:00 น.)', timeRange: '18:00 - 22:00' },
  { id: 'custom', label: 'ระบุเวลาเอง', timeRange: 'กำหนดเอง' }
];

/**
 * ฟังก์ชันสร้างวันที่ในรูปแบบ YYYY-MM-DD สำหรับใช้อ้างอิง
 */
export const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * ข้อมูลเริ่มต้น (Mock Data)
 */
const getInitialMockBookings = () => {
  const today = new Date();
  const createRelativeDate = (daysFromToday) => {
    const target = new Date(today);
    target.setDate(today.getDate() + daysFromToday);
    return formatDateKey(target);
  };

  return [
    {
      id: 'bk-mock-01',
      title: 'งานสัมมนา AI & Modern Web Development 2026',
      bookerName: 'อาจารย์วิทวัส บุญยืน',
      phone: '081-234-5678',
      date: createRelativeDate(2),
      timeSlot: 'all-day',
      customTime: '',
      category: 'seminar',
      guestsCount: 80,
      description: 'งานสัมมนาให้ความรู้เกี่ยวกับเทคโนโลยี AI และการพัฒนาเว็บแอปพลิเคชันยุคใหม่',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-mock-02',
      title: 'เวิร์กช็อป React & Supabase สำหรับนักศึกษา',
      bookerName: 'สมชาย พัฒนาการ',
      phone: '089-987-6543',
      date: createRelativeDate(5),
      timeSlot: 'morning',
      customTime: '',
      category: 'workshop',
      guestsCount: 35,
      description: 'ลงมือปฏิบัติการสร้างเว็บด้วย React และ Supabase Database',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-mock-03',
      title: 'งานเลี้ยงต้อนรับและสังสรรค์ประจำปี',
      bookerName: 'สุดาพร มงคลศิลป์',
      phone: '092-345-6789',
      date: createRelativeDate(9),
      timeSlot: 'evening',
      customTime: '',
      category: 'party',
      guestsCount: 120,
      description: 'งานสังสรรค์ฉลองความสำเร็จและกระชับมิตรภาพในองค์กร',
      createdAt: new Date().toISOString()
    }
  ];
};

/**
 * 1. ดึงรายการจองจาก LocalStorage (Synchronous Read)
 */
export const getBookings = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      const initialData = getInitialMockBookings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    const parsed = JSON.parse(storedData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอ่านข้อมูล:', error);
    return [];
  }
};

/**
 * แปลงฟิลด์จาก Supabase (snake_case) เป็น JavaScript (camelCase)
 */
const mapFromSupabase = (row) => ({
  id: row.id,
  title: row.title,
  bookerName: row.booker_name || row.bookerName || '',
  phone: row.phone,
  date: row.date,
  timeSlot: row.time_slot || row.timeSlot || 'all-day',
  customTime: row.custom_time || row.customTime || '',
  category: row.category || 'other',
  guestsCount: Number(row.guests_count || row.guestsCount) || 0,
  description: row.description || '',
  createdAt: row.created_at || row.createdAt || new Date().toISOString()
});

/**
 * แปลงฟิลด์จาก JavaScript (camelCase) เป็น Supabase (snake_case)
 */
const mapToSupabase = (item) => ({
  id: item.id,
  title: item.title,
  booker_name: item.bookerName,
  phone: item.phone,
  date: item.date,
  time_slot: item.timeSlot,
  custom_time: item.customTime || '',
  category: item.category || 'other',
  guests_count: Number(item.guestsCount) || 0,
  description: item.description || ''
});

/**
 * 2. ดึงรายการจองจาก Supabase Cloud Database (Asynchronous Read)
 */
export const fetchBookingsFromCloud = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.warn('Supabase query notice (ใช้ localStorage แทน):', error.message);
      return { success: false, data: getBookings(), source: 'local' };
    }

    if (data) {
      const mappedData = data.map(mapFromSupabase);
      // แคชเก็บไว้ใน localStorage ด้วย
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedData));
      return { success: true, data: mappedData, source: 'supabase' };
    }
    return { success: true, data: getBookings(), source: 'local' };
  } catch (err) {
    console.warn('Cloud connection notice:', err);
    return { success: false, data: getBookings(), source: 'local' };
  }
};

/**
 * 3. ตรวจสอบว่าวันที่ระบุเป็นวันที่ผ่านมาแล้วหรือไม่
 */
export const isPastDate = (dateStr) => {
  if (!dateStr) return true;
  const todayStr = formatDateKey(new Date());
  return dateStr < todayStr;
};

/**
 * 4. ตรวจสอบการจองซ้ำ
 */
export const isDateBooked = (dateStr, timeSlot = 'all-day', excludeBookingId = null) => {
  const bookings = getBookings();
  const sameDateBookings = bookings.filter(
    (b) => b.date === dateStr && b.id !== excludeBookingId
  );

  if (sameDateBookings.length === 0) return null;

  const hasAllDay = sameDateBookings.find((b) => b.timeSlot === 'all-day');
  if (hasAllDay) return hasAllDay;

  if (timeSlot === 'all-day' && sameDateBookings.length > 0) return sameDateBookings[0];

  const exactSlotMatch = sameDateBookings.find((b) => b.timeSlot === timeSlot);
  if (exactSlotMatch) return exactSlotMatch;

  return null;
};

/**
 * 5. บันทึกข้อมูลการจองใหม่ลง Supabase + LocalStorage
 */
export const saveBooking = async (bookingData) => {
  try {
    // Validation
    if (!bookingData.title || !bookingData.title.trim()) {
      return { success: false, message: 'กรุณากรอกชื่อกิจกรรม/งานอีเวนต์' };
    }
    if (!bookingData.bookerName || !bookingData.bookerName.trim()) {
      return { success: false, message: 'กรุณากรอกชื่อผู้จอง' };
    }
    if (!bookingData.phone || !bookingData.phone.trim()) {
      return { success: false, message: 'กรุณากรอกเบอร์โทรศัพท์ติดต่อ' };
    }
    if (!bookingData.date) {
      return { success: false, message: 'กรุณาเลือกวันที่ต้องการจัดกิจกรรม' };
    }
    if (isPastDate(bookingData.date)) {
      return { success: false, message: 'ไม่สามารถจองวันที่ผ่านมาแล้วได้ กรุณาเลือกวันปัจจุบันหรืออนาคต' };
    }

    const conflict = isDateBooked(bookingData.date, bookingData.timeSlot);
    if (conflict) {
      return { 
        success: false, 
        message: `วันที่ ${bookingData.date} ในช่วงเวลานี้ถูกจองแล้วโดย "${conflict.title}"` 
      };
    }

    const newBooking = {
      ...bookingData,
      id: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: bookingData.title.trim(),
      bookerName: bookingData.bookerName.trim(),
      phone: bookingData.phone.trim(),
      category: bookingData.category || 'other',
      timeSlot: bookingData.timeSlot || 'all-day',
      guestsCount: Number(bookingData.guestsCount) || 0,
      description: bookingData.description ? bookingData.description.trim() : '',
      createdAt: new Date().toISOString()
    };

    // 1. บันทึกลง localStorage ทันที
    const currentBookings = getBookings();
    const updatedBookings = [newBooking, ...currentBookings];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookings));

    // 2. พยายามบันทึกลง Supabase Database
    try {
      const payload = mapToSupabase(newBooking);
      const { error } = await supabase.from('bookings').insert([payload]);
      if (error) {
        console.warn('บันทึกไปยัง Supabase ไม่สำเร็จ (ใช้ LocalStorage สำรอง):', error.message);
      }
    } catch (sbError) {
      console.warn('Supabase sync error:', sbError);
    }

    return { 
      success: true, 
      message: 'บันทึกการจองกิจกรรมเรียบร้อยแล้ว!', 
      data: newBooking 
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกการจอง:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดของระบบ ไม่สามารถบันทึกข้อมูลได้' };
  }
};

/**
 * 6. ยกเลิก / ลบรายการจอง
 */
export const deleteBooking = async (bookingId) => {
  try {
    // 1. ลบจาก LocalStorage
    const currentBookings = getBookings();
    const filtered = currentBookings.filter((b) => b.id !== bookingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // 2. ลบจาก Supabase
    try {
      await supabase.from('bookings').delete().eq('id', bookingId);
    } catch (sbErr) {
      console.warn('Supabase delete error:', sbErr);
    }

    return true;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', error);
    return false;
  }
};

/**
 * 7. สรุปสถิติภาพรวม
 */
export const getSystemStats = () => {
  const bookings = getBookings();
  const todayStr = formatDateKey(new Date());
  
  const upcomingBookings = bookings.filter((b) => b.date >= todayStr);
  const pastBookings = bookings.filter((b) => b.date < todayStr);
  
  const now = new Date();
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentYearMonth = todayStr.substring(0, 7);
  const currentMonthBookings = bookings.filter((b) => b.date.startsWith(currentYearMonth));
  const bookedDaysInMonth = new Set(currentMonthBookings.map((b) => b.date)).size;
  const availableDaysInMonth = Math.max(0, daysInCurrentMonth - bookedDaysInMonth);

  return {
    totalBookings: bookings.length,
    upcomingCount: upcomingBookings.length,
    pastCount: pastBookings.length,
    bookedDaysInMonth,
    availableDaysInMonth,
    daysInCurrentMonth
  };
};

/**
 * แปลงวันที่เป็นภาษาไทย
 */
export const formatThaiDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const monthsThai = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiYear = year + 543;
    return `${day} ${monthsThai[month - 1]} ${thaiYear}`;
  } catch (e) {
    return dateStr;
  }
};
