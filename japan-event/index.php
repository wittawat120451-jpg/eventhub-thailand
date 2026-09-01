<?php
// =====================================================
// Home Page - Japanese Event Booking System
// =====================================================
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

$pageTitle = 'ระบบจองกิจกรรมและงานอีเวนต์ธีมญี่ปุ่น';
$pageDesc  = 'ค้นพบกิจกรรมที่ใช่ และจองวันของคุณ - ระบบจองกิจกรรมญี่ปุ่นที่ดีที่สุด';

$featuredEvents = getFeaturedEvents(6);
$categories     = getCategories();
$totalEvents    = db()->query("SELECT COUNT(*) FROM events WHERE status='published'")->fetchColumn();
$totalBookings  = db()->query("SELECT COUNT(*) FROM bookings")->fetchColumn();

include 'includes/header.php';
?>

<style>
.hero { min-height: calc(100vh - var(--nav-height)); }
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: var(--space-12); padding: var(--space-16) 0; }
@media(max-width:768px){ .hero-grid { grid-template-columns:1fr; } .hero-visual{display:none;} }
.hero-img-card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-xl); padding: var(--space-4); backdrop-filter:blur(10px); }
.hero-img-card img { border-radius: var(--radius-lg); width:100%; }
.float-badge {
  position:absolute; background:white; border-radius:var(--radius-lg);
  padding:var(--space-3) var(--space-4); box-shadow:var(--shadow-lg);
  display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-sm); font-weight:600;
}
.float-badge-1 { top:-16px; right:-16px; }
.float-badge-2 { bottom:-16px; left:-16px; }
</style>

<!-- Hero Section -->
<section class="hero seigaiha-bg">
  <div class="hero-bg">
    <div class="hero-overlay"></div>
  </div>
  
  <!-- Sakura Petals -->
  <?php for ($i = 0; $i < 12; $i++): 
    $left     = rand(0, 100);
    $delay    = rand(0, 8);
    $duration = rand(6, 12);
    $size     = rand(6, 14);
    $hue      = rand(0, 20);
  ?>
  <div class="sakura-petal" style="left:<?=$left?>%;animation-delay:<?=$delay?>s;animation-duration:<?=$duration?>s;width:<?=$size?>px;height:<?=$size?>px;background:rgba(<?=220+$hue?>,<?=150+$hue?>,<?=150+$hue?>,0.6);"></div>
  <?php endfor; ?>
  
  <div class="container">
    <div class="hero-grid">
      <!-- Left Content -->
      <div class="hero-content">
        <div class="hero-badge">
          🌸 <span>ระบบจองกิจกรรมธีมญี่ปุ่น</span>
        </div>
        <span class="hero-title-jp">イベント予約システム</span>
        <h1 class="hero-title">
          ค้นพบกิจกรรมที่ใช่<br>และ<span>จองวัน</span>ของคุณ
        </h1>
        <p class="hero-desc">
          ระบบจองกิจกรรมและงานอีเวนต์ที่ช่วยให้คุณค้นหา ตรวจสอบวันว่าง 
          และจองกิจกรรมได้อย่างง่ายดาย สัมผัสประสบการณ์วัฒนธรรมญี่ปุ่นแท้ๆ
        </p>
        <div class="hero-actions">
          <a href="events.php" class="btn btn-primary btn-lg">🎌 ดูกิจกรรมทั้งหมด</a>
          <a href="calendar.php" class="btn btn-secondary btn-lg" style="border-color:rgba(247,243,234,0.5);color:var(--color-cream);">📅 ปฏิทินกิจกรรม</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat-item">
            <span class="hero-stat-number"><?= number_format($totalEvents) ?>+</span>
            <span class="hero-stat-label">กิจกรรม</span>
          </div>
          <div class="hero-stat-item">
            <span class="hero-stat-number"><?= number_format($totalBookings) ?>+</span>
            <span class="hero-stat-label">การจอง</span>
          </div>
          <div class="hero-stat-item">
            <span class="hero-stat-number">4.8★</span>
            <span class="hero-stat-label">คะแนนเฉลี่ย</span>
          </div>
        </div>
      </div>
      
      <!-- Right Visual -->
      <div class="hero-visual">
        <div style="position:relative;max-width:440px;margin:0 auto;">
          <div class="hero-img-card">
            <img src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80" 
                 alt="เทศกาลญี่ปุ่น" 
                 style="aspect-ratio:4/3;object-fit:cover;border-radius:12px;">
          </div>
          <div class="float-badge float-badge-1">
            <span>🌸</span><span>กิจกรรมพร้อมจอง</span>
          </div>
          <div class="float-badge float-badge-2">
            <span>⚡</span><span>จองภายใน 2 นาที</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Search Section -->
