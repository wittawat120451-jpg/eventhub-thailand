/**
 * EVENTSPHERE - Booking, Waiting List, E-Ticket & My Bookings Management
 */

class BookingModule {
  constructor() {
    this.currentEvent = null;
    this.selectedSeats = 1;
    this.initEventListeners();
    this.renderMyBookings();

    window.store.subscribe((eventType) => {
      if (['BOOKING_CREATED', 'BOOKING_UPDATED', 'WAITLIST_UPDATED', 'WAITLIST_PROMOTED', 'USER_CHANGED', 'DATA_RESET'].includes(eventType)) {
        this.renderMyBookings();
      }
    });
  }

  initEventListeners() {
    // Booking Modal Form Submit
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));
    }

    // Seats increment/decrement buttons
    const btnDec = document.getElementById('seatBtnDec');
    const btnInc = document.getElementById('seatBtnInc');
    if (btnDec && btnInc) {
      btnDec.addEventListener('click', () => this.changeSeatCount(-1));
      btnInc.addEventListener('click', () => this.changeSeatCount(1));
    }

    // Print Ticket Button
    const printBtn = document.getElementById('printTicketBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // Email Preview button on ticket modal
    const emailPreviewBtn = document.getElementById('ticketEmailPreviewBtn');
    if (emailPreviewBtn) {
      emailPreviewBtn.addEventListener('click', () => {
        const lastBookingId = emailPreviewBtn.getAttribute('data-booking-id');
        if (lastBookingId) {
          window.notificationsModule.showEmailPreview(lastBookingId);
        }
      });
    }

    // Modify Booking Form Submit
    const modifyForm = document.getElementById('modifyBookingForm');
    if (modifyForm) {
      modifyForm.addEventListener('submit', (e) => this.handleModifyBookingSubmit(e));
    }
  }

  openBookingModal(eventId) {
    const event = window.store.getEventById(eventId);
    if (!event) return;

    this.currentEvent = event;
    const remaining = Math.max(0, event.capacity - event.bookedSeats);
    const isSoldOut = remaining === 0;

    const modal = document.getElementById('bookingModal');
    const titleEl = document.getElementById('bookingModalTitle');
    const eventSummaryEl = document.getElementById('bookingEventSummary');
    const submitBtn = document.getElementById('bookingSubmitBtn');
    const seatsPickerGroup = document.getElementById('bookingSeatsGroup');
    const waitlistNotice = document.getElementById('bookingWaitlistNotice');

    if (titleEl) {
      titleEl.innerHTML = isSoldOut 
        ? '<i class="fa-solid fa-user-clock" style="color: var(--accent-amber);"></i> ลงชื่อในคิวสำรอง (Waiting List)'
        : '<i class="fa-solid fa-ticket" style="color: var(--primary-500);"></i> จองบัตรเข้าร่วมกิจกรรม';
    }

    if (eventSummaryEl) {
      eventSummaryEl.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: center; background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
          <img src="${event.imageUrl}" alt="${event.title}" style="width: 70px; height: 70px; border-radius: var(--radius-md); object-fit: cover;">
          <div style="flex-grow: 1;">
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">${event.title}</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${window.eventsModule.formatThaiDate(event.date)} &bull; ${event.time}</p>
            <p style="font-size: 0.82rem; color: var(--accent-sky); font-weight: 700;">${event.price === 0 ? 'ฟรีไม่มีค่าใช้จ่าย' : `฿${event.price.toLocaleString()} / ที่นั่ง`}</p>
          </div>
        </div>
      `;
    }

    // Populate user info if logged in
    const currentUser = window.store.getCurrentUser();
    const nameInput = document.getElementById('bookName');
    const emailInput = document.getElementById('bookEmail');
    const phoneInput = document.getElementById('bookPhone');

    if (currentUser) {
      if (nameInput) nameInput.value = currentUser.name || '';
      if (emailInput) emailInput.value = currentUser.email || '';
      if (phoneInput) phoneInput.value = currentUser.phone || '';
    }

    this.selectedSeats = 1;
    this.updateSeatCountUI();

    if (isSoldOut) {
      const waitlist = window.store.getEventWaitlist(event.id);
      const nextQueue = waitlist.length + 1;
      if (waitlistNotice) {
        waitlistNotice.style.display = 'block';
        waitlistNotice.innerHTML = `
          <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem; font-size: 0.9rem; color: var(--accent-amber);">
            <div style="font-weight: 700; margin-bottom: 0.25rem;"><i class="fa-solid fa-triangle-exclamation"></i> ที่นั่งรอบนี้เต็มแล้ว</div>
            <div>คุณจะได้รับสิทธิ์เป็น <strong>คิวสำรองลำดับที่ #${nextQueue}</strong> เมื่อมีผู้ยกเลิกหรือเพิ่มโควตา ระบบจะเลื่อนคุณเป็นตัวจริงและส่งแจ้งเตือนทันที</div>
          </div>
        `;
      }
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-user-clock"></i> ยืนยันการเข้าคิวสำรอง';
        submitBtn.className = 'btn btn-warning btn-full';
      }
    } else {
      if (waitlistNotice) waitlistNotice.style.display = 'none';
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> ยืนยันการจองบัตร';
        submitBtn.className = 'btn btn-primary btn-full';
      }
    }

    modal.classList.add('show');
  }

  closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('show');
  }

  changeSeatCount(delta) {
    if (!this.currentEvent) return;
    const remaining = Math.max(1, this.currentEvent.capacity - this.currentEvent.bookedSeats);
    const maxLimit = Math.min(10, remaining);

    let next = this.selectedSeats + delta;
    if (next < 1) next = 1;
    if (next > maxLimit) {
      window.app.showToast(`สามารถเลือกได้สูงสุด ${maxLimit} ที่นั่งตามโควตาที่เหลือ`, 'warning');
      next = maxLimit;
    }

    this.selectedSeats = next;
    this.updateSeatCountUI();
  }

  updateSeatCountUI() {
    const countEl = document.getElementById('selectedSeatCount');
    const totalEl = document.getElementById('bookingTotalPrice');
    const decBtn = document.getElementById('seatBtnDec');
    const incBtn = document.getElementById('seatBtnInc');

    if (countEl) countEl.textContent = this.selectedSeats;

    if (this.currentEvent && totalEl) {
      const total = (this.currentEvent.price || 0) * this.selectedSeats;
      totalEl.textContent = total === 0 ? 'ฟรี (฿0)' : `฿${total.toLocaleString()}`;
    }

    if (decBtn) decBtn.disabled = this.selectedSeats <= 1;
    if (this.currentEvent && incBtn) {
      const remaining = Math.max(1, this.currentEvent.capacity - this.currentEvent.bookedSeats);
      incBtn.disabled = this.selectedSeats >= Math.min(10, remaining);
    }
  }

  handleBookingSubmit(e) {
    e.preventDefault();
    if (!this.currentEvent) return;

    const name = document.getElementById('bookName').value.trim();
    const email = document.getElementById('bookEmail').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();

    // Validation
    if (!name || !email || !phone) {
      window.app.showToast('กรุณากรอกข้อมูลผู้จองให้ครบถ้วน', 'error');
      return;
    }

    // Phone format check (Thai phone: 9-10 digits)
    const phoneClean = phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 9 || phoneClean.length > 10) {
      window.app.showToast('กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (9-10 หลัก)', 'error');
      return;
    }

    const currentUser = window.store.getCurrentUser();
    const userId = currentUser ? currentUser.id : 'usr-' + Date.now().toString(36);

    const remaining = Math.max(0, this.currentEvent.capacity - this.currentEvent.bookedSeats);

    try {
      if (remaining === 0) {
        // Handle Waiting List
        const waitlistEntry = window.store.joinWaitlist(this.currentEvent.id, {
          userId,
          name,
          email,
          phone,
          seats: this.selectedSeats
        });

        this.closeBookingModal();
        window.app.showToast(`ลงชื่อในคิวสำรองลำดับที่ #${waitlistEntry.queueNumber} สำเร็จแล้ว!`, 'success');
        
        // Show simulated LINE Notify alert
        window.notificationsModule.triggerLineNotifySimulator({
          title: `⏳ ลงชื่อในคิวสำรอง: ${this.currentEvent.title}`,
          items: [
            { label: 'ผู้จอง', val: name },
            { label: 'ลำดับคิว', val: `#${waitlistEntry.queueNumber}` },
            { label: 'จำนวนที่นั่ง', val: `${this.selectedSeats} ที่นั่ง` },
            { label: 'สถานะ', val: 'รอการจัดสรรที่นั่งว่าง' }
          ]
        });

      } else {
        // Handle Confirmed Booking
        const booking = window.store.createBooking({
          userId,
          eventId: this.currentEvent.id,
          attendeeName: name,
          attendeeEmail: email,
          attendeePhone: phone,
          seats: this.selectedSeats
        });

        this.closeBookingModal();
        this.triggerConfetti();
        window.app.showToast('🎉 จองบัตรสำเร็จเรียบร้อยแล้ว!', 'success');

        // Show E-Ticket
        this.showETicketModal(booking.id);

        // Show simulated LINE Notify alert
        window.notificationsModule.triggerLineNotifySimulator({
          title: `🎟️ จองบัตรสำเร็จ: ${this.currentEvent.title}`,
          items: [
            { label: 'รหัสการจอง', val: booking.refCode },
            { label: 'ผู้จอง', val: booking.attendeeName },
            { label: 'วันจัดงาน', val: window.eventsModule.formatThaiDate(this.currentEvent.date) },
            { label: 'เวลา', val: this.currentEvent.time },
            { label: 'จำนวน', val: `${booking.seats} ที่นั่ง` },
            { label: 'ยอดชำระ', val: booking.totalPrice === 0 ? 'ฟรี' : `฿${booking.totalPrice.toLocaleString()}` }
          ]
        });
      }
    } catch (err) {
      window.app.showToast(err.message, 'error');
    }
  }

  showETicketModal(bookingId) {
    const booking = window.store.getBookingById(bookingId);
    if (!booking) return;

    const event = window.store.getEventById(booking.eventId);
    if (!event) return;

    const modal = document.getElementById('ticketModal');
    const container = document.getElementById('ticketContainer');
    const emailPreviewBtn = document.getElementById('ticketEmailPreviewBtn');

    if (emailPreviewBtn) {
      emailPreviewBtn.setAttribute('data-booking-id', booking.id);
    }

    if (container) {
      const qrDataUrl = this.generateQRCodeSVG(booking.qrPayload || booking.refCode);
      const formattedDate = window.eventsModule.formatThaiDate(event.date);

      container.innerHTML = `
        <div class="ticket-card" id="printableTicketSection">
          <div class="ticket-header">
            <div class="ticket-brand">EVENTSPHERE E-TICKET</div>
            <div class="ticket-title">${event.title}</div>
          </div>

          <div class="ticket-divider-dashed">
            <div class="ticket-notch-right"></div>
          </div>

          <div class="ticket-body">
            <div class="ticket-details">
              <div class="ticket-row">
                <span class="ticket-label">ชื่อผู้ถือบัตร / Attendee</span>
                <span class="ticket-value">${booking.attendeeName}</span>
              </div>

              <div class="ticket-row">
                <span class="ticket-label">วันและเวลา / Date & Time</span>
                <span class="ticket-value">${formattedDate} (${event.time})</span>
              </div>

              <div class="ticket-row">
                <span class="ticket-label">สถานที่ / Venue</span>
                <span class="ticket-value">${event.location}</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="ticket-row">
                  <span class="ticket-label">จำนวนที่นั่ง / Seats</span>
                  <span class="ticket-value" style="color: var(--primary-500);">${booking.seats} ที่นั่ง</span>
                </div>
                <div class="ticket-row">
                  <span class="ticket-label">สถานะ / Status</span>
                  <span class="ticket-value" style="color: ${booking.status === 'checked_in' ? 'var(--accent-emerald)' : 'var(--accent-sky)'};">
                    ${booking.status === 'checked_in' ? '✓ เช็คอินแล้ว' : '✓ ยืนยันการจอง'}
                  </span>
                </div>
              </div>
            </div>

            <div class="ticket-qr-section">
              <div class="ticket-qr-canvas">
                ${qrDataUrl}
              </div>
              <div class="ticket-ref-code">${booking.refCode}</div>
              <span style="font-size: 0.72rem; color: #64748b;">สแกนเพื่อเช็คอินหน้างาน</span>
            </div>
          </div>
        </div>
      `;
    }

    modal.classList.add('show');
  }

  closeETicketModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) modal.classList.remove('show');
  }

  // Pure SVG QR Code Generator Simulation
  generateQRCodeSVG(text) {
    // Generate an authentic high-contrast SVG QR Matrix pattern
    const size = 130;
    const modules = 25;
    const cellSize = size / modules;

    // Pseudo-random deterministic hash based on text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    let rects = '';
    // Corner Position Detection Patterns (Finder Patterns)
    const drawFinder = (x, y) => {
      rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#0f172a"/>`;
      rects += `<rect x="${(x + 1) * cellSize}" y="${(y + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#ffffff"/>`;
      rects += `<rect x="${(x + 2) * cellSize}" y="${(y + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#0f172a"/>`;
    };

    drawFinder(1, 1);
    drawFinder(modules - 8, 1);
    drawFinder(1, modules - 8);

    // Random data cells
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Skip finder zones
        if ((r < 9 && c < 9) || (r < 9 && c > modules - 10) || (r > modules - 10 && c < 9)) {
          continue;
        }
        const cellHash = (hash ^ (r * 31 + c * 17)) & 1;
        if (cellHash === 1 || (r % 2 === 0 && c % 3 === 0)) {
          rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
        }
      }
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border-radius:6px;padding:4px;">${rects}</svg>`;
  }

  // --- My Bookings Page View ---
  renderMyBookings() {
    const container = document.getElementById('myBookingsList');
    const emptyState = document.getElementById('myBookingsEmpty');
    const currentUser = window.store.getCurrentUser();

    if (!container) return;

    if (!currentUser) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-xl); border: 1px dashed var(--border-color);">
          <i class="fa-solid fa-user-lock" style="font-size: 3rem; color: var(--primary-400); margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.25rem; color: var(--text-primary); font-weight: 700; margin-bottom: 0.5rem;">กรุณาเข้าสู่ระบบ</h3>
          <p style="font-size: 0.95rem; margin-bottom: 1.5rem;">เข้าสู่ระบบเพื่อดูประวัติการจองและตั๋ว E-Ticket ของคุณ</p>
          <button class="btn btn-primary" onclick="window.auth.showAuthModal('login')">
            <i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบทันที
          </button>
        </div>
      `;
      return;
    }

    const bookings = window.store.getUserBookings(currentUser.id);
    const waitlists = window.store.getWaitlists().filter(w => w.userId === currentUser.id && w.status === 'waiting');

    if (bookings.length === 0 && waitlists.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    let html = '';

    // 1. Render Waiting Lists if any
    if (waitlists.length > 0) {
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: var(--accent-amber); display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-user-clock"></i> รายการคิวสำรองที่รอจัดสรร (${waitlists.length})
          </h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${waitlists.map(wl => {
              const event = window.store.getEventById(wl.eventId);
              return `
                <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                  <div>
                    <span class="badge badge-warning" style="margin-bottom: 0.4rem;">คิวสำรองลำดับที่ #${wl.queueNumber}</span>
                    <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${event ? event.title : 'กิจกรรม'}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${event ? window.eventsModule.formatThaiDate(event.date) : ''} &bull; ${wl.seats} ที่นั่ง</p>
                  </div>
                  <div>
                    <span style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">ระบบจะแจ้งเตือนเมื่อถึงคิวของคุณ</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 2. Render Bookings
    if (bookings.length > 0) {
      html += `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${bookings.map(bk => {
            const event = window.store.getEventById(bk.eventId);
            const isCancelled = bk.status === 'cancelled';
            const isCheckedIn = bk.status === 'checked_in';

            let statusBadge = '<span class="badge badge-success"><i class="fa-solid fa-check"></i> ยืนยันแล้ว</span>';
            if (isCheckedIn) {
              statusBadge = '<span class="badge badge-info"><i class="fa-solid fa-qrcode"></i> เช็คอินแล้ว</span>';
            } else if (isCancelled) {
              statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> ยกเลิกแล้ว</span>';
            }

            return `
              <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.5rem; display: grid; grid-template-columns: auto 1fr auto; gap: 1.5rem; align-items: center; box-shadow: var(--shadow-sm);">
                <img src="${event ? event.imageUrl : ''}" alt="${event ? event.title : ''}" style="width: 100px; height: 100px; border-radius: var(--radius-lg); object-fit: cover;">
                
                <div>
                  <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem;">
                    ${statusBadge}
                    <span style="font-family: monospace; font-size: 0.82rem; color: var(--text-muted);">รหัส: ${bk.refCode}</span>
                  </div>
                  <h4 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">
                    ${event ? event.title : 'กิจกรรม'}
                  </h4>
                  <div style="font-size: 0.88rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 1rem;">
                    <span><i class="fa-regular fa-calendar" style="color: var(--primary-500);"></i> ${event ? window.eventsModule.formatThaiDate(event.date) : ''} (${event ? event.time : ''})</span>
                    <span><i class="fa-solid fa-chair" style="color: var(--primary-500);"></i> ${bk.seats} ที่นั่ง</span>
                    <span><i class="fa-solid fa-money-bill-wave" style="color: var(--accent-emerald);"></i> ${bk.totalPrice === 0 ? 'ฟรี' : `฿${bk.totalPrice.toLocaleString()}`}</span>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 160px;">
                  ${
                    !isCancelled ? `
                      <button class="btn btn-primary btn-sm" onclick="window.bookingModule.showETicketModal('${bk.id}')">
                        <i class="fa-solid fa-qrcode"></i> ดูตั๋ว E-Ticket
                      </button>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-sm" onclick="window.bookingModule.openModifyModal('${bk.id}')" title="เปลี่ยนจำนวนที่นั่ง">
                          <i class="fa-solid fa-pen-to-square"></i> แก้ไข
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.bookingModule.confirmCancelBooking('${bk.id}')" title="ยกเลิกการจอง">
                          <i class="fa-solid fa-trash-can"></i> ยกเลิก
                        </button>
                      </div>
                    ` : `
                      <button class="btn btn-secondary btn-sm" disabled>
                        <i class="fa-solid fa-ban"></i> รายการยกเลิกแล้ว
                      </button>
                    `
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
  }

  openModifyModal(bookingId) {
    const booking = window.store.getBookingById(bookingId);
    if (!booking) return;

    const event = window.store.getEventById(booking.eventId);
    if (!event) return;

    const modal = document.getElementById('modifyBookingModal');
    const idInput = document.getElementById('modifyBookingId');
    const summaryEl = document.getElementById('modifyBookingSummary');
    const seatsInput = document.getElementById('modifySeatsInput');

    if (idInput) idInput.value = booking.id;
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
          <h4 style="font-weight: 700; color: var(--text-primary);">${event.title}</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">จำนวนที่นั่งเดิม: <strong>${booking.seats} ที่นั่ง</strong></p>
          <p style="font-size: 0.78rem; color: var(--accent-amber); margin-top: 0.4rem;">
            <i class="fa-solid fa-circle-info"></i> สามารถแก้ไขได้ล่วงหน้าอย่างน้อย 24 ชั่วโมงก่อนวันจัดกิจกรรม
          </p>
        </div>
      `;
    }

    if (seatsInput) {
      seatsInput.value = booking.seats;
      seatsInput.min = 1;
      seatsInput.max = 10;
    }

    modal.classList.add('show');
  }

  closeModifyModal() {
    const modal = document.getElementById('modifyBookingModal');
    if (modal) modal.classList.remove('show');
  }

  handleModifyBookingSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('modifyBookingId').value;
    const newSeats = Number(document.getElementById('modifySeatsInput').value);

    try {
      window.store.updateBookingSeats(id, newSeats);
      this.closeModifyModal();
      window.app.showToast('อัปเดตจำนวนที่นั่งเรียบร้อยแล้ว!', 'success');
    } catch (err) {
      window.app.showToast(err.message, 'error');
    }
  }

  confirmCancelBooking(bookingId) {
    const booking = window.store.getBookingById(bookingId);
    if (!booking) return;

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองรหัส ${booking.refCode}?\n(การยกเลิกล่วงหน้าน้อยกว่า 24 ชม. จะไม่สามารถทำได้)`)) {
      try {
        window.store.cancelBooking(bookingId, false);
        window.app.showToast('ยกเลิกการจองเรียบร้อยแล้ว', 'info');
      } catch (err) {
        window.app.showToast(err.message, 'error');
      }
    }
  }

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
}

// Global Booking Instance
window.bookingModule = new BookingModule();
