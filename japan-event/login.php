<?php
// =====================================================
// Login Page
// =====================================================
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/auth.php';

// Redirect if already logged in
if (isLoggedIn()) {
    redirect(isAdmin() ? APP_URL . '/admin/index.php' : APP_URL . '/dashboard.php');
}

$error    = '';
$redirect = $_GET['redirect'] ?? (APP_URL . '/dashboard.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken($_POST[CSRF_TOKEN_NAME] ?? '')) {
        $error = 'Session หมดอายุ กรุณาลองใหม่';
    } else {
        $email    = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $result   = loginUser($email, $password);
        
        if ($result['success']) {
            $dest = $result['role'] === 'admin' ? APP_URL . '/admin/index.php' : urldecode($redirect);
            header('Location: ' . $dest);
            exit;
        } else {
            $error = $result['message'];
        }
    }
}

$pageTitle  = 'เข้าสู่ระบบ';
$bodyClass  = 'auth-page';
include 'includes/header.php';
?>

<style>
.auth-page { background: linear-gradient(135deg, #1E1E1E 0%, #2C1810 100%); }
.auth-page .footer { display: none; }
.auth-wrapper {
  min-height: calc(100vh - var(--nav-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A227' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.auth-card {
  background: rgba(247, 243, 234, 0.97);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  backdrop-filter: blur(20px);
}
.auth-card-header {
  background: linear-gradient(135deg, var(--color-red) 0%, var(--color-red-dark) 100%);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.auth-card-header::before {
  content: '🌸';
  position: absolute;
  font-size: 4rem;
  opacity: 0.1;
  top: -10px;
  left: -10px;
}
.auth-card-header::after {
  content: '🌸';
  position: absolute;
  font-size: 4rem;
  opacity: 0.1;
  bottom: -10px;
  right: -10px;
}
.auth-card-body { padding: var(--space-8) var(--space-6); }
.pw-toggle { cursor:pointer; color:var(--color-gray-400); padding:0 var(--space-3); font-size:1.1rem; }
.pw-toggle:hover { color:var(--color-red); }
</style>

<div class="auth-wrapper">
  <div class="auth-card animate-fade-up">
    <!-- Header -->
    <div class="auth-card-header">
      <div style="font-size:2.5rem;margin-bottom:var(--space-3);">🌸</div>
      <div style="font-family:var(--font-jp);font-size:var(--text-2xl);font-weight:700;color:white;margin-bottom:4px;">
        <?= APP_NAME_JP ?>
      </div>
      <p style="color:rgba(255,255,255,0.75);font-size:var(--text-sm);">เข้าสู่ระบบเพื่อจองกิจกรรม</p>
    </div>
    
    <!-- Body -->
    <div class="auth-card-body">
      <?php if ($error): ?>
      <div class="alert alert-error" style="margin-bottom:var(--space-5);">⚠️ <?= e($error) ?></div>
      <?php endif; ?>
      
      <!-- Demo accounts hint -->
      <div style="background:rgba(201,162,39,0.08);border:1px solid rgba(201,162,39,0.2);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);margin-bottom:var(--space-5);font-size:var(--text-xs);">
        <strong>🔑 Demo:</strong> admin@japan-event.com / Admin@1234 &nbsp;|&nbsp; user@japan-event.com / User@1234
      </div>
      
      <form method="POST" id="loginForm" novalidate>
        <?= csrfField() ?>
        <input type="hidden" name="redirect" value="<?= e($redirect) ?>">
        
        <div class="form-group">
          <label class="form-label required" for="email">อีเมล</label>
          <div class="input-group">
            <span class="input-group-icon">📧</span>
            <input type="email" id="email" name="email" class="form-control" 
                   placeholder="your@email.com" required
                   value="<?= e($_POST['email'] ?? '') ?>">
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label required" for="password">รหัสผ่าน</label>
          <div class="input-group">
            <span class="input-group-icon">🔒</span>
            <input type="password" id="password" name="password" class="form-control" 
                   placeholder="รหัสผ่านของคุณ" required autocomplete="current-password">
            <span class="pw-toggle" onclick="togglePw('password', this)">👁</span>
          </div>
        </div>
        
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6);">
          <label style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);cursor:pointer;">
            <input type="checkbox" name="remember" style="accent-color:var(--color-red);">
            <span>จำฉันไว้</span>
          </label>
          <a href="forgot-password.php" style="font-size:var(--text-sm);color:var(--color-red);">ลืมรหัสผ่าน?</a>
        </div>
        
        <button type="submit" class="btn btn-primary w-full btn-lg" id="loginBtn">
          🎌 เข้าสู่ระบบ
        </button>
      </form>
      
      <div class="torii-divider" style="margin:var(--space-6) 0;">
        <span class="torii-divider-icon">⛩</span>
      </div>
      
      <p style="text-align:center;font-size:var(--text-sm);color:var(--color-gray-600);">
        ยังไม่มีบัญชี? 
        <a href="register.php" style="color:var(--color-red);font-weight:700;">สมัครสมาชิกฟรี</a>
      </p>
      
      <p style="text-align:center;margin-top:var(--space-3);">
        <a href="index.php" style="font-size:var(--text-sm);color:var(--color-gray-500);">← กลับหน้าแรก</a>
      </p>
    </div>
  </div>
</div>

<script>
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁';
  }
}

document.getElementById('loginForm').addEventListener('submit', function() {
  const btn = document.getElementById('loginBtn');
  btn.textContent = '⏳ กำลังเข้าสู่ระบบ...';
  btn.disabled = true;
});
</script>

<?php include 'includes/footer.php'; ?>
