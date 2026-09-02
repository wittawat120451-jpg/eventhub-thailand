/**
 * EVENTSPHERE - Interactive Calendar View Module
 */

class CalendarModule {
  constructor() {
    this.currentDate = new Date('2026-09-01'); // Base on the realistic event date (Sept 2026)
    this.initEventListeners();
    this.renderCalendar();

    window.store.subscribe((eventType) => {
      if (['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED', 'DATA_RESET'].includes(eventType)) {
        this.renderCalendar();
      }
    });
  }

  initEventListeners() {
    const prevBtn = document.getElementById('calPrevBtn');
    const nextBtn = document.getElementById('calNextBtn');
    const todayBtn = document.getElementById('calTodayBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date('2026-09-01');
        this.renderCalendar();
      });
    }
  }

  renderCalendar() {
    const titleEl = document.getElementById('calendarMonthTitle');
    const gridEl = document.getElementById('calendarGrid');
    if (!gridEl) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    if (titleEl) {
      titleEl.textContent = `${thaiMonths[month]} ${year + 543}`;
    }

    // Days calculation
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const events = window.store.getEvents();

    let html = '';

    // Day Header
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    dayNames.forEach(d => {
      html += `<div class="calendar-day-head">${d}</div>`;
    });

    // Previous month padding days
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevLastDay - i + 1;
      html += `
        <div class="calendar-day-cell other-month">
          <div class="calendar-day-num">${dayNum}</div>
        </div>
      `;
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= lastDay; day++) {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = day.toString().padStart(2, '0');
      const fullDateStr = `${year}-${monthStr}-${dayStr}`;

      const isToday = (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day);
      const dayEvents = events.filter(e => e.date === fullDateStr);

      html += `
        <div class="calendar-day-cell ${isToday ? 'today' : ''}" onclick="window.calendarModule.handleDayClick('${fullDateStr}')">
          <div class="calendar-day-num" style="${dayEvents.length > 0 ? 'color: var(--primary-400);' : ''}">${day}</div>
          ${
            dayEvents.map(e => `
              <div class="calendar-event-pill" title="${e.title} (${e.time})">
                ${e.title}
              </div>
            `).join('')
          }
        </div>
      `;
    }

    // Next month padding days to fill 7 columns
    const totalCellsSoFar = firstDayIndex + lastDay;
    const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
    for (let j = 1; j <= remainingCells; j++) {
      html += `
        <div class="calendar-day-cell other-month">
          <div class="calendar-day-num">${j}</div>
        </div>
      `;
    }

    gridEl.innerHTML = html;
  }

  handleDayClick(dateStr) {
    const events = window.store.getEvents().filter(e => e.date === dateStr);
    const modal = document.getElementById('calendarDayModal');
    const content = document.getElementById('calendarDayModalContent');
    const title = document.getElementById('calendarDayModalTitle');

    if (!modal || !content) return;

    if (title) {
      title.textContent = `กิจกรรมประจำวันที่ ${window.eventsModule.formatThaiDate(dateStr)}`;
    }

    if (events.length === 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <i class="fa-regular fa-calendar-xmark" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: var(--text-muted);"></i>
          <p>ไม่มีกิจกรรมที่จัดในวันนี้</p>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${events.map(e => {
            const remaining = Math.max(0, e.capacity - e.bookedSeats);
            const isSoldOut = remaining === 0;

            return `
              <div style="display: flex; gap: 1rem; align-items: center; background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <img src="${e.imageUrl}" alt="${e.title}" style="width: 80px; height: 80px; border-radius: var(--radius-md); object-fit: cover;">
                <div style="flex-grow: 1;">
                  <span class="badge badge-tech" style="margin-bottom: 0.25rem;">${e.category.toUpperCase()}</span>
                  <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.2rem;">${e.title}</h4>
                  <p style="font-size: 0.82rem; color: var(--text-muted);"><i class="fa-solid fa-clock"></i> ${e.time} &bull; <i class="fa-solid fa-location-dot"></i> ${e.location}</p>
                </div>
                <div>
                  <button class="btn btn-primary btn-sm" onclick="window.calendarModule.closeDayModal(); window.eventsModule.openEventDetail('${e.id}')">
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    modal.classList.add('show');
  }

  closeDayModal() {
    const modal = document.getElementById('calendarDayModal');
    if (modal) modal.classList.remove('show');
  }
}

// Global Calendar Instance
window.calendarModule = new CalendarModule();
