/**
 * EVENTSPHERE - Authentication & User Management Module
 * Supports Email/Password login, registration, Simulated Google Login, and Role switching
 */

class AuthModule {
  constructor() {
    this.currentUser = window.store.getCurrentUser();
    this.initEventListeners();
    this.updateUserUI();

    window.store.subscribe((eventType, payload) => {
      if (eventType === 'USER_CHANGED' || eventType === 'DATA_RESET') {
        this.currentUser = window.store.getCurrentUser();
        this.updateUserUI();
      }
    });
  }

  initEventListeners() {
    // Open Login Modal buttons
    document.querySelectorAll('[data-action="open-login"]').forEach(btn => {
      btn.addEventListener('click', () => this.showAuthModal('login'));
    });

    // Open Register Modal buttons
    document.querySelectorAll('[data-action="open-register"]').forEach(btn => {
      btn.addEventListener('click', () => this.showAuthModal('register'));
    });

    // Google Login Simulated button
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', () => this.handleGoogleLogin());
    }

    // Quick demo switchers
    const switchAdminBtn = document.getElementById('switchDemoAdminBtn');
    if (switchAdminBtn) {
      switchAdminBtn.addEventListener('click', () => this.switchToRole('admin'));
    }

    const switchMemberBtn = document.getElementById('switchDemoMemberBtn');
    if (switchMemberBtn) {
      switchMemberBtn.addEventListener('click', () => this.switchToRole('user'));
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleEmailLogin(e));
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }
  }

  showAuthModal(type = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    const loginTab = document.getElementById('authTabLogin');
    const registerTab = document.getElementById('authTabRegister');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');

    if (type === 'login') {
      if (loginTab) loginTab.classList.add('active');
      if (registerTab) registerTab.classList.remove('active');
      if (loginSection) loginSection.style.display = 'block';
      if (registerSection) registerSection.style.display = 'none';
    } else {
      if (loginTab) loginTab.classList.remove('active');
      if (registerTab) registerTab.classList.add('active');
      if (loginSection) loginSection.style.display = 'none';
      if (registerSection) registerSection.style.display = 'block';
    }

    modal.classList.add('show');
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('show');
  }

  handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      window.app.showToast('กรุณากรอกอีเมลและรหัสผ่าน', 'error');
      return;
    }

    const users = window.store.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create user automatically for smooth testing
      user = {
        id: 'usr-' + Date.now().toString(36),
        name: email.split('@')[0],
        email: email,
        role: email.includes('admin') ? 'admin' : 'user',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        phone: '081' + Math.floor(1000000 + Math.random() * 9000000)
      };
      window.store.saveUser(user);
    }

    window.store.setCurrentUser(user);
    this.closeAuthModal();
    window.app.showToast(`ยินดีต้อนรับคุณ ${user.name}`, 'success');
  }

  handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!name || !email || !phone || !password) {
      window.app.showToast('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'error');
      return;
    }

    const newUser = {
      id: 'usr-' + Date.now().toString(36),
      name,
      email,
      phone,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`
    };

    window.store.saveUser(newUser);
    window.store.setCurrentUser(newUser);
    this.closeAuthModal();
    window.app.showToast(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${name}`, 'success');
  }

  handleGoogleLogin() {
    // Simulated Google OAuth Flow
    window.app.showToast('กำลังเชื่อมต่อกับ Google Account...', 'info');

    setTimeout(() => {
      const googleUser = {
        id: 'usr-google-' + Date.now().toString(36),
        name: 'สมเกียรติ มงคลทรัพย์ (Google)',
        email: 'somkiat.m@gmail.com',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        phone: '0823456789'
      };

      window.store.saveUser(googleUser);
      window.store.setCurrentUser(googleUser);
      this.closeAuthModal();
      window.app.showToast('เข้าสู่ระบบด้วย Google สำเร็จเรียบร้อย!', 'success');
    }, 600);
  }

  switchToRole(role) {
    const users = window.store.getUsers();
    let target = users.find(u => u.role === role);
    if (!target) {
      target = role === 'admin' 
        ? { id: 'usr-admin-001', name: 'แอดมินระบบ', email: 'admin@eventsphere.com', role: 'admin' }
        : { id: 'usr-demo-001', name: 'วิศวภัทร ธนเกียรติคุณ', email: 'witsawa@demo.com', role: 'user' };
    }
    window.store.setCurrentUser(target);
    window.app.showToast(`สลับโหมดเป็น: ${role === 'admin' ? '👑 ผู้ดูแลระบบ (Admin)' : '👤 สมาชิกทั่วไป (User)'}`, 'info');
    
    // If switched to admin, navigate to admin view, if user, go to home or my bookings
    if (role === 'admin') {
      window.app.navigate('admin');
    } else {
      window.app.navigate('home');
    }
  }

  logout() {
    window.store.setCurrentUser(null);
    window.app.showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    window.app.navigate('home');
  }

  updateUserUI() {
    const loggedInWrap = document.getElementById('userLoggedInWrap');
    const guestWrap = document.getElementById('userGuestWrap');
    const userNameEl = document.getElementById('navUserName');
    const userRoleEl = document.getElementById('navUserRole');
    const userAvatarEl = document.getElementById('navUserAvatar');
    const adminTabLink = document.getElementById('navLinkAdmin');

    if (this.currentUser) {
      if (loggedInWrap) loggedInWrap.style.display = 'block';
      if (guestWrap) guestWrap.style.display = 'none';

      if (userNameEl) userNameEl.textContent = this.currentUser.name;
      if (userRoleEl) {
        userRoleEl.textContent = this.currentUser.role === 'admin' ? '👑 ผู้ดูแลระบบ' : '👤 สมาชิก';
      }
      if (userAvatarEl) {
        if (this.currentUser.avatar) {
          userAvatarEl.innerHTML = `<img src="${this.currentUser.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        } else {
          userAvatarEl.textContent = this.currentUser.name.charAt(0).toUpperCase();
        }
      }

      // Show admin tab for everyone or highlight for admin
      if (adminTabLink) {
        adminTabLink.style.display = 'flex';
      }
    } else {
      if (loggedInWrap) loggedInWrap.style.display = 'none';
      if (guestWrap) guestWrap.style.display = 'flex';
      if (adminTabLink) adminTabLink.style.display = 'flex'; // accessible to view or prompt
    }
  }
}

// Global Auth Instance
window.auth = new AuthModule();
