/**
 * EVENTSPHERE - Data Store & State Management
 * Persistent localStorage storage with realistic Thai event data
 */

const STORAGE_KEYS = {
  EVENTS: 'eventsphere_events_v2',
  BOOKINGS: 'eventsphere_bookings_v2',
  WAITLISTS: 'eventsphere_waitlists_v2',
  USERS: 'eventsphere_users_v2',
  CURRENT_USER: 'eventsphere_current_user_v2',
  NOTIFICATIONS: 'eventsphere_notifications_v2',
  THEME: 'eventsphere_theme_v2'
};

// Realistic, High-Quality Events in Thailand (Natural Thai Event Platform Style)
const INITIAL_EVENTS = [
  {
    id: 'evt-001',
    title: 'Cat Expo 2026: เทศกาลดนตรีของคนรักเสียงเพลง',
    category: 'music',
    date: '2026-09-19',
    time: '14:00 - 23:30 น.',
    location: 'สวนสนุกวันเดอร์เวิลด์ รามอินทรา กรุงเทพฯ',
    description: 'เทศกาลดนตรีประจำปีที่ยิ่งใหญ่ที่สุด รวบรวมศิลปินอินดี้และป๊อปกว่า 100 วงทั่วฟ้าเมืองไทย บน 5 เวทีใหญ่ พร้อมตลาดนัดเพลงและของสะสมจากศิลปินโดยตรง มีรถรับ-ส่งฟรีจาก MRT สถานีแฟชั่นไอส์แลนด์',
    speaker: 'ผู้จัด: Cat Radio & ทีมงาน',
    capacity: 300,
    bookedSeats: 288, // เหลือ 12 ที่นั่ง -> โควตาใกล้เต็ม
    price: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    organizer: 'Cat Radio Official',
    featured: true,
    tags: ['คอนเสิร์ต', 'CatExpo', 'ดนตรี', 'อินดี้']
  },
  {
    id: 'evt-002',
    title: 'T-POP All Stars Live Concert 2026',
    category: 'music',
    date: '2026-09-27',
    time: '18:00 - 22:00 น.',
    location: 'อิมแพ็ค อารีน่า เมืองทองธานี',
    description: 'รวมพลไอดอลและศิลปิน T-POP แถวหน้าของเมืองไทย จัดเต็มโปรดักชัน แสง สี เสียง และเวที 360 องศา พร้อมสิทธิพิเศษ Hi-Touch สำหรับผู้ถือบัตรทุกคน',
    speaker: 'ผู้จัด: T-POP Universe Group',
    capacity: 500,
    bookedSeats: 500, // บัตรเต็ม 100% -> ทดสอบ Waiting List
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
    organizer: 'T-POP Universe',
    featured: true,
    tags: ['T-POP', 'Concert', 'ImpactArena', 'ไอดอล']
  },
  {
    id: 'evt-003',
    title: 'Tech & AI Hands-on Workshop: สร้าง Web App ด้วย AI',
    category: 'tech',
    date: '2026-09-13',
    time: '09:30 - 16:30 น.',
    location: 'สามย่านมิตรทาวน์ฮอลล์ (ชั้น 5) / MRT สามย่าน',
    description: 'เวิร์กช็อป 1 วันเต็ม ลงมือเขียนโค้ดและเชื่อมต่อ Generative AI API สร้างเว็บแอปพลิเคชันที่ใช้งานได้จริง ผู้เข้าร่วมจะได้โค้ดโปรเจกต์ต้นแบบและใบรับรอง (Certificate)',
    speaker: 'คุณณัฐพล เกียรติ์เจริญ (Lead Software Engineer & AI Specialist)',
    capacity: 60,
    bookedSeats: 42,
    price: 1990,
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
    organizer: 'DevClub Thailand',
    featured: false,
    tags: ['AI', 'Coding', 'Workshop', 'สามย่านมิตรทาวน์']
  },
  {
    id: 'evt-004',
    title: 'Bangkok City Midnight Run 2026 (10K / 21K)',
    category: 'sport',
    date: '2026-10-03',
    time: '23:00 - 04:00 น.',
    location: 'ลานคนเมือง เสาชิงช้า - ถ.ราชดำเนิน กรุงเทพฯ',
    description: 'วิ่งรับลมหนาวยามค่ำคืนใจกลางเกาะรัตนโกสินทร์ ผ่านวัดพระแก้ว โลหะปราสาท และสะพานพระราม 8 รับเสื้อวิ่งที่ระลึกเนื้อผ้าเบาสบาย เหรียญรางวัล และจุดน้ำดื่ม-เกลือแร่มาตรฐานสากล',
    speaker: 'ผู้จัด: สมาคมวิ่งเพื่อสุขภาพกรุงเทพมหานคร',
    capacity: 800,
    bookedSeats: 650,
    price: 650,
    imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=80',
    organizer: 'BKK Runners Guild',
    featured: true,
    tags: ['วิ่งมาราธอน', 'NightRun', 'สุขภาพ', 'เสาชิงช้า']
  },
  {
    id: 'evt-005',
    title: 'Specialty Coffee & Slow Bar Drip Masterclass',
    category: 'workshop',
    date: '2026-09-12',
    time: '13:00 - 17:00 น.',
    location: 'Roots Coffee Lab (สุขุมวิท 49 / BTS พร้อมพงษ์)',
    description: 'เรียนรู้ศาสตร์การดริปกาแฟพิเศษ คัดสรรเมล็ดกาแฟไทยยอดนิยม (น่าน เชียงราย เชียงใหม่) ทดลองปรับ Ratio อุณหภูมิน้ำ และชิมรสชาติ (Cupping) พร้อมรับชุดเมล็ดกาแฟพิเศษกลับบ้าน',
    speaker: 'คุณกฤษฎา เลิศศิริ (บาริสต้าแชมป์ดริปประเทศไทย)',
    capacity: 20,
    bookedSeats: 14,
    price: 1850,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    organizer: 'Craft Coffee Studio BKK',
    featured: false,
    tags: ['กาแฟดริป', 'เวิร์กช็อป', 'Coffee', 'สุขุมวิท']
  },
  {
    id: 'evt-006',
    title: 'สัมมนาเจาะลึกเทรนด์การตลาดออนไลน์ & TikTok Commerce 2026',
    category: 'seminar',
    date: '2026-09-24',
    time: '10:00 - 15:30 น.',
    location: 'True Digital Park (Auditorium ชั้น 6) / BTS ปุณณวิถี',
    description: 'กลยุทธ์ปั้นยอดขายด้วย Short Video, Live Streaming และ TikTok Shop เทคนิคทำคอนเทนต์ให้ไวรัลและเปลี่ยนยอดวิวเป็นยอดสั่งซื้อจริง พร้อมช่วง Q&A ปรึกษาผู้เชี่ยวชาญตัวจริง',
    speaker: 'ผู้เชี่ยวชาญด้าน Digital Marketing & Top Creator',
    capacity: 120,
    bookedSeats: 75,
    price: 0, // สัมมนาฟรี!
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    organizer: 'Digital Growth Academy Thailand',
    featured: false,
    tags: ['การตลาด', 'TikTok', 'ธุรกิจ', 'สัมมนาฟรี']
  }
];

