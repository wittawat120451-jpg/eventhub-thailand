/**
 * EVENTSPHERE - Admin Portal, Analytics Charts, CRUD & CSV Export Module
 */

class AdminModule {
  constructor() {
    this.barChart = null;
    this.donutChart = null;
    this.selectedEventFilter = 'all';
    this.attendeeSearchQuery = '';

    this.initEventListeners();
    this.renderAdminDashboard();

    window.store.subscribe((eventType) => {
      if (['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED', 'BOOKING_CREATED', 'BOOKING_UPDATED', 'WAITLIST_UPDATED', 'WAITLIST_PROMOTED', 'DATA_RESET'].includes(eventType)) {
        this.renderAdminDashboard();
      }
    });
  }

  initEventListeners() {
    // Add Event Button
    const addEventBtn = document.getElementById('adminAddEventBtn');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => this.openEventFormModal());
    }

    // Event Form Submit (Add / Edit)
    const eventForm = document.getElementById('adminEventForm');
    if (eventForm) {
      eventForm.addEventListener('submit', (e) => this.handleEventFormSubmit(e));
    }

    // Filter Attendees by Event dropdown
    const filterEventSelect = document.getElementById('adminAttendeeEventFilter');
    if (filterEventSelect) {
      filterEventSelect.addEventListener('change', (e) => {
        this.selectedEventFilter = e.target.value;
        this.renderAttendeesTable();
      });
    }

    // Search Attendees Input
    const searchInput = document.getElementById('adminAttendeeSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.attendeeSearchQuery = e.target.value.toLowerCase().trim();
        this.renderAttendeesTable();
      });
    }

    // Export CSV Button
    const exportCsvBtn = document.getElementById('adminExportCsvBtn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportAttendeesCSV());
    }

    // Reset Demo Data Button
    const resetDataBtn = document.getElementById('adminResetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตัวอย่าง (Demo Data) หรือไม่?')) {
          window.store.resetDemoData();
          window.app.showToast('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว!', 'info');
        }
      });
    }
  }

  renderAdminDashboard() {
    const events = window.store.getEvents();
    const bookings = window.store.getBookings();
    const waitlists = window.store.getWaitlists();

    // 1. Calculate Stats
    const totalEvents = events.length;
    const totalBookings = bookings.filter(b => b.status !== 'cancelled').length;
    const totalAttendees = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.seats, 0);
    const checkedInCount = bookings.filter(b => b.status === 'checked_in').reduce((sum, b) => sum + b.seats, 0);
    const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Update Metric Cards
    const elEvents = document.getElementById('adminStatEvents');
    const elBookings = document.getElementById('adminStatBookings');
    const elAttendees = document.getElementById('adminStatAttendees');
    const elRevenue = document.getElementById('adminStatRevenue');

    if (elEvents) elEvents.textContent = totalEvents;
    if (elBookings) elBookings.textContent = totalBookings;
    if (elAttendees) elAttendees.textContent = `${totalAttendees} คน (เช็คอินแล้ว ${checkedInCount})`;
    if (elRevenue) elRevenue.textContent = `฿${totalRevenue.toLocaleString()}`;

    // 2. Render Charts
    this.renderCharts(events);

    // 3. Render Events Management Table
    this.renderEventsTable(events);

    // 4. Populate Attendees Event Filter Dropdown
    this.populateEventFilterDropdown(events);

    // 5. Render Attendees Table
    this.renderAttendeesTable();
  }

  renderCharts(events) {
    if (!window.Chart) return;

    const isDark = window.store.getTheme() === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';

    // Chart 1: Bar Chart (Booked vs Remaining Quota)
    const barCtx = document.getElementById('adminEventsBarChart');
    if (barCtx) {
      if (this.barChart) this.barChart.destroy();

      const labels = events.map(e => e.title.length > 20 ? e.title.substring(0, 18) + '...' : e.title);
      const bookedData = events.map(e => e.bookedSeats);
      const remainingData = events.map(e => Math.max(0, e.capacity - e.bookedSeats));

      this.barChart = new window.Chart(barCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'จองแล้ว (ที่นั่ง)',
              data: bookedData,
              backgroundColor: '#2563eb',
              borderRadius: 6
            },
            {
              label: 'ว่างคงเหลือ (ที่นั่ง)',
              data: remainingData,
              backgroundColor: '#06b6d4',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: textColor, font: { family: 'Prompt' } }
            }
          },
          scales: {
            x: {
              stacked: true,
              ticks: { color: textColor, font: { family: 'Prompt', size: 11 } },
              grid: { display: false }
            },
            y: {
              stacked: true,
              ticks: { color: textColor, font: { family: 'Prompt' } },
              grid: { color: gridColor }
            }
          }
        }
      });
    }

    // Chart 2: Doughnut Chart (Categories breakdown)
    const donutCtx = document.getElementById('adminCategoryDonutChart');
    if (donutCtx) {
      if (this.donutChart) this.donutChart.destroy();

      const catCounts = {};
      events.forEach(e => {
        catCounts[e.category] = (catCounts[e.category] || 0) + e.bookedSeats;
      });

      const catLabels = Object.keys(catCounts).map(c => c.toUpperCase());
      const catData = Object.values(catCounts);

      this.donutChart = new window.Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: 'Prompt', size: 11 } }
            }
          }
        }
      });
    }
  }

  renderEventsTable(events) {
    const tableBody = document.getElementById('adminEventsTableBody');
    if (!tableBody) return;

    if (events.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">ไม่มีข้อมูลกิจกรรม</td></tr>`;
      return;
    }

    tableBody.innerHTML = events.map(e => {
      const remaining = Math.max(0, e.capacity - e.bookedSeats);
      const isSoldOut = remaining === 0;

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${e.imageUrl}" alt="${e.title}" style="width: 48px; height: 48px; border-radius: var(--radius-md); object-fit: cover;">
              <div>
                <strong style="font-size: 0.95rem; color: var(--text-primary);">${e.title}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${e.location}</div>
              </div>
            </div>
          </td>
          <td><span class="badge badge-tech">${e.category.toUpperCase()}</span></td>
          <td>${window.eventsModule.formatThaiDate(e.date)}</td>
          <td>
            <strong>${e.bookedSeats}</strong> / ${e.capacity}
            <span style="font-size: 0.78rem; margin-left: 0.25rem; color: ${isSoldOut ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
              (${isSoldOut ? 'เต็ม' : `ว่าง ${remaining}`})
            </span>
          </td>
          <td><strong>${e.price === 0 ? 'ฟรี' : `฿${e.price.toLocaleString()}`}</strong></td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm" onclick="window.adminModule.openEventFormModal('${e.id}')" title="แก้ไข">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="window.adminModule.confirmDeleteEvent('${e.id}')" title="ลบ">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  populateEventFilterDropdown(events) {
    const dropdown = document.getElementById('adminAttendeeEventFilter');
    if (!dropdown) return;

    const currentVal = dropdown.value;
    let html = `<option value="all">ทุกกิจกรรม (${events.length})</option>`;
    events.forEach(e => {
      html += `<option value="${e.id}">${e.title}</option>`;
    });
    dropdown.innerHTML = html;
    dropdown.value = currentVal || 'all';
  }

  renderAttendeesTable() {
    const tableBody = document.getElementById('adminAttendeesTableBody');
    if (!tableBody) return;

    const bookings = window.store.getBookings();
    let filtered = bookings;

    // Filter by Event
    if (this.selectedEventFilter !== 'all') {
      filtered = filtered.filter(b => b.eventId === this.selectedEventFilter);
    }

    // Search Query (Attendee Name, Phone, Email, RefCode)
    if (this.attendeeSearchQuery) {
      filtered = filtered.filter(b => {
        const text = `${b.attendeeName} ${b.attendeePhone} ${b.attendeeEmail} ${b.refCode}`.toLowerCase();
        return text.includes(this.attendeeSearchQuery);
      });
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">ไม่พบข้อมูลผู้จองตามเงื่อนไขที่ระบุ</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(b => {
      const event = window.store.getEventById(b.eventId);
      const isCheckedIn = b.status === 'checked_in';
      const isCancelled = b.status === 'cancelled';

      let statusBadge = '<span class="badge badge-success"><i class="fa-solid fa-check"></i> ยืนยันแล้ว</span>';
      if (isCheckedIn) {
        statusBadge = '<span class="badge badge-info"><i class="fa-solid fa-qrcode"></i> เช็คอินแล้ว</span>';
      } else if (isCancelled) {
        statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> ยกเลิก</span>';
      }

      return `
        <tr>
          <td><strong style="font-family: monospace; color: var(--primary-400);">${b.refCode}</strong></td>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${b.attendeeName}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${b.attendeeEmail} &bull; ${b.attendeePhone}</div>
          </td>
          <td><div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${event ? event.title : '-'}</div></td>
          <td><strong>${b.seats}</strong> ที่นั่ง</td>
          <td>${statusBadge}</td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              ${
                !isCancelled ? `
                  <button class="btn ${isCheckedIn ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="window.adminModule.toggleCheckIn('${b.id}')" title="${isCheckedIn ? 'ยกเลิกสถานะเช็คอิน' : 'เช็คอิน'}">
                    <i class="fa-solid ${isCheckedIn ? 'fa-user-check' : 'fa-qrcode'}"></i> ${isCheckedIn ? 'เช็คอินแล้ว' : 'เช็คอิน'}
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="window.adminModule.adminCancelBooking('${b.id}')" title="ยกเลิกการจอง">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                ` : `
                  <span style="font-size: 0.8rem; color: var(--text-muted);">-</span>
                `
              }
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  toggleCheckIn(bookingId) {
    const booking = window.store.getBookingById(bookingId);
    if (!booking) return;

    if (booking.status === 'checked_in') {
      booking.status = 'confirmed';
      delete booking.checkedInAt;
      const all = window.store.getBookings();
      const idx = all.findIndex(b => b.id === booking.id);
      if (idx >= 0) all[idx] = booking;
      localStorage.setItem('eventsphere_bookings_v1', JSON.stringify(all));
      window.store.notify('BOOKING_UPDATED', booking);
      window.app.showToast('ยกเลิกสถานะเช็คอินแล้ว', 'info');
    } else {
      window.store.checkInBooking(bookingId);
      window.app.showToast(`เช็คอินคุณ ${booking.attendeeName} เรียบร้อย!`, 'success');
    }
  }

  adminCancelBooking(bookingId) {
    const booking = window.store.getBookingById(bookingId);
    if (!booking) return;

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองรหัส ${booking.refCode} ของคุณ ${booking.attendeeName}?`)) {
      try {
        window.store.cancelBooking(bookingId, true); // true = admin override (no 24h constraint)
        window.app.showToast('ยกเลิกการจองเรียบร้อยแล้ว และคืนโควตาให้ระบบ', 'success');
      } catch (err) {
        window.app.showToast(err.message, 'error');
      }
    }
  }

  // Event Form Modal (Add & Edit)
  openEventFormModal(eventId = null) {
    const modal = document.getElementById('adminEventFormModal');
    const titleEl = document.getElementById('adminEventFormModalTitle');
    const form = document.getElementById('adminEventForm');

    form.reset();
    document.getElementById('adminEventId').value = '';

    if (eventId) {
      const event = window.store.getEventById(eventId);
      if (event) {
        if (titleEl) titleEl.textContent = 'แก้ไขข้อมูลกิจกรรม';
        document.getElementById('adminEventId').value = event.id;
        document.getElementById('adminEventTitle').value = event.title;
        document.getElementById('adminEventCategory').value = event.category;
        document.getElementById('adminEventDate').value = event.date;
        document.getElementById('adminEventTime').value = event.time;
        document.getElementById('adminEventLocation').value = event.location;
        document.getElementById('adminEventSpeaker').value = event.speaker || '';
        document.getElementById('adminEventCapacity').value = event.capacity;
        document.getElementById('adminEventPrice').value = event.price;
        document.getElementById('adminEventImageUrl').value = event.imageUrl;
        document.getElementById('adminEventDescription').value = event.description;
      }
    } else {
      if (titleEl) titleEl.textContent = 'เพิ่มกิจกรรมใหม่';
      document.getElementById('adminEventImageUrl').value = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
    }

    modal.classList.add('show');
  }

  closeEventFormModal() {
    const modal = document.getElementById('adminEventFormModal');
    if (modal) modal.classList.remove('show');
  }

  handleEventFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('adminEventId').value;
    const title = document.getElementById('adminEventTitle').value.trim();
    const category = document.getElementById('adminEventCategory').value;
    const date = document.getElementById('adminEventDate').value;
    const time = document.getElementById('adminEventTime').value.trim();
    const location = document.getElementById('adminEventLocation').value.trim();
    const speaker = document.getElementById('adminEventSpeaker').value.trim();
    const capacity = Number(document.getElementById('adminEventCapacity').value);
    const price = Number(document.getElementById('adminEventPrice').value);
    const imageUrl = document.getElementById('adminEventImageUrl').value.trim();
    const description = document.getElementById('adminEventDescription').value.trim();

    if (!title || !date || !time || !location || !capacity) {
      window.app.showToast('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน', 'error');
      return;
    }

    const eventData = {
      id: id || undefined,
      title,
      category,
      date,
      time,
      location,
      speaker,
      capacity,
      price,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      description
    };

    window.store.saveEvent(eventData);
    this.closeEventFormModal();
    window.app.showToast(id ? 'บันทึกการแก้ไขกิจกรรมเรียบร้อย!' : 'สร้างกิจกรรมใหม่สำเร็จ!', 'success');
  }

  confirmDeleteEvent(eventId) {
    const event = window.store.getEventById(eventId);
    if (!event) return;

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรม "${event.title}"?`)) {
      window.store.deleteEvent(eventId);
      window.app.showToast('ลบกิจกรรมเรียบร้อยแล้ว', 'info');
    }
  }

  // Export Attendees to CSV (with UTF-8 BOM for Excel Thai language support)
  exportAttendeesCSV() {
    const bookings = window.store.getBookings();
    if (bookings.length === 0) {
      window.app.showToast('ไม่มีข้อมูลผู้จองสำหรับส่งออก', 'warning');
      return;
    }

    const headers = [
      'รหัสการจอง (RefCode)',
      'ชื่อกิจกรรม (Event)',
      'วันจัดงาน (Date)',
      'ชื่อผู้จอง (Attendee)',
      'อีเมล (Email)',
      'เบอร์โทรศัพท์ (Phone)',
      'จำนวนที่นั่ง (Seats)',
      'ยอดชำระ (Total Price)',
      'สถานะ (Status)',
      'เวลาที่ทำการจอง (Booking Time)'
    ];

    const rows = bookings.map(b => {
      const event = window.store.getEventById(b.eventId);
      let statusText = 'ยืนยันแล้ว (Confirmed)';
      if (b.status === 'checked_in') statusText = 'เช็คอินแล้ว (Checked In)';
      if (b.status === 'cancelled') statusText = 'ยกเลิกแล้ว (Cancelled)';

      return [
        `"${b.refCode}"`,
        `"${(event ? event.title : '').replace(/"/g, '""')}"`,
        `"${event ? event.date : ''}"`,
        `"${(b.attendeeName || '').replace(/"/g, '""')}"`,
        `"${b.attendeeEmail || ''}"`,
        `"${b.attendeePhone || ''}"`,
        b.seats,
        b.totalPrice || 0,
        `"${statusText}"`,
        `"${new Date(b.createdAt).toLocaleString('th-TH')}"`
      ];
    });

    // Add UTF-8 BOM (\uFEFF) so Excel opens Thai characters seamlessly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `eventsphere_attendees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.app.showToast('ส่งออกไฟล์ CSV สำเร็จเรียบร้อย!', 'success');
  }
}

// Global Admin Instance
window.adminModule = new AdminModule();