<section class="search-section" id="search">
  <div class="container">
    <form action="events.php" method="GET" id="searchForm">
      <div class="search-box">
        <span style="padding:0 var(--space-4);font-size:1.3rem;color:var(--color-gray-400);">🔍</span>
        <input type="text" name="search" id="searchInput" class="search-input" 
               placeholder="ค้นหากิจกรรม สถานที่ หรือประเภทกิจกรรม..."
               value="<?= e($_GET['search'] ?? '') ?>"
               autocomplete="off">
        <button type="submit" class="btn btn-primary" style="margin:var(--space-1);">ค้นหา</button>
      </div>
      <div class="search-filters">
        <span style="font-size:var(--text-sm);color:var(--color-gray-500);font-weight:600;align-self:center;">กรองตาม:</span>
        <a href="events.php?date=today" class="filter-chip">📅 วันนี้</a>
        <a href="events.php?date=tomorrow" class="filter-chip">🌅 พรุ่งนี้</a>
        <a href="events.php?date=week" class="filter-chip">📆 สัปดาห์นี้</a>
        <a href="events.php?date=month" class="filter-chip">🗓 เดือนนี้</a>
        <a href="events.php?price_max=500" class="filter-chip">💰 ราคาไม่เกิน 500 บาท</a>
        <a href="events.php?price_max=0" class="filter-chip">🆓 ฟรี</a>
      </div>
    </form>
  </div>
</section>

<!-- Categories Section -->
<section class="section" style="background:var(--color-white);">
  <div class="container">
    <div class="section-heading">
      <span class="section-heading-jp">カテゴリー</span>
      <h2 class="section-heading-main">ประเภทกิจกรรม</h2>
      <p class="section-heading-sub">เลือกประเภทกิจกรรมที่คุณสนใจ</p>
      <div class="section-heading-line"><div class="section-heading-dot"></div></div>
    </div>
    
    <?php if (!empty($categories)): ?>
    <div class="category-grid" id="categoryGrid">
      <?php foreach ($categories as $cat): ?>
      <a href="events.php?category=<?= urlencode($cat['category']) ?>" class="category-card">
        <div class="category-icon"><?= e($cat['category_icon']) ?></div>
        <div class="category-name"><?= e($cat['category']) ?></div>
        <div class="category-count"><?= $cat['event_count'] ?> กิจกรรม</div>
      </a>
      <?php endforeach; ?>
    </div>
    <?php else: ?>
    <div style="text-align:center;padding:var(--space-8);color:var(--color-gray-400);">
      ยังไม่มีประเภทกิจกรรม
    </div>
    <?php endif; ?>
  </div>
</section>

