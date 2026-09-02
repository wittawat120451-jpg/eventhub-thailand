/**
 * EVENTSPHERE - Main Application Controller & Router
 */

class Application {
  constructor() {
    this.currentRoute = 'home';
    this.initTheme();
    this.initRouting();
    this.initGlobalUI();
  }

  initTheme() {
    const savedTheme = window.store.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeToggleIcon(savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const nextTheme = window.store.toggleTheme();
        this.updateThemeToggleIcon(nextTheme);
      });
    }
  }

  updateThemeToggleIcon(theme) {
    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  initRouting() {
    // Navigation link clicks
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = e.currentTarget.getAttribute('data-nav');
        this.navigate(route);
      });
    });

    // Hash change support
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      this.navigate(hash, false);
    });

    // Initial route from hash or default to home
    const initialRoute = window.location.hash.replace('#', '') || 'home';
    this.navigate(initialRoute, false);
  }

  navigate(route, updateHash = true) {
    // Permission check for admin view
    if (route === 'admin') {
      const user = window.store.getCurrentUser();
      if (!user || user.role !== 'admin') {
        // Automatically give friendly option to switch to admin or prompt
        window.app.showToast('กำลังสลับเข้าสู่โหมดผู้ดูแลระบบ (Admin Demo)...', 'info');
        window.auth.switchToRole('admin');
        return;
      }
    }

    this.currentRoute = route;
    if (updateHash) {
      window.location.hash = route;
    }

    // Update active nav links
    document.querySelectorAll('[data-nav]').forEach(el => {
      if (el.getAttribute('data-nav') === route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Toggle view containers
    const views = ['home', 'calendar', 'my-bookings', 'admin'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        el.style.display = v === route ? 'block' : 'none';
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh specific view if needed
    if (route === 'calendar' && window.calendarModule) {
      window.calendarModule.renderCalendar();
    } else if (route === 'my-bookings' && window.bookingModule) {
      window.bookingModule.renderMyBookings();
    } else if (route === 'admin' && window.adminModule) {
      window.adminModule.renderAdminDashboard();
    }
  }

  initGlobalUI() {
    // User Profile Dropdown Toggle
    const profileBtn = document.getElementById('userProfileBtn');
    const profileDropdown = document.getElementById('userProfileDropdown');
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        const notifDropdown = document.getElementById('notifDropdown');
        if (notifDropdown) notifDropdown.classList.remove('show');
      });
    }

    document.addEventListener('click', (e) => {
      if (profileDropdown && !profileDropdown.contains(e.target) && profileBtn && !profileBtn.contains(e.target)) {
        profileDropdown.classList.remove('show');
      }
    });

    // Close Modals on overlay click or close button
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });

    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.modal-overlay');
        if (modal) modal.classList.remove('show');
      });
    });

    // ESC key closes any open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
        if (profileDropdown) profileDropdown.classList.remove('show');
        const notifDropdown = document.getElementById('notifDropdown');
        if (notifDropdown) notifDropdown.classList.remove('show');
      }
    });
  }

  // Global Toast Notifications System
  showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    let defaultTitle = 'แจ้งเตือน';

    if (type === 'success') {
      iconClass = 'fa-circle-check';
      defaultTitle = 'สำเร็จ';
    } else if (type === 'error') {
      iconClass = 'fa-circle-exclamation';
      defaultTitle = 'ข้อผิดพลาด';
    } else if (type === 'warning') {
      iconClass = 'fa-triangle-exclamation';
      defaultTitle = 'คำเตือน';
    }

    toast.innerHTML = `
      <i class="fa-solid ${iconClass} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title || defaultTitle}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Instantiate and attach to window
window.app = new Application();
