<?php
// =====================================================
// Header & Navigation Include
// =====================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/functions.php';

$currentPage = basename($_SERVER['PHP_SELF'], '.php');
$pageTitle   = $pageTitle ?? APP_NAME;
$pageDesc    = $pageDesc  ?? 'ระบบจองกิจกรรมและงานอีเวนต์ธีมญี่ปุ่น ค้นหา ตรวจสอบ และจองกิจกรรมได้ง่ายๆ';
$isLoggedIn  = isLoggedIn();
$isAdmin     = isAdmin();
$unreadCount = $isLoggedIn ? getUnreadNotificationCount($_SESSION['user_id']) : 0;
$flash       = getFlash();
?>
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="<?= e($pageDesc) ?>">
  <meta property="og:title" content="<?= e($pageTitle) ?> | <?= APP_NAME ?>">
  <meta property="og:description" content="<?= e($pageDesc) ?>">
  <meta name="theme-color" content="#C62828">
  <title><?= e($pageTitle) ?> | <?= APP_NAME ?></title>
  <link rel="icon" href="<?= APP_URL ?>/assets/images/favicon.png" type="image/png">
  <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/main.css">
  <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/pages.css">
  <?php if (isset($extraCss)) echo $extraCss; ?>
</head>
<body class="<?= e($bodyClass ?? '') ?>">

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<?php if ($flash): ?>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    showToast('<?= e($flash['message']) ?>', '<?= e($flash['type']) ?>');
  });
</script>
<?php endif; ?>

<!-- Navigation -->
<nav class="nav" id="mainNav">
  <div class="container nav-inner">
    <!-- Logo -->
    <a href="<?= APP_URL ?>/index.php" class="nav-logo">
      <div class="nav-logo-icon">🌸</div>
      <div class="nav-logo-text">
        <span class="nav-logo-name"><?= APP_NAME_JP ?></span>
        <span class="nav-logo-sub"><?= APP_NAME ?></span>
      </div>
    </a>
    
    <!-- Desktop Links -->
    <div class="nav-links">
      <a href="<?= APP_URL ?>/index.php" class="nav-link <?= $currentPage === 'index' ? 'active' : '' ?>">หน้าแรก</a>
      <a href="<?= APP_URL ?>/events.php" class="nav-link <?= $currentPage === 'events' ? 'active' : '' ?>">กิจกรรมทั้งหมด</a>
      <a href="<?= APP_URL ?>/calendar.php" class="nav-link <?= $currentPage === 'calendar' ? 'active' : '' ?>">ปฏิทิน</a>
      <a href="<?= APP_URL ?>/events.php?guide=1" class="nav-link">วิธีการจอง</a>
      <a href="<?= APP_URL ?>/events.php#contact" class="nav-link">ติดต่อเรา</a>
      <?php if ($isAdmin): ?>
      <a href="<?= APP_URL ?>/admin/index.php" class="nav-link" style="color:var(--color-gold)">⚙ Admin</a>
      <?php endif; ?>
    </div>
    
    <!-- Actions -->
    <div class="nav-actions">
      <?php if ($isLoggedIn): ?>
        <!-- Notification Bell -->
        <a href="<?= APP_URL ?>/notifications.php" class="nav-notif" title="การแจ้งเตือน">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <?php if ($unreadCount > 0): ?>
          <span class="nav-notif-badge"><?= $unreadCount > 9 ? '9+' : $unreadCount ?></span>
          <?php endif; ?>
        </a>
        
        <!-- User Menu -->
        <div class="nav-user">
          <div class="nav-avatar"><?= mb_substr($_SESSION['user_name'], 0, 1) ?></div>
          <span style="font-size:var(--text-sm);font-weight:600;"><?= e(mb_substr($_SESSION['user_name'],0,12)) ?></span>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          
          <div class="nav-dropdown">
            <a href="<?= APP_URL ?>/dashboard.php" class="nav-dropdown-item">🏠 Dashboard</a>
            <a href="<?= APP_URL ?>/my-bookings.php" class="nav-dropdown-item">🎟 การจองของฉัน</a>
            <a href="<?= APP_URL ?>/favorites.php" class="nav-dropdown-item">❤️ รายการโปรด</a>
            <a href="<?= APP_URL ?>/notifications.php" class="nav-dropdown-item">
              🔔 การแจ้งเตือน
              <?php if ($unreadCount > 0): ?><span class="sidebar-badge"><?= $unreadCount ?></span><?php endif; ?>
            </a>
            <a href="<?= APP_URL ?>/profile.php" class="nav-dropdown-item">👤 โปรไฟล์</a>
            <?php if ($isAdmin): ?>
            <div class="nav-dropdown-divider"></div>
            <a href="<?= APP_URL ?>/admin/index.php" class="nav-dropdown-item" style="color:var(--color-gold)">⚙ Admin Panel</a>
            <?php endif; ?>
            <div class="nav-dropdown-divider"></div>
            <a href="<?= APP_URL ?>/logout.php" class="nav-dropdown-item" style="color:var(--color-danger)">🚪 ออกจากระบบ</a>
          </div>
        </div>
        
      <?php else: ?>
        <a href="<?= APP_URL ?>/login.php" class="btn btn-ghost btn-sm">เข้าสู่ระบบ</a>
        <a href="<?= APP_URL ?>/register.php" class="btn btn-primary btn-sm">สมัครสมาชิก</a>
      <?php endif; ?>
    </div>
    
    <!-- Hamburger -->
    <button class="nav-hamburger" id="navHamburger" aria-label="เมนู">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</nav>

<!-- Mobile Menu -->
<div class="nav-mobile" id="navMobile">
  <a href="<?= APP_URL ?>/index.php" class="nav-link <?= $currentPage === 'index' ? 'active' : '' ?>">🏠 หน้าแรก</a>
  <a href="<?= APP_URL ?>/events.php" class="nav-link <?= $currentPage === 'events' ? 'active' : '' ?>">🎌 กิจกรรมทั้งหมด</a>
  <a href="<?= APP_URL ?>/calendar.php" class="nav-link <?= $currentPage === 'calendar' ? 'active' : '' ?>">📅 ปฏิทิน</a>
  <a href="<?= APP_URL ?>/events.php?guide=1" class="nav-link">📖 วิธีการจอง</a>
  <?php if ($isAdmin): ?>
  <a href="<?= APP_URL ?>/admin/index.php" class="nav-link" style="color:var(--color-gold)">⚙ Admin Panel</a>
  <?php endif; ?>
  <div class="nav-mobile-actions">
    <?php if ($isLoggedIn): ?>
      <a href="<?= APP_URL ?>/dashboard.php" class="btn btn-primary">🏠 Dashboard</a>
      <a href="<?= APP_URL ?>/logout.php" class="btn btn-ghost">🚪 ออกจากระบบ</a>
    <?php else: ?>
      <a href="<?= APP_URL ?>/login.php" class="btn btn-secondary">เข้าสู่ระบบ</a>
      <a href="<?= APP_URL ?>/register.php" class="btn btn-primary">สมัครสมาชิก</a>
    <?php endif; ?>
  </div>
</div>