<!-- Featured Events -->
<section class="section">
  <div class="container">
    <div class="section-heading">
      <span class="section-heading-jp">人気のイベント</span>
      <h2 class="section-heading-main">กิจกรรมยอดนิยม</h2>
      <p class="section-heading-sub">กิจกรรมที่ได้รับความสนใจมากที่สุด</p>
      <div class="section-heading-line"><div class="section-heading-dot"></div></div>
    </div>
    
    <?php if (!empty($featuredEvents)): ?>
    <div class="events-grid">
      <?php foreach ($featuredEvents as $event): 
        $status  = getEventStatusBadge($event);
        $remaining = $event['capacity'] - $event['booked_count'];
        $pct     = ($event['booked_count'] / max($event['capacity'], 1)) * 100;
        $isFav   = isLoggedIn() ? isFavorited($_SESSION['user_id'], $event['id']) : false;
        $imgUrl  = getEventImageUrl($event);
      ?>
      <div class="card event-card animate-fade-up" onclick="window.location='event-detail.php?id=<?= $event['id'] ?>'">
        <div class="card-img">
          <img src="<?= e($imgUrl) ?>" alt="<?= e($event['title']) ?>" loading="lazy">
          <div class="event-card-badge">
            <span class="badge <?= $status['class'] ?>"><?= $status['label'] ?></span>
          </div>
          <?php if (isLoggedIn()): ?>
          <button class="event-card-favorite <?= $isFav ? 'active' : '' ?>" 
                  onclick="event.stopPropagation(); toggleFavoriteJS(<?= $event['id'] ?>, this)"
                  title="เพิ่มในรายการโปรด">
            <?= $isFav ? '❤️' : '🤍' ?>
          </button>
          <?php endif; ?>
        </div>
        <div class="card-body">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
            <span class="event-category-tag"><?= e($event['category_icon'] ?? '🎎') ?> <?= e($event['category']) ?></span>
            <div class="rating-display">
              <?= renderStars($event['rating']) ?>
              <span class="rating-number"><?= number_format($event['rating'],1) ?></span>
            </div>
          </div>
          <h3 style="font-size:var(--text-base);font-weight:700;margin-bottom:var(--space-3);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
            <?= e($event['title']) ?>
          </h3>
          <div class="event-meta">
            <div class="event-meta-item">
              <span class="event-meta-icon">📅</span>
              <span><?= formatDateThai($event['event_date']) ?></span>
            </div>
            <div class="event-meta-item">
              <span class="event-meta-icon">⏰</span>
              <span><?= formatTime($event['start_time']) ?> - <?= formatTime($event['end_time']) ?></span>
            </div>
            <div class="event-meta-item">
              <span class="event-meta-icon">📍</span>
              <span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"><?= e($event['location_name'] ?? 'ไม่ระบุสถานที่') ?></span>
            </div>
          </div>
          
          <!-- Seats bar -->
          <div class="seats-indicator" style="margin-bottom:var(--space-3);">
            <span style="font-size:var(--text-xs);color:var(--color-gray-500);">ที่เหลือ <?= $remaining ?>/<?= $event['capacity'] ?></span>
            <div class="seats-bar">
              <div class="seats-fill <?= $pct>=90?'red':($pct>=70?'yellow':'green') ?>" style="width:<?= min($pct,100) ?>%"></div>
            </div>
          </div>
        </div>
        <div class="card-footer" style="display:flex;align-items:center;justify-content:space-between;">
          <div class="event-price">
            <?php if ($event['price'] == 0): ?>
            <span class="badge badge-free">ฟรี</span>
            <?php else: ?>
            ฿<?= number_format($event['price'],0) ?> <small>/คน</small>
            <?php endif; ?>
          </div>
          <div style="display:flex;gap:var(--space-2);">
            <a href="event-detail.php?id=<?= $event['id'] ?>" class="btn btn-ghost btn-sm" onclick="event.stopPropagation()">รายละเอียด</a>
            <?php if ($status['class'] === 'badge-open' || $status['class'] === 'badge-almost'): ?>
            <a href="booking.php?event_id=<?= $event['id'] ?>" class="btn btn-primary btn-sm" onclick="event.stopPropagation()">จองเลย</a>
            <?php else: ?>
            <button class="btn btn-ghost btn-sm" disabled><?= $status['label'] ?></button>
            <?php endif; ?>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    
    <div style="text-align:center;margin-top:var(--space-10);">
      <a href="events.php" class="btn btn-secondary btn-lg">ดูกิจกรรมทั้งหมด →</a>
    </div>
    
    <?php else: ?>
    <div class="empty-state">
      <div class="empty-state-icon">🌸</div>
      <p class="empty-state-title">ยังไม่มีกิจกรรม</p>
      <p class="empty-state-desc">กำลังเพิ่มกิจกรรมใหม่ๆ โปรดติดตาม!</p>
    </div>
    <?php endif; ?>
  </div>