// Demo Users
const INITIAL_USERS = [
  {
    id: 'usr-admin-001',
    name: 'กิตติศักดิ์ พงษ์ไพศาล (ผู้ดูแลระบบ)',
    email: 'admin@eventsphere.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '0812345678'
  },
  {
    id: 'usr-demo-001',
    name: 'วิศวภัทร ธนเกียรติคุณ',
    email: 'witsawa@demo.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    phone: '0898765432'
  }
];

// Demo Bookings
const INITIAL_BOOKINGS = [
  {
    id: 'bk-982101',
    refCode: 'EVT-982101',
    userId: 'usr-demo-001',
    eventId: 'evt-001',
    attendeeName: 'วิศวภัทร ธนเกียรติคุณ',
    attendeeEmail: 'witsawa@demo.com',
    attendeePhone: '0898765432',
    seats: 2,
    totalPrice: 3000,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    eventDate: '2026-09-19',
    qrPayload: 'EVENTSPHERE:bk-982101:evt-001:usr-demo-001:2SEATS'
  },
  {
    id: 'bk-982102',
    refCode: 'EVT-982102',
    userId: 'usr-demo-001',
    eventId: 'evt-005',
    attendeeName: 'วิศวภัทร ธนเกียรติคุณ',
    attendeeEmail: 'witsawa@demo.com',
    attendeePhone: '0898765432',
    seats: 1,
    totalPrice: 1850,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    eventDate: '2026-09-12',
    qrPayload: 'EVENTSPHERE:bk-982102:evt-005:usr-demo-001:1SEAT'
  }
];

