<?php
// =====================================================
// Register Page
// =====================================================
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/auth.php';

if (isLoggedIn()) redirect(APP_URL . '/dashboard.php');

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken($_POST[CSRF_TOKEN_NAME] ?? '')) {
        $error = 'Session หมดอายุ กรุณาลองใหม่';
    } else {
        $name    = trim($_POST['name'] ?? '');
        $email   = trim($_POST['email'] ?? '');
        $phone   = trim($_POST['phone'] ?? '');
        $pw      = $_POST['password'] ?? '';
        $pw2     = $_POST['confirm_password'] ?? '';
        
        if ($pw !== $pw2) {
            $error = 'รหัสผ่านไม่ตรงกัน';
        } elseif (!preg_match('/^(?=.*[A-Za-z])(?=.*\d).{8,}$/', $pw)) {
            $error = 'รหัสผ่านต้องมีตัวอักษรและตัวเลขอย่างน้อย 1 ตัว และยาวอย่างน้อย 8 ตัวอักษร';
        } else {
            $result = registerUser($name, $email, $phone, $pw);
            if ($result['success']) {
                // Auto login
                loginUser($email, $pw);
                redirect(APP_URL . '/dashboard.php', 'สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ Sakura Events 🌸', 'success');
            } else {
                $error = $result['message'];
            }
        }
    }
}

$pageTitle = 'สมัครสมาชิก';
$bodyClass = 'auth-page';
include 'includes/header.php';
?>

<style>
.auth-page { background: linear-gradient(135deg, #1E1E1E 0%, #2C1810 100%); }
.auth-page .footer { display: none; }
.auth-wrapper { min-height:calc(100vh - var(--nav-height));display:flex;align-items:center;justify-content:center;padding:var(--space-8) var(--space-4); }
.auth-card { background:rgba(247,243,234,0.97);border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);width:100%;max-width:480px;overflow:hidden; }
.auth-card-header { background:linear-gradient(135deg,var(--color-matcha) 0%,#4A5A34 100%);padding:var(--space-6) var(--space-6);text-align:center; }
.pw-toggle { cursor:pointer;color:var(--color-gray-400);padding:0 var(--space-3);font-size:1.1rem; }
.pw-strength { height:4px;border-radius:2px;margin-top:6px;transition:all 0.3s; }
</style>

<div class="auth-wrapper">
  <div class="auth-card animate-fade-up">
    <div class="auth-card-header">
      <div style="font-size:2rem;margin-bottom:var(--space-2);">🌸</div>
      <div style="font-family:var(--font-jp);font-size:var(--text-xl);font-weight:700;color:white;margin-bottom:4px;">新規登録</div>
      <p style="color:rgba(255,255,255,0.75);font-size:var(--text-sm);">สมัครสมาชิกเพื่อเริ่มจองกิจกรรม</p>
    </div>
    
    <div style="padding:var(--space-6) var(--space-6) var(--space-8);">
      <?php if ($error): ?>
      <div class="alert alert-error">⚠️ <?= e($error) ?></div>
      <?php endif; ?>
      
      <form method="POST" id="registerForm" novalidate>
        <?= csrfField() ?>
        
        <div class="form-group">
          <label class="form-label required" for="name">ชื่อ-นามสกุล</label>
          <div class="input-group">
            <span class="input-group-icon">👤</span>
            <input type="text" id="name" name="name" class="form-control" 
                   placeholder="กรอกชื่อ-นามสกุล" required minlength="2"
                   value="<?= e($_POST['name'] ?? '') ?>">
          </div>
        </div>
        
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
          <label class="form-label" for="phone">เบอร์โทรศัพท์</label>
          <div class="input-group">
            <span class="input-group-icon">📞</span>
            <input type="tel" id="phone" name="phone" class="form-control" 
                   placeholder="0XX-XXX-XXXX"
                   value="<?= e($_POST['phone'] ?? '') ?>">
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label required" for="password">รหัสผ่าน</label>
          <div class="input-group">
            <span class="input-group-icon">🔒</span>
            <input type="password" id="password" name="password" class="form-control" 
                   placeholder="อย่างน้อย 8 ตัว มีตัวอักษรและเลข" required
                   oninput="checkStrength(this.value)" autocomplete="new-password">
            <span class="pw-toggle" onclick="togglePw('password', this)">👁</span>
          </div>
          <div class="pw-strength" id="pwStrength"></div>
          <span class="form-hint" id="pwHint">ใช้ตัวอักษรและตัวเลขอย่างน้อย 1 ตัว ยาวอย่างน้อย 8 ตัว</span>
        </div>
        
        <div class="form-group">
          <label class="form-label required" for="confirm_password">ยืนยันรหัสผ่าน</label>
          <div class="input-group">
            <span class="input-group-icon">🔒</span>
            <input type="password" id="confirm_password" name="confirm_password" class="form-control" 
                   placeholder="กรอกรหัสผ่านอีกครั้ง" required autocomplete="new-password">
            <span class="pw-toggle" onclick="togglePw('confirm_password', this)">👁</span>
          </div>
        </div>
        
        <div style="margin-bottom:var(--space-5);">
          <label style="display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);cursor:pointer;line-height:1.5;">
            <input type="checkbox" name="agree" required style="accent-color:var(--color-red);margin-top:3px;flex-shrink:0;">
            <span>ฉันยอมรับ <a href="#" style="color:var(--color-red);">เงื่อนไขการใช้งาน</a> และ <a href="#" style="color:var(--color-red);">นโยบายความเป็นส่วนตัว</a></span>
          </label>
        </div>
        
        <button type="submit" class="btn btn-primary w-full btn-lg" id="registerBtn">
          🌸 สมัครสมาชิกฟรี
        </button>
      </form>
      
      <div class="torii-divider" style="margin:var(--space-5) 0;">
        <span class="torii-divider-icon">⛩</span>
      </div>
      
      <p style="text-align:center;font-size:var(--text-sm);color:var(--color-gray-600);">
        มีบัญชีอยู่แล้ว? <a href="login.php" style="color:var(--color-red);font-weight:700;">เข้าสู่ระบบ</a>
      </p>
    </div>
  </div>
</div>

<script>
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function checkStrength(pw) {
  const bar = document.getElementById('pwStrength');
  const hint = document.getElementById('pwHint');
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  
  const colors = ['#EF5350','#FF9800','#FFC107','#4CAF50'];
  const labels = ['อ่อนมาก','อ่อน','ปานกลาง','แข็งแกร่ง'];
  if (pw.length === 0) { bar.style.background=''; bar.style.width='0'; hint.textContent='ใช้ตัวอักษรและตัวเลขอย่างน้อย 1 ตัว ยาวอย่างน้อย 8 ตัว'; return; }
  bar.style.width = (score * 25) + '%';
  bar.style.background = colors[score-1] || '#EF5350';
  hint.textContent = '🔐 ความแข็งแกร่ง: ' + (labels[score-1] || 'อ่อนมาก');
  hint.style.color = colors[score-1] || '#EF5350';
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
  const pw  = document.getElementById('password').value;
  const pw2 = document.getElementById('confirm_password').value;
  if (pw !== pw2) {
    e.preventDefault();
    showToast('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบ', 'error');
    return;
  }
  document.getElementById('registerBtn').textContent = '⏳ กำลังสร้างบัญชี...';
  document.getElementById('registerBtn').disabled = true;
});
</script>

<?php include 'includes/footer.php'; ?>