</section>

<!-- How it works -->
<section class="section" style="background:var(--color-black);">
  <div class="container">
    <div class="section-heading">
      <span class="section-heading-jp" style="color:var(--color-gold);">使い方</span>
      <h2 class="section-heading-main" style="color:var(--color-cream);">วิธีการจอง 4 ขั้นตอน</h2>
      <p class="section-heading-sub" style="color:rgba(247,243,234,0.6);">ง่าย รวดเร็ว ปลอดภัย เพียงไม่กี่คลิก</p>
    </div>
    <div class="grid grid-4" style="gap:var(--space-6);">
      <?php 
      $steps = [
        ['icon'=>'🔍','title'=>'ค้นหากิจกรรม','desc'=>'ค้นหาและกรองกิจกรรมที่คุณสนใจ เลือกตามวันที่ ประเภท หรือสถานที่'],
        ['icon'=>'📋','title'=>'เลือกรายละเอียด','desc'=>'เลือกวันที่ เวลา จำนวนผู้เข้าร่วม และกรอกข้อมูลผู้จอง'],
        ['icon'=>'💳','title'=>'ชำระเงิน','desc'=>'ชำระเงินผ่านหลากหลายช่องทาง รวดเร็ว ปลอดภัย มีการยืนยัน'],
        ['icon'=>'🎟','title'=>'รับ E-Ticket','desc'=>'รับ E-Ticket พร้อม QR Code ทันที นำไปสแกนเข้างานได้เลย'],
      ];
      foreach ($steps as $i => $step): ?>
      <div style="text-align:center;padding:var(--space-6);">
        <div style="width:72px;height:72px;background:rgba(198,40,40,0.15);border:2px solid rgba(198,40,40,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto var(--space-4);">
          <?= $step['icon'] ?>
        </div>
        <div style="width:28px;height:28px;background:var(--color-red);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--text-sm);font-weight:700;color:white;margin:-12px auto var(--space-4);"><?= $i+1 ?></div>
        <h3 style="color:var(--color-cream);font-size:var(--text-lg);margin-bottom:var(--space-3);"><?= $step['title'] ?></h3>
        <p style="color:rgba(247,243,234,0.6);font-size:var(--text-sm);line-height:1.7;"><?= $step['desc'] ?></p>
      </div>
      <?php endforeach; ?>
    </div>
    <div style="text-align:center;margin-top:var(--space-10);">
      <a href="register.php" class="btn btn-gold btn-lg">🌸 เริ่มต้นใช้งานฟรี</a>
    </div>
  </div>
</section>

