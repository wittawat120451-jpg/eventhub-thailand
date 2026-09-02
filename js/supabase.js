/**
 * EVENTSPHERE - Supabase Integration Client Module
 * Provides seamless connection, real-time sync, and offline fallback to localStorage
 */

const SUPABASE_STORAGE_KEYS = {
  URL: 'eventsphere_supabase_url',
  ANON_KEY: 'eventsphere_supabase_key',
  IS_CONNECTED: 'eventsphere_supabase_connected'
};

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initClient();
    this.initEventListeners();
  }

  initClient() {
    const defaultUrl = 'https://mgyskmcohldmqxjsixhc.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neXNrbWNvaGxkbXF4anNpeGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTY1OTksImV4cCI6MjEwMzg3MjU5OX0.xFu_CGf7ftkgnosE5WtYj-HVWBeiN9wyrK3kXSCwWdE';

    let url = localStorage.getItem(SUPABASE_STORAGE_KEYS.URL) || defaultUrl;
    let key = localStorage.getItem(SUPABASE_STORAGE_KEYS.ANON_KEY) || defaultKey;

    localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, url);
    localStorage.setItem(SUPABASE_STORAGE_KEYS.ANON_KEY, key);

    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this.client = window.supabase.createClient(url, key);
        this.testConnection().then(connected => {
          this.isConnected = connected;
          this.updateConnectionBadgeUI();
          if (connected) {
            this.syncDataFromSupabase();
            this.subscribeRealtime();
          }
        });
      } catch (e) {
        console.warn('Supabase initialization error:', e);
        this.isConnected = false;
        this.updateConnectionBadgeUI();
      }
    } else {
      this.updateConnectionBadgeUI();
    }
  }

  initEventListeners() {
    // Open Supabase Settings Modal
    document.querySelectorAll('[data-action="open-supabase-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.openSettingsModal());
    });

    // Save Supabase Configuration Form
    const form = document.getElementById('supabaseConfigForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleConfigSubmit(e));
    }

    // Disconnect Supabase Button
    const disconnectBtn = document.getElementById('supabaseDisconnectBtn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => this.disconnect());
    }

    // Copy SQL Schema Button
    const copySqlBtn = document.getElementById('copySqlSchemaBtn');
    if (copySqlBtn) {
      copySqlBtn.addEventListener('click', () => this.copySqlSchema());
    }
  }

  async testConnection() {
    if (!this.client) return false;
    try {
      const { data, error } = await this.client.from('events').select('id').limit(1);
      return !error;
    } catch (e) {
      return false;
    }
  }

  openSettingsModal() {
    const modal = document.getElementById('supabaseModal');
    const urlInput = document.getElementById('supabaseUrlInput');
    const keyInput = document.getElementById('supabaseKeyInput');

    if (urlInput) urlInput.value = localStorage.getItem(SUPABASE_STORAGE_KEYS.URL) || '';
    if (keyInput) keyInput.value = localStorage.getItem(SUPABASE_STORAGE_KEYS.ANON_KEY) || '';

    this.updateModalStatusUI();
    if (modal) modal.classList.add('show');
  }

  closeSettingsModal() {
    const modal = document.getElementById('supabaseModal');
    if (modal) modal.classList.remove('show');
  }

  async handleConfigSubmit(e) {
    e.preventDefault();
    const url = document.getElementById('supabaseUrlInput').value.trim();
    const key = document.getElementById('supabaseKeyInput').value.trim();

    if (!url || !key) {
      window.app.showToast('กรุณากรอก Supabase URL และ Anon Key ให้ครบถ้วน', 'warning');
      return;
    }

    if (!window.supabase) {
      window.app.showToast('ไม่พบไลบรารี Supabase JS SDK', 'error');
      return;
    }

    try {
      window.app.showToast('กำลังทดสอบการเชื่อมต่อไปยัง Supabase...', 'info');
      const testClient = window.supabase.createClient(url, key);
      const { data, error } = await testClient.from('events').select('id').limit(1);

      if (error) {
        throw new Error(error.message || 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณารัน schema.sql ใน Supabase SQL Editor ก่อน');
      }

      // Save credentials
      localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, url);
      localStorage.setItem(SUPABASE_STORAGE_KEYS.ANON_KEY, key);
      localStorage.setItem(SUPABASE_STORAGE_KEYS.IS_CONNECTED, 'true');

      this.client = testClient;
      this.isConnected = true;
      this.updateConnectionBadgeUI();
      this.updateModalStatusUI();

      await this.syncDataFromSupabase();
      this.subscribeRealtime();

      window.app.showToast('🟢 เชื่อมต่อ Supabase สำเร็จเรียบร้อย!', 'success');
    } catch (err) {
      window.app.showToast(`การเชื่อมต่อล้มเหลว: ${err.message}`, 'error');
    }
  }

  disconnect() {
    localStorage.removeItem(SUPABASE_STORAGE_KEYS.URL);
    localStorage.removeItem(SUPABASE_STORAGE_KEYS.ANON_KEY);
    localStorage.removeItem(SUPABASE_STORAGE_KEYS.IS_CONNECTED);
    this.client = null;
    this.isConnected = false;
    this.updateConnectionBadgeUI();
    this.updateModalStatusUI();
    window.app.showToast('ตัดการเชื่อมต่อ Supabase แล้ว (ระบบจะใช้ LocalStorage อัตโนมัติ)', 'info');
  }

  updateConnectionBadgeUI() {
    const badge = document.getElementById('supabaseStatusBadge');
    if (!badge) return;

    if (this.isConnected) {
      badge.innerHTML = '<i class="fa-solid fa-circle" style="color: #10b981; font-size: 0.65rem;"></i> <span>Supabase: เชื่อมต่อแล้ว</span>';
      badge.className = 'badge badge-success';
    } else {
      badge.innerHTML = '<i class="fa-solid fa-circle" style="color: #94a3b8; font-size: 0.65rem;"></i> <span>Supabase: โหมดออฟไลน์ (Local)</span>';
      badge.className = 'badge badge-secondary';
    }
  }

  updateModalStatusUI() {
    const statusBox = document.getElementById('supabaseModalStatusBox');
    if (!statusBox) return;

    if (this.isConnected) {
      statusBox.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 1rem; color: var(--accent-emerald); font-size: 0.88rem; display: flex; align-items: center; justify-content: space-between;">
          <div><i class="fa-solid fa-circle-check"></i> เชื่อมต่อฐานข้อมูล Supabase เรียบร้อยแล้ว (Realtime Sync Active)</div>
          <button type="button" class="btn btn-danger btn-sm" id="supabaseDisconnectBtn">ตัดการเชื่อมต่อ</button>
        </div>
      `;
      const btn = document.getElementById('supabaseDisconnectBtn');
      if (btn) btn.addEventListener('click', () => this.disconnect());
    } else {
      statusBox.innerHTML = `
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 1rem; color: var(--accent-amber); font-size: 0.88rem;">
          <i class="fa-solid fa-triangle-exclamation"></i> ยังไม่ได้เชื่อมต่อ Supabase (ระบบกำลังทำงานในโหมด Offline LocalStorage อย่างสมบูรณ์)
        </div>
      `;
    }
  }

  // Sync Data between Supabase and Local
  async syncDataFromSupabase() {
    if (!this.client || !this.isConnected) return;
    try {
      // Sync Events
      const { data: events, error: errEvents } = await this.client.from('events').select('*');
      if (!errEvents && events && events.length > 0) {
        // Map database columns to app keys
        const mappedEvents = events.map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          date: e.date,
          time: e.time,
          location: e.location,
          description: e.description,
          speaker: e.speaker,
          capacity: e.capacity,
          bookedSeats: e.booked_seats || 0,
          price: Number(e.price) || 0,
          imageUrl: e.image_url,
          organizer: e.organizer,
          featured: e.featured,
          tags: e.tags || []
        }));
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mappedEvents));
        window.store.notify('EVENT_UPDATED', null);
      }

      // Sync Bookings
      const { data: bookings, error: errBookings } = await this.client.from('bookings').select('*');
      if (!errBookings && bookings) {
        const mappedBookings = bookings.map(b => ({
          id: b.id,
          refCode: b.ref_code,
          userId: b.user_id,
          eventId: b.event_id,
          attendeeName: b.attendee_name,
          attendeeEmail: b.attendee_email,
          attendeePhone: b.attendee_phone,
          seats: b.seats,
          totalPrice: Number(b.total_price) || 0,
          status: b.status,
          createdAt: b.created_at,
          eventDate: b.event_date,
          qrPayload: b.qr_payload,
          checkedInAt: b.checked_in_at
        }));
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(mappedBookings));
        window.store.notify('BOOKING_UPDATED', null);
      }
    } catch (e) {
      console.warn('Sync from Supabase failed:', e);
    }
  }

  // Push new booking to Supabase
  async pushBooking(booking) {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.from('bookings').insert([{
        id: booking.id,
        ref_code: booking.refCode,
        user_id: booking.userId,
        event_id: booking.eventId,
        attendee_name: booking.attendeeName,
        attendee_email: booking.attendeeEmail,
        attendee_phone: booking.attendeePhone,
        seats: booking.seats,
        total_price: booking.totalPrice,
        status: booking.status,
        event_date: booking.eventDate,
        qr_payload: booking.qrPayload
      }]);

      // Update booked seats on event table in Supabase
      const event = window.store.getEventById(booking.eventId);
      if (event) {
        await this.client.from('events').update({ booked_seats: event.bookedSeats }).eq('id', event.id);
      }
    } catch (e) {
      console.warn('Failed to push booking to Supabase:', e);
    }
  }

  // Push event update to Supabase
  async pushEvent(event) {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.from('events').upsert([{
        id: event.id,
        title: event.title,
        category: event.category,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description,
        speaker: event.speaker,
        capacity: event.capacity,
        booked_seats: event.bookedSeats,
        price: event.price,
        image_url: event.imageUrl,
        organizer: event.organizer,
        featured: event.featured,
        tags: event.tags || []
      }]);
    } catch (e) {
      console.warn('Failed to push event to Supabase:', e);
    }
  }

  // Push booking status (e.g. check-in or cancel)
  async updateBookingStatus(bookingId, status, extra = {}) {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.from('bookings').update({ status, ...extra }).eq('id', bookingId);
    } catch (e) {
      console.warn('Failed to update booking status in Supabase:', e);
    }
  }

  // Realtime subscription
  subscribeRealtime() {
    if (!this.client || !this.isConnected) return;
    try {
      this.client
        .channel('public:all_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
          this.syncDataFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
          this.syncDataFromSupabase();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  copySqlSchema() {
    const sqlText = `-- EVENTSPHERE SUPABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, date DATE NOT NULL,
  time TEXT NOT NULL, location TEXT NOT NULL, description TEXT, speaker TEXT,
  capacity INTEGER NOT NULL DEFAULT 50, booked_seats INTEGER NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0, image_url TEXT, organizer TEXT, featured BOOLEAN DEFAULT FALSE, tags TEXT[]
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY, ref_code TEXT UNIQUE NOT NULL, user_id TEXT NOT NULL,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL, attendee_email TEXT NOT NULL, attendee_phone TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1, total_price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed', event_date DATE, qr_payload TEXT
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(sqlText).then(() => {
        window.app.showToast('คัดลอกคำสั่ง SQL Schema เรียบร้อยแล้ว!', 'success');
      });
    } else {
      window.app.showToast('กรุณาคัดลอกจากไฟล์ schema.sql ในโฟลเดอร์โปรเจกต์', 'info');
    }
  }
}

// Global Supabase Service Instance
window.supabaseService = new SupabaseService();