// Demo Notifications
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-001',
    userId: 'usr-demo-001',
    title: '🎉 จองบัตรสำเร็จเรียบร้อย',
    message: 'การจอง Cat Expo 2026 (2 ที่นั่ง) รหัส EVT-982101 ได้รับการยืนยันแล้ว สามารถเปิดดูบัตร E-Ticket ได้ตลอดเวลา',
    type: 'booking_success',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    read: false,
    link: 'my-bookings'
  },
  {
    id: 'notif-002',
    userId: 'usr-demo-001',
    title: '⏰ เตือนความจำ: อีก 1 วันจะถึงวันกิจกรรม',
    message: 'กิจกรรม Specialty Coffee Drip Masterclass จะเริ่มในวันพรุ่งนี้ อย่าลืมแสดง QR Code ณ จุดลงทะเบียนเข้างาน',
    type: 'event_reminder',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    read: false,
    link: 'my-bookings'
  }
];

class EventStore {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[1]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WAITLISTS)) {
      localStorage.setItem(STORAGE_KEYS.WAITLISTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventType, payload) {
    this.listeners.forEach(listener => listener(eventType, payload));
  }

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  }

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.notify('THEME_CHANGED', theme);
  }

  toggleTheme() {
    const next = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  getCurrentUser() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify('USER_CHANGED', user);
  }

  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  saveUser(newUser) {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.email === newUser.email);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...newUser };
    } else {
      users.push(newUser);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getEvents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
  }

  getEventById(id) {
    return this.getEvents().find(e => e.id === id) || null;
  }

  saveEvent(eventData) {
    const events = this.getEvents();
    if (eventData.id) {
      const index = events.findIndex(e => e.id === eventData.id);
      if (index >= 0) {
        events[index] = { ...events[index], ...eventData };
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        this.notify('EVENT_UPDATED', events[index]);
        return events[index];
      }
    }
    const newEvent = {
      ...eventData,
      id: 'evt-' + Date.now().toString(36),
      bookedSeats: Number(eventData.bookedSeats) || 0,
      capacity: Number(eventData.capacity) || 50,
      price: Number(eventData.price) || 0,
      featured: !!eventData.featured
    };
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notify('EVENT_CREATED', newEvent);

    if (window.supabaseService && window.supabaseService.isConnected) {
      window.supabaseService.pushEvent(newEvent);
    }

    return newEvent;
  }

  deleteEvent(id) {
    let events = this.getEvents();
    events = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notify('EVENT_DELETED', id);
  }

  getBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  }

  getUserBookings(userId) {
    return this.getBookings().filter(b => b.userId === userId);
  }

  getBookingById(id) {
    return this.getBookings().find(b => b.id === id || b.refCode === id);
  }

  createBooking(bookingData) {
    const events = this.getEvents();
    const event = events.find(e => e.id === bookingData.eventId);
    if (!event) {
      throw new Error('ไม่พบข้อมูลกิจกรรมที่ต้องการจอง');
    }

    const remaining = event.capacity - event.bookedSeats;
    const requestedSeats = Number(bookingData.seats);

    if (requestedSeats <= 0) {
      throw new Error('กรุณาระบุจำนวนที่นั่งอย่างน้อย 1 ที่นั่ง');
    }

    if (remaining < requestedSeats) {
      throw new Error(`ขออภัย ที่นั่งว่างคงเหลือเพียง ${remaining} ที่นั่ง ไม่สามารถจอง ${requestedSeats} ที่นั่งได้`);
    }

    event.bookedSeats += requestedSeats;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    const idNum = Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
      id: `bk-${idNum}`,
      refCode: `EVT-${idNum}`,
      userId: bookingData.userId,
      eventId: bookingData.eventId,
      attendeeName: bookingData.attendeeName,
      attendeeEmail: bookingData.attendeeEmail,
      attendeePhone: bookingData.attendeePhone,
      seats: requestedSeats,
      totalPrice: (event.price || 0) * requestedSeats,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      eventDate: event.date,
      qrPayload: `EVENTSPHERE:bk-${idNum}:${event.id}:${bookingData.userId}:${requestedSeats}SEATS`
    };

    const bookings = this.getBookings();
    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this.addNotification({
      userId: bookingData.userId,
      title: '🎉 จองบัตรสำเร็จเรียบร้อย!',
      message: `การจอง ${event.title} (${requestedSeats} ที่นั่ง) รหัส ${newBooking.refCode} สำเร็จแล้ว`,
      type: 'booking_success',
      link: 'my-bookings'
    });

    this.notify('BOOKING_CREATED', newBooking);
    this.notify('EVENT_UPDATED', event);

    if (window.supabaseService && window.supabaseService.isConnected) {
      window.supabaseService.pushBooking(newBooking);
    }

    return newBooking;
  }

  updateBookingSeats(bookingId, newSeats) {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('ไม่พบข้อมูลการจอง');

    const events = this.getEvents();
    const event = events.find(e => e.id === booking.eventId);
    if (!event) throw new Error('ไม่พบข้อมูลกิจกรรม');

    const eventDateTime = new Date(`${event.date}T00:00:00`).getTime();
    const now = Date.now();
    const diffHours = (eventDateTime - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
      throw new Error('ไม่สามารถเปลี่ยนแปลงจำนวนที่นั่งได้ เนื่องจากเหลือน้อยกว่า 24 ชั่วโมงก่อนวันจัดกิจกรรม');
    }

    const seatDiff = newSeats - booking.seats;
    if (seatDiff > 0) {
      const remaining = event.capacity - event.bookedSeats;
      if (remaining < seatDiff) {
        throw new Error(`ที่นั่งไม่เพียงพอ (เหลือว่าง ${remaining} ที่นั่ง)`);
      }
      event.bookedSeats += seatDiff;
    } else if (seatDiff < 0) {
      event.bookedSeats += seatDiff;
    }

    booking.seats = newSeats;
    booking.totalPrice = (event.price || 0) * newSeats;
    booking.qrPayload = `EVENTSPHERE:${booking.id}:${event.id}:${booking.userId}:${newSeats}SEATS`;

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    if (seatDiff < 0) {
      this.checkAndPromoteWaitlist(event.id);
    }

    this.addNotification({
      userId: booking.userId,
      title: '✏️ แก้ไขจำนวนที่นั่งสำเร็จ',
      message: `การจอง ${event.title} ปรับเป็น ${newSeats} ที่นั่ง เรียบร้อยแล้ว`,
      type: 'booking_modified',
      link: 'my-bookings'
    });

    this.notify('BOOKING_UPDATED', booking);
    this.notify('EVENT_UPDATED', event);
    return booking;
  }

  cancelBooking(bookingId, isAdmin = false) {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('ไม่พบข้อมูลการจอง');

    if (booking.status === 'cancelled') {
      throw new Error('รายการนี้ถูกยกเลิกไปแล้ว');
    }

    const events = this.getEvents();
    const event = events.find(e => e.id === booking.eventId);

    if (event && !isAdmin) {
      const eventDateTime = new Date(`${event.date}T00:00:00`).getTime();
      const now = Date.now();
      const diffHours = (eventDateTime - now) / (1000 * 60 * 60);

      if (diffHours < 24) {
        throw new Error('ไม่สามารถยกเลิกได้ เนื่องจากเหลือน้อยกว่า 24 ชั่วโมงก่อนวันจัดกิจกรรม');
      }
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();

    if (event) {
      event.bookedSeats = Math.max(0, event.bookedSeats - booking.seats);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    if (event) {
      this.checkAndPromoteWaitlist(event.id);
    }

    this.addNotification({
      userId: booking.userId,
      title: '❌ ยกเลิกการจองสำเร็จ',
      message: `การจอง ${event ? event.title : 'กิจกรรม'} (รหัส ${booking.refCode}) ถูกยกเลิกเรียบร้อยแล้ว`,
      type: 'booking_cancelled',
      link: 'my-bookings'
    });

    this.notify('BOOKING_UPDATED', booking);
    if (event) this.notify('EVENT_UPDATED', event);
    return booking;
  }

  checkInBooking(bookingId) {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === bookingId || b.refCode === bookingId);
    if (!booking) throw new Error('ไม่พบรหัสบัตรเข้าร่วมงาน');

    if (booking.status === 'cancelled') {
      throw new Error('บัตรนี้ถูกยกเลิกแล้ว ไม่สามารถเช็คอินได้');
    }

    if (booking.status === 'checked_in') {
      return { booking, alreadyCheckedIn: true };
    }

    booking.status = 'checked_in';
    booking.checkedInAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    this.notify('BOOKING_UPDATED', booking);
    return { booking, alreadyCheckedIn: false };
  }

  getWaitlists() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WAITLISTS) || '[]');
  }

  getEventWaitlist(eventId) {
    return this.getWaitlists().filter(w => w.eventId === eventId && w.status === 'waiting');
  }

  joinWaitlist(eventId, userData) {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error('ไม่พบข้อมูลกิจกรรม');

    const waitlists = this.getWaitlists();
    const existing = waitlists.find(w => w.eventId === eventId && w.userId === userData.userId && w.status === 'waiting');
    if (existing) {
      throw new Error('ท่านได้ลงชื่อในคิวสำรองของกิจกรรมนี้ไว้แล้ว (คิวที่ #' + existing.queueNumber + ')');
    }

    const eventQueue = this.getEventWaitlist(eventId);
    const queueNumber = eventQueue.length + 1;

    const newWaitlistEntry = {
      id: 'wl-' + Date.now().toString(36),
      eventId,
      userId: userData.userId,
      userName: userData.name,
      userEmail: userData.email,
      userPhone: userData.phone,
      seats: Number(userData.seats) || 1,
      queueNumber,
      status: 'waiting',
      createdAt: new Date().toISOString()
    };

    waitlists.push(newWaitlistEntry);
    localStorage.setItem(STORAGE_KEYS.WAITLISTS, JSON.stringify(waitlists));

    this.addNotification({
      userId: userData.userId,
      title: '⏳ ลงชื่อในคิวสำรองสำเร็จ',
      message: `คุณอยู่ในคิวสำรองลำดับที่ #${queueNumber} สำหรับกิจกรรม ${event.title} ระบบจะแจ้งเตือนทันทีเมื่อมีที่ว่าง`,
      type: 'waitlist_joined',
      link: 'my-bookings'
    });

    this.notify('WAITLIST_UPDATED', newWaitlistEntry);
    return newWaitlistEntry;
  }

  checkAndPromoteWaitlist(eventId) {
    const event = this.getEventById(eventId);
    if (!event) return;

    const remaining = event.capacity - event.bookedSeats;
    if (remaining <= 0) return;

    const waitlists = this.getWaitlists();
    const candidate = waitlists.find(w => w.eventId === eventId && w.status === 'waiting' && w.seats <= remaining);

    if (candidate) {
      candidate.status = 'promoted';
      candidate.promotedAt = new Date().toISOString();

      const idNum = Math.floor(100000 + Math.random() * 900000);
      const promotedBooking = {
        id: `bk-${idNum}`,
        refCode: `EVT-${idNum}`,
        userId: candidate.userId,
        eventId: candidate.eventId,
        attendeeName: candidate.userName,
        attendeeEmail: candidate.userEmail,
        attendeePhone: candidate.userPhone,
        seats: candidate.seats,
        totalPrice: (event.price || 0) * candidate.seats,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        eventDate: event.date,
        qrPayload: `EVENTSPHERE:bk-${idNum}:${event.id}:${candidate.userId}:${candidate.seats}SEATS`,
        promotedFromWaitlist: true
      };

      const bookings = this.getBookings();
      bookings.unshift(promotedBooking);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

      event.bookedSeats += candidate.seats;
      const events = this.getEvents();
      const idx = events.findIndex(e => e.id === event.id);
      if (idx >= 0) events[idx] = event;
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEYS.WAITLISTS, JSON.stringify(waitlists));

      this.addNotification({
        userId: candidate.userId,
        title: '🎉 ยินดีด้วย! คุณได้รับสิทธิ์ที่นั่งจากคิวสำรอง',
        message: `คุณได้รับการเลื่อนคิวเป็นผู้เข้าร่วมงาน ${event.title} (${candidate.seats} ที่นั่ง) แล้ว รหัสการจอง: ${promotedBooking.refCode}`,
        type: 'waitlist_promoted',
        link: 'my-bookings'
      });

      this.notify('WAITLIST_PROMOTED', { candidate, promotedBooking });
      this.notify('EVENT_UPDATED', event);
    }
  }

  getNotifications(userId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    return all.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  addNotification(notifData) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const newNotif = {
      id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      userId: notifData.userId,
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'info',
      timestamp: new Date().toISOString(),
      read: false,
      link: notifData.link || 'home'
    };
    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notify('NOTIFICATION_ADDED', newNotif);
    return newNotif;
  }

  markAllNotificationsRead(userId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    all.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notify('NOTIFICATIONS_READ', userId);
  }

  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[1]));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.WAITLISTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    this.notify('DATA_RESET', null);
  }
}

window.store = new EventStore();