<!-- Upcoming Events Strip -->
<section class="section" style="background:rgba(198,40,40,0.04);padding:var(--space-10) 0;">
  <div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6);">
      <div>
        <span class="section-heading-jp" style="display:block;text-align:left;margin-bottom:4px;">次のイベント</span>
        <h2 style="font-size:var(--text-2xl);font-weight:800;">กิจกรรมที่กำลังจะมาถึง</h2>
      </div>
      <a href="events.php" class="btn btn-secondary">ดูทั้งหมด →</a>
    </div>
    <div style="display:flex;flex-direction:column;gap:var(--space-3);">
      <?php 
      $pdo = db();
      $upcoming = $pdo->query("SELECT e.*,l.name as location_name FROM events e LEFT JOIN locations l ON e.location_id=l.id WHERE e.status='published' AND e.event_date >= CURDATE() ORDER BY e.event_date ASC LIMIT 5")->fetchAll();
      foreach ($upcoming as $ev): 
        $s = getEventStatusBadge($ev);
      ?>
      <div class="card" style="display:flex;align-items:center;gap:var(--space-5);padding:var(--space-4) var(--space-5);">
        <div style="text-align:center;min-width:60px;">
          <div style="font-size:1.8rem;font-weight:800;color:var(--color-red);line-height:1;"><?= date('d', strtotime($ev['event_date'])) ?></div>
          <div style="font-size:var(--text-xs);color:var(--color-gray-500);text-transform:uppercase;"><?= date('M', strtotime($ev['event_date'])) ?></div>
        </div>
        <div style="flex:1;">
          <h4 style="font-size:var(--text-base);font-weight:700;margin-bottom:4px;"><?= e($ev['title']) ?></h4>
          <div style="font-size:var(--text-sm);color:var(--color-gray-500);">⏰ <?= formatTime($ev['start_time']) ?> &nbsp;|&nbsp; 📍 <?= e($ev['location_name'] ?? 'ไม่ระบุ') ?></div>
        </div>
        <div style="text-align:right;min-width:100px;">
          <div style="font-weight:700;color:var(--color-red);font-size:var(--text-lg);">
            <?= $ev['price']==0 ? 'ฟรี' : '฿'.number_format($ev['price'],0) ?>
          </div>
          <span class="badge <?= $s['class'] ?>"><?= $s['label'] ?></span>
        </div>
        <a href="event-detail.php?id=<?= $ev['id'] ?>" class="btn btn-ghost btn-sm">รายละเอียด</a>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- CTA Banner -->
<section style="background:linear-gradient(135deg,var(--color-red) 0%,var(--color-red-dark) 100%);padding:var(--space-16) 0;text-align:center;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background-image:url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");pointer-events:none;"></div>
  <div class="container" style="position:relative;z-index:1;">
    <div style="font-family:var(--font-jp);font-size:var(--text-sm);color:rgba(255,255,255,0.6);margin-bottom:var(--space-3);letter-spacing:0.2em;">今すぐ始めよう</div>
    <h2 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:white;margin-bottom:var(--space-4);">
      เริ่มต้นจองกิจกรรมญี่ปุ่น<br>ที่คุณใฝ่ฝันได้วันนี้เลย
    </h2>
    <p style="color:rgba(255,255,255,0.75);font-size:var(--text-lg);margin-bottom:var(--space-8);max-width:500px;margin-left:auto;margin-right:auto;">
      สมัครสมาชิกฟรี เข้าถึงกิจกรรมกว่า <?= $totalEvents ?> รายการ จองง่าย ปลอดภัย มี E-Ticket พร้อม QR Code
    </p>
    <div style="display:flex;gap:var(--space-4);justify-content:center;flex-wrap:wrap;">
      <a href="register.php" class="btn btn-gold btn-lg">🌸 สมัครสมาชิกฟรี</a>
      <a href="events.php" class="btn" style="border:2px solid rgba(255,255,255,0.5);color:white;padding:var(--space-4) var(--space-8);border-radius:var(--radius-lg);font-size:var(--text-lg);font-weight:600;">ดูกิจกรรม →</a>
    </div>
  </div>
</section>

<script>
function toggleFavoriteJS(eventId, btn) {
  fetch('api/favorites.php', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({event_id: eventId})
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      btn.textContent = data.favorited ? '❤️' : '🤍';
      btn.classList.toggle('active', data.favorited);
      showToast(data.message, 'success');
    }
  });
}
</script>

<?php 
// Helper to get event image
function getEventImageUrl($event) {
    $images = [
        'เทศกาล' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=75',
        'อาหาร'  => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=75',
        'วัฒนธรรมญี่ปุ่น' => 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=500&q=75',
        'คอนเสิร์ต' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&q=75',
        'ท่องเที่ยว' => 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=500&q=75',
        'Workshop' => 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=75',
        'Gaming'  => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=75',
        'Photography' => 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&q=75',
        'Technology' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=75',
        'Education' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=75',
    ];
    if (!empty($event['image'])) return $event['image'];
    return $images[$event['category']] ?? 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=500&q=75';
}
include 'includes/footer.php'; ?>
