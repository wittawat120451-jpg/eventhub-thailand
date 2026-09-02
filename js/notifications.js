/**
 * EVENTSPHERE - Notifications System (Email Template Preview & LINE Notify Simulator)
 */

class NotificationsModule {
  constructor() {
    this.initEventListeners();
    this.updateNotificationBell();
    this.checkPreEventReminders();

    window.store.subscribe((eventType) => {
      if (['NOTIFICATION_ADDED', 'NOTIFICATIONS_READ', 'USER_CHANGED', 'DATA_RESET'].includes(eventType)) {
        this.updateNotificationBell();
      }
    });
  }

  initEventListeners() {
    const bellBtn = document.getElementById('notifBellBtn');
    const dropdown = document.getElementById('notifDropdown');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

    if (bellBtn && dropdown) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        const userDropdown = document.getElementById('userProfileDropdown');
        if (userDropdown) userDropdown.classList.remove('show');
      });
    }

    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        const currentUser = window.store.getCurrentUser();
        if (currentUser) {
          window.store.markAllNotificationsRead(currentUser.id);
        }
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (dropdown && !dropdown.contains(e.target) && bellBtn && !bellBtn.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  updateNotificationBell() {
    const currentUser = window.store.getCurrentUser();
    const badge = document.getElementById('notifBadge');
    const listEl = document.getElementById('notifList');

    if (!currentUser) {
      if (badge) badge.style.display = 'none';
      if (listEl) {
        listEl.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือน</div>';
      }
      return;
    }

    const notifs = window.store.getNotifications(currentUser.id);
    const unreadCount = notifs.filter(n => !n.read).length;

    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    if (listEl) {
      if (notifs.length === 0) {
        listEl.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">ไม่มีการแจ้งเตือนใหม่</div>';
        return;
      }

      listEl.innerHTML = notifs.map(n => {
        let iconClass = 'fa-bell';
        let bgStyle = 'background: rgba(37,99,235,0.15); color: #3b82f6;';

        if (n.type === 'booking_success') {
          iconClass = 'fa-circle-check';
          bgStyle = 'background: rgba(16,185,129,0.15); color: #10b981;';
        } else if (n.type === 'event_reminder') {
          iconClass = 'fa-clock';
          bgStyle = 'background: rgba(245,158,11,0.15); color: #f59e0b;';
        } else if (n.type === 'waitlist_promoted') {
          iconClass = 'fa-star';
          bgStyle = 'background: rgba(139,92,246,0.15); color: #8b5cf6;';
        } else if (n.type === 'booking_cancelled') {
          iconClass = 'fa-circle-xmark';
          bgStyle = 'background: rgba(244,63,94,0.15); color: #f43f5e;';
        }

        const timeStr = this.formatTimeAgo(n.timestamp);

        return `
          <div class="notif-item ${n.read ? '' : 'unread'}" onclick="window.notificationsModule.handleNotificationClick('${n.id}', '${n.link}')">
            <div class="notif-icon-circle" style="${bgStyle}">
              <i class="fa-solid ${iconClass}"></i>
            </div>
            <div style="flex-grow: 1;">
              <div class="notif-title-text">${n.title}</div>
              <div class="notif-body-text">${n.message}</div>
              <div class="notif-time-text">${timeStr}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  handleNotificationClick(notifId, link) {
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.classList.remove('show');

    if (link === 'my-bookings') {
      window.app.navigate('my-bookings');
    }
  }

  formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'เมื่อสักครู่';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} นาทีที่แล้ว`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffSeconds / 86400)} วันที่แล้ว`;
  }

  // Pre-event reminder automated check (1 day before)
  checkPreEventReminders() {
    const currentUser = window.store.getCurrentUser();
    if (!currentUser) return;

    const bookings = window.store.getUserBookings(currentUser.id);
    const today = new Date();

    bookings.forEach(bk => {
      if (bk.status !== 'confirmed') return;

      const event = window.store.getEventById(bk.eventId);
      if (!event) return;

      const eventDate = new Date(event.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If event is exactly 1-2 days away and notification hasn't been added
      if (diffDays >= 0 && diffDays <= 1) {
        const notifs = window.store.getNotifications(currentUser.id);
        const alreadyNotified = notifs.some(n => n.type === 'event_reminder' && n.message.includes(event.title));

        if (!alreadyNotified) {
          window.store.addNotification({
            userId: currentUser.id,
            title: `⏰ แจ้งเตือน: กิจกรรม ${event.title} จะเริ่มในอีก ${diffDays === 0 ? 'วันนี้' : '1 วัน'}`,
            message: `อย่าลืมเตรียมบัตร E-Ticket และ QR Code เพื่อเช็คอิน ณ ${event.location} เวลา ${event.time}`,
            type: 'event_reminder',
            link: 'my-bookings'
          });
        }
      }
    });
  }

  // Show Simulated Email Preview Modal
  showEmailPreview(bookingId) {
    const booking = window.store.getBookingById(bookingId);
    if (!booking) return;

    const event = window.store.getEventById(booking.eventId);
    if (!event) return;

    const modal = document.getElementById('emailPreviewModal');
    const content = document.getElementById('emailPreviewContent');

    if (content) {
      content.innerHTML = `
        <div style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; font-family: 'Prompt', sans-serif; color: #1e293b;">
          <!-- Email Top Bar -->
          <div style="background: #1e293b; color: #94a3b8; padding: 0.75rem 1.25rem; font-size: 0.8rem; display: flex; justify-content: space-between;">
            <div><strong>จาก:</strong> no-reply@eventsphere.com (EventSphere Thailand)</div>
            <div><strong>ถึง:</strong> ${booking.attendeeEmail}</div>
          </div>

          <!-- Email Banner -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); padding: 2rem 1.5rem; text-align: center; color: #ffffff;">
            <div style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem;">EVENTSPHERE</div>
            <div style="font-size: 1rem; opacity: 0.9;">ยืนยันการจองบัตรเข้าร่วมกิจกรรมอย่างเป็นทางการ</div>
          </div>

          <!-- Email Body -->
          <div style="padding: 2rem 1.75rem; background: #ffffff;">
            <p style="font-size: 1.05rem; margin-bottom: 1.25rem;">เรียน คุณ <strong>${booking.attendeeName}</strong>,</p>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
              ขอขอบคุณสำหรับการจองบัตรเข้าร่วมกิจกรรมกับ EventSphere การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว รายละเอียดการจองของท่านมีดังนี้:
            </p>

            <div style="background: #f1f5f9; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; border-left: 4px solid #2563eb;">
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem;">${event.title}</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem;">
                <div><strong>รหัสการจอง:</strong> <span style="color: #2563eb; font-weight: 700;">${booking.refCode}</span></div>
                <div><strong>จำนวนที่นั่ง:</strong> ${booking.seats} ที่นั่ง</div>
                <div><strong>วันจัดงาน:</strong> ${window.eventsModule.formatThaiDate(event.date)}</div>
                <div><strong>เวลา:</strong> ${event.time}</div>
                <div style="grid-column: span 2;"><strong>สถานที่:</strong> ${event.location}</div>
                <div style="grid-column: span 2;"><strong>ยอดชำระ:</strong> ${booking.totalPrice === 0 ? 'ฟรีไม่มีค่าใช้จ่าย' : `฿${booking.totalPrice.toLocaleString()} (ชำระแล้ว)`}</div>
              </div>
            </div>

            <div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: #fafafa; border: 1px dashed #cbd5e1; border-radius: 8px;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.75rem;">บัตร E-Ticket และ QR Code เช็คอิน</div>
              <div style="display: inline-block; background: #fff; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                ${window.bookingModule.generateQRCodeSVG(booking.qrPayload)}
              </div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">โปรดแสดง QR Code นี้แก่เจ้าหน้าที่ ณ จุดลงทะเบียนเข้างาน</div>
            </div>

            <p style="font-size: 0.88rem; color: #64748b; line-height: 1.5;">
              * หากท่านต้องการเปลี่ยนแปลงหรือยกเลิกการจอง กรุณาดำเนินการผ่านระบบล่วงหน้าอย่างน้อย 24 ชั่วโมงก่อนวันจัดกิจกรรม
            </p>
          </div>

          <!-- Email Footer -->
          <div style="background: #f8fafc; padding: 1rem; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #94a3b8;">
            &copy; 2026 EventSphere Thailand. All rights reserved. &bull; Contact: support@eventsphere.com
          </div>
        </div>
      `;
    }

    modal.classList.add('show');
  }

  closeEmailPreview() {
    const modal = document.getElementById('emailPreviewModal');
    if (modal) modal.classList.remove('show');
  }

  // Trigger Simulated LINE Notify Message Alert Popup
  triggerLineNotifySimulator(data) {
    const modal = document.getElementById('lineNotifyModal');
    const content = document.getElementById('lineNotifyContent');

    if (!modal || !content) return;

    content.innerHTML = `
      <div class="line-flex-card">
        <div class="line-header">
          <div class="line-brand">
            <i class="fa-brands fa-line" style="font-size: 1.5rem;"></i>
            <span>LINE Notify</span>
          </div>
          <span style="font-size: 0.75rem; opacity: 0.9;">EventSphere Bot</span>
        </div>

        <div class="line-body">
          <div class="line-event-title">${data.title}</div>
          
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            ${data.items.map(item => `
              <div class="line-info-row">
                <span class="label">${item.label}</span>
                <span class="val">${item.val}</span>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; text-align: right; font-size: 0.75rem; color: #94a3b8;">
            ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
          </div>
        </div>
      </div>
    `;

    modal.classList.add('show');
  }

  closeLineNotifyModal() {
    const modal = document.getElementById('lineNotifyModal');
    if (modal) modal.classList.remove('show');
  }
}

// Global Notifications Instance
window.notificationsModule = new NotificationsModule();
