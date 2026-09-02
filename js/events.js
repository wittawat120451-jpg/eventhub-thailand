/**
 * EVENTSPHERE - Events Explorer, Filter & Detail Module
 */

class EventsModule {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.dateFilter = '';
    this.priceFilter = 'all';
    this.sortBy = 'date-asc';
    this.viewMode = 'grid'; // 'grid' or 'list'

    this.initEventListeners();
    this.renderEvents();

    window.store.subscribe((eventType) => {
      if (['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED', 'BOOKING_CREATED', 'BOOKING_UPDATED', 'DATA_RESET'].includes(eventType)) {
        this.renderEvents();
      }
    });
  }

  initEventListeners() {
    // Search Input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderEvents();
      });
    }

    // Category Filter Select / Pills
    document.querySelectorAll('[data-category]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('[data-category]').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentCategory = e.currentTarget.getAttribute('data-category');
        this.renderEvents();
      });
    });

    // Date Filter input
    const dateInput = document.getElementById('filterDateInput');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.dateFilter = e.target.value;
        this.renderEvents();
      });
    }

    // Price Filter Select
    const priceSelect = document.getElementById('filterPriceSelect');
    if (priceSelect) {
      priceSelect.addEventListener('change', (e) => {
        this.priceFilter = e.target.value;
        this.renderEvents();
      });
    }

    // Sort Select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderEvents();
      });
    }

    // Reset Filters Button
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // View Mode Toggle (Grid / List)
    const gridViewBtn = document.getElementById('viewGridBtn');
    const listViewBtn = document.getElementById('viewListBtn');
    if (gridViewBtn && listViewBtn) {
      gridViewBtn.addEventListener('click', () => {
        this.viewMode = 'grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        this.renderEvents();
      });
      listViewBtn.addEventListener('click', () => {
        this.viewMode = 'list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        this.renderEvents();
      });
    }
  }

  resetFilters() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.dateFilter = '';
    this.priceFilter = 'all';
    this.sortBy = 'date-asc';

    const searchInput = document.getElementById('searchInput');
    const dateInput = document.getElementById('filterDateInput');
    const priceSelect = document.getElementById('filterPriceSelect');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput) searchInput.value = '';
    if (dateInput) dateInput.value = '';
    if (priceSelect) priceSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'date-asc';

    document.querySelectorAll('[data-category]').forEach(p => {
      if (p.getAttribute('data-category') === 'all') p.classList.add('active');
      else p.classList.remove('active');
    });

    this.renderEvents();
  }

  getFilteredEvents() {
    let events = window.store.getEvents();

    // 1. Category Filter
    if (this.currentCategory !== 'all') {
      events = events.filter(e => e.category === this.currentCategory);
    }

    // 2. Search Query (Title, Description, Speaker, Location, Tags)
    if (this.searchQuery) {
      events = events.filter(e => {
        const text = `${e.title} ${e.description} ${e.speaker || ''} ${e.location} ${(e.tags || []).join(' ')}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // 3. Date Filter
    if (this.dateFilter) {
      events = events.filter(e => e.date === this.dateFilter);
    }

    // 4. Price Filter
    if (this.priceFilter === 'free') {
      events = events.filter(e => e.price === 0);
    } else if (this.priceFilter === 'paid') {
      events = events.filter(e => e.price > 0);
    }

    // 5. Sorting
    events.sort((a, b) => {
      if (this.sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (this.sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (this.sortBy === 'price-low') return a.price - b.price;
      if (this.sortBy === 'price-high') return b.price - a.price;
      if (this.sortBy === 'popular') return (b.bookedSeats / b.capacity) - (a.bookedSeats / a.capacity);
      return 0;
    });

    return events;
  }

  renderEvents() {
    const container = document.getElementById('eventsContainer');
    const countBadge = document.getElementById('eventResultsCount');
    if (!container) return;

    const events = this.getFilteredEvents();

    if (countBadge) {
      countBadge.textContent = `พบ ${events.length} กิจกรรม`;
    }

    if (events.length === 0) {
      container.className = '';
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-xl); border: 1px dashed var(--border-color); margin-bottom: 3rem;">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 3.5rem; color: var(--primary-400); margin-bottom: 1rem; opacity: 0.8;"></i>
          <h3 style="font-size: 1.35rem; color: var(--text-primary); font-weight: 700; margin-bottom: 0.5rem;">ไม่พบกิจกรรมที่ค้นหา</h3>
          <p style="font-size: 0.95rem; margin-bottom: 1.5rem;">ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูกิจกรรมทั้งหมด</p>
          <button class="btn btn-primary btn-sm" onclick="window.eventsModule.resetFilters()">
            <i class="fa-solid fa-rotate-left"></i> ล้างตัวกรองทั้งหมด
          </button>
        </div>
      `;
      return;
    }

    container.className = this.viewMode === 'grid' ? 'events-grid' : 'events-list';

    container.innerHTML = events.map(event => this.renderEventCard(event)).join('');

    // Attach Event Card Listeners
    container.querySelectorAll('[data-action="open-detail"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-event-id');
        this.openEventDetail(id);
      });
    });

    container.querySelectorAll('[data-action="quick-book"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-event-id');
        window.bookingModule.openBookingModal(id);
      });
    });
  }

  renderEventCard(event) {
    const remaining = Math.max(0, event.capacity - event.bookedSeats);
    const percentBooked = Math.min(100, Math.round((event.bookedSeats / event.capacity) * 100));
    const isSoldOut = remaining === 0;
    const isLow = remaining > 0 && remaining <= Math.max(5, event.capacity * 0.15);

    let quotaClass = 'good';
    let quotaText = `เหลือว่าง ${remaining} ที่นั่ง`;
    if (isSoldOut) {
      quotaClass = 'full';
      quotaText = 'ที่นั่งเต็มแล้ว (Sold Out)';
    } else if (isLow) {
      quotaClass = 'low';
      quotaText = `ด่วน! เหลือเพียง ${remaining} ที่นั่ง`;
    }

    const categoryBadge = this.getCategoryBadge(event.category);
    const formattedDate = this.formatThaiDate(event.date);
    const formattedPrice = event.price === 0 ? 'ฟรี (Free)' : `฿${event.price.toLocaleString()}`;

    return `
      <div class="event-card" id="eventCard-${event.id}">
        <div class="event-card-media" style="cursor: pointer;" data-action="open-detail" data-event-id="${event.id}">
          <img src="${event.imageUrl}" alt="${event.title}" class="event-card-img" loading="lazy">
          <div class="event-card-badge">
            ${categoryBadge}
          </div>
          <div class="event-card-price ${event.price === 0 ? 'free' : ''}">
            ${formattedPrice}
          </div>
        </div>

        <div class="event-card-body">
          <div class="event-date-row">
            <i class="fa-regular fa-calendar-days"></i>
            <span>${formattedDate} &bull; ${event.time}</span>
          </div>

          <h3 class="event-card-title" style="cursor: pointer;" data-action="open-detail" data-event-id="${event.id}">
            ${event.title}
          </h3>

          <div class="event-card-location">
            <i class="fa-solid fa-location-dot" style="color: var(--primary-500);"></i>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${event.location}</span>
          </div>

          <div class="quota-wrapper">
            <div class="quota-info">
              <span class="quota-label"><i class="fa-solid fa-users"></i> ความจุ ${event.capacity} คน</span>
              <span class="quota-remaining ${quotaClass}">${quotaText}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${quotaClass}" style="width: ${percentBooked}%;"></div>
            </div>
          </div>

          <div class="event-card-footer">
            <button class="btn btn-secondary btn-sm" data-action="open-detail" data-event-id="${event.id}" style="flex: 1;">
              <i class="fa-solid fa-circle-info"></i> รายละเอียด
            </button>
            ${
              isSoldOut
                ? `<button class="btn btn-warning btn-sm" data-action="quick-book" data-event-id="${event.id}" style="flex: 1.2;">
                     <i class="fa-solid fa-user-clock"></i> คิวสำรอง
                   </button>`
                : `<button class="btn btn-primary btn-sm" data-action="quick-book" data-event-id="${event.id}" style="flex: 1.2;">
                     <i class="fa-solid fa-ticket"></i> จองเลย
                   </button>`
            }
          </div>
        </div>
      </div>
    `;
  }

  getCategoryBadge(category) {
    const map = {
      tech: '<span class="badge badge-tech"><i class="fa-solid fa-microchip"></i> เทคโนโลยี</span>',
      music: '<span class="badge badge-music"><i class="fa-solid fa-music"></i> ดนตรี & ศิลปะ</span>',
      workshop: '<span class="badge badge-workshop"><i class="fa-solid fa-laptop-code"></i> เวิร์กช็อป</span>',
      sport: '<span class="badge badge-sport"><i class="fa-solid fa-person-running"></i> กีฬา & สุขภาพ</span>',
      seminar: '<span class="badge badge-seminar"><i class="fa-solid fa-briefcase"></i> สัมมนาธุรกิจ</span>',
      art: '<span class="badge badge-art"><i class="fa-solid fa-palette"></i> ศิลปวัฒนธรรม</span>'
    };
    return map[category] || `<span class="badge badge-tech">${category}</span>`;
  }

  formatThaiDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543; // Buddhist Era
    return `${day} ${month} ${year}`;
  }

  openEventDetail(eventId) {
    const event = window.store.getEventById(eventId);
    if (!event) return;

    const modal = document.getElementById('eventDetailModal');
    if (!modal) return;

    const remaining = Math.max(0, event.capacity - event.bookedSeats);
    const isSoldOut = remaining === 0;

    const modalContent = document.getElementById('eventDetailContent');
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="event-detail-banner">
          <img src="${event.imageUrl}" alt="${event.title}">
          <div class="event-detail-banner-overlay"></div>
          <div style="position: absolute; bottom: 1.25rem; left: 1.5rem; right: 1.5rem; z-index: 2;">
            <div style="margin-bottom: 0.5rem;">${this.getCategoryBadge(event.category)}</div>
            <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">${event.title}</h2>
          </div>
        </div>

        <div style="padding: 1.75rem;">
          <div class="event-meta-grid">
            <div class="event-meta-box">
              <div class="event-meta-icon"><i class="fa-regular fa-calendar-check"></i></div>
              <div class="event-meta-text">
                <h5>วันและเวลาจัดงาน</h5>
                <p>${this.formatThaiDate(event.date)} (${event.time})</p>
              </div>
            </div>

            <div class="event-meta-box">
              <div class="event-meta-icon"><i class="fa-solid fa-location-dot"></i></div>
              <div class="event-meta-text">
                <h5>สถานที่จัดงาน</h5>
                <p>${event.location}</p>
              </div>
            </div>

            <div class="event-meta-box">
              <div class="event-meta-icon"><i class="fa-solid fa-tags"></i></div>
              <div class="event-meta-text">
                <h5>ราคาบัตรเข้าร่วม</h5>
                <p style="color: var(--accent-sky);">${event.price === 0 ? 'ฟรี (Free)' : `฿${event.price.toLocaleString()} / ที่นั่ง`}</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 1.75rem;">
            <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">
              <i class="fa-solid fa-align-left" style="color: var(--primary-500); margin-right: 0.4rem;"></i> รายละเอียดกิจกรรม
            </h4>
            <p style="color: var(--text-secondary); line-height: 1.8; font-size: 0.96rem;">${event.description}</p>
          </div>

          ${
            event.speaker ? `
              <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-lg); margin-bottom: 1.75rem; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; flex-shrink: 0;">
                  <i class="fa-solid fa-microphone-lines"></i>
                </div>
                <div>
                  <h5 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">วิทยากร / ผู้จัดงาน</h5>
                  <p style="font-weight: 700; color: var(--text-primary); font-size: 1rem;">${event.speaker}</p>
                </div>
              </div>
            ` : ''
          }

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: rgba(37,99,235,0.06); border-radius: var(--radius-md); border: 1px solid rgba(37,99,235,0.2);">
            <div>
              <span style="font-size: 0.85rem; color: var(--text-muted);">สถานะโควตาที่นั่ง:</span>
              <strong style="font-size: 1rem; margin-left: 0.5rem; color: ${isSoldOut ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
                ${isSoldOut ? 'บัตรเต็มแล้ว (Sold Out)' : `ว่าง ${remaining} จากทั้งหมด ${event.capacity} ที่นั่ง`}
              </strong>
            </div>
            <div>
              ${
                isSoldOut
                  ? `<button class="btn btn-warning" onclick="window.eventsModule.closeDetailModal(); window.bookingModule.openBookingModal('${event.id}');">
                       <i class="fa-solid fa-user-clock"></i> ลงชื่อในคิวสำรอง
                     </button>`
                  : `<button class="btn btn-gradient" onclick="window.eventsModule.closeDetailModal(); window.bookingModule.openBookingModal('${event.id}');">
                       <i class="fa-solid fa-ticket"></i> จองบัตรทันที
                     </button>`
              }
            </div>
          </div>
        </div>
      `;
    }

    modal.classList.add('show');
  }

  closeDetailModal() {
    const modal = document.getElementById('eventDetailModal');
    if (modal) modal.classList.remove('show');
  }
}

// Global Events Instance
window.eventsModule = new EventsModule();
