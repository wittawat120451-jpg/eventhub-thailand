<?php
// =====================================================
// Event Detail Page
// =====================================================
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

$id    = (int)($_GET['id'] ?? 0);
$event = $id ? getEvent($id) : null;

if (!$event) {
    redirect(APP_URL . '/events.php', 'ไม่พบกิจกรรมนี้', 'error');
}

$status    = getEventStatusBadge($event);
$remaining = $event['capacity'] - $event['booked_count'];
$pct       = ($event['booked_count'] / max($event['capacity'], 1)) * 100;
$isFav     = isLoggedIn() ? isFavorited($_SESSION['user_id'], $event['id']) : false;
$canBook   = in_array($status['class'], ['badge-open', 'badge-almost']) && $remaining > 0;

$pageTitle = $event['title'];

function getEventImageUrl($event) {
    $images = [
        'เทศกาล' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        'อาหาร'  => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        'วัฒนธรรมญี่ปุ่น' => 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
        'คอนเสิร์ต' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
        'ท่องเที่ยว' => 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80',
        'Workshop' => 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
        'Gaming'  => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
        'Photography' => 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
        'Technology' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
        'Education' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    ];
    if (!empty($event['image'])) return $event['image'];
    return $images[$event['category']] ?? 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80';
}
$imgUrl = getEventImageUrl($event);

include 'includes/header.php';
?>

<style>
.detail-grid { display:grid; grid-template-columns:1fr 380px; gap:var(--space-8); align-items:start; padding:var(--space-8) 0 var(--space-16); }
.detail-hero { position:relative; border-radius:var(--radius-xl); overflow:hidden; aspect-ratio:16/9; }
.detail-hero img { width:100%; height:100%; object-fit:cover; }
.detail-hero-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(30,30,30,0.6) 0%, transparent 60%); }
.detail-badges { position:absolute; top:var(--space-4); left:var(--space-4); display:flex; gap:var(--space-2); }
.booking-card { background:var(--color-white); border-radius:var(--radius-xl); box-shadow:var(--shadow-lg); overflow:hidden; position:sticky; top:calc(var(--nav-height) + var(--space-4)); border:1px solid rgba(201,162,39,0.15); }
.booking-card-header { background:linear-gradient(135deg,var(--color-red),var(--color-red-dark)); padding:var(--space-5) var(--space-6); color:white; }
.booking-card-body { padding:var(--space-6); }
.info-row { display:flex; gap:var(--space-3); padding:var(--space-3) 0; border-bottom:1px solid var(--color-gray-100); }
.info-row:last-child { border-bottom:none; }
.info-icon { width:36px; height:36px; background:rgba(198,40,40,0.08); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
.info-label { font-size:var(--text-xs); color:var(--color-gray-500); margin-bottom:2px; }
.info-value { font-size:var(--text-sm); font-weight:600; }
.tab-nav { display:flex; gap:0; border-bottom:2px solid var(--color-gray-200); margin-bottom:var(--space-6); }
.tab-btn { padding:var(--space-3) var(--space-5); font-size:var(--text-sm); font-weight:600; color:var(--color-gray-500); cursor:pointer; border:none; background:none; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s; }
.tab-btn.active { color:var(--color-red); border-bottom-color:var(--color-red); }
.tab-content { display:none; }
.tab-content.active { display:block; }
@media(max-width:900px){ .detail-grid{grid-template-columns:1fr;} .booking-card{position:static;} }
</style>

<!-- Breadcrumb -->
<div style="background:var(--color-white);border-bottom:1px solid var(--color-gray-200);padding:var(--space-3) 0;">
  <div class="container">
    <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--color-gray-500);">
      <a href="index.php" style="color:var(--color-gray-500);">หน้าแรก</a>
      <span>›</span>
      <a href="events.php" style="color:var(--color-gray-500);">กิจกรรม</a>
      <span>›</span>
      <a href="events.php?category=<?= urlencode($event['category']) ?>" style="color:var(--color-gray-500);"><?= e($event['category']) ?></a>
      <span>›</span>
      <span style="color:var(--color-black);font-weight:500;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:200px;"><?= e($event['title']) ?></span>
    </div>
  </div>
</div>

<main>
  <div class="container">
    <div class="detail-grid">
      <!-- Left: Event Info -->
      <div>
        <!-- Hero Image -->
        <div class="detail-hero" style="margin-bottom:var(--space-6);">
          <img src="<?= e($imgUrl) ?>" alt="<?= e($event['title']) ?>">
          <div class="detail-hero-overlay"></div>
          <div class="detail-badges">
            <span class="badge <?= $status['class'] ?>"><?= $status['label'] ?></span>
            <span class="event-category-tag" style="background:rgba(255,255,255,0.9);">
              <?= e($event['category_icon'] ?? '🎎') ?> <?= e($event['category']) ?>
            </span>
          </div>
          <?php if (isLoggedIn()): ?>
          <button id="favBtn" onclick="toggleFav(<?= $event['id'] ?>)"
                  style="position:absolute;top:var(--space-4);right:var(--space-4);background:rgba(255,255,255,0.9);border:none;width:44px;height:44px;border-radius:50%;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s;box-shadow:var(--shadow-md);"
                  title="เพิ่มในรายการโปรด">
            <?= $isFav ? '❤️' : '🤍' ?>
          </button>
          <?php endif; ?>
        </div>
        
        <!-- Title & Rating -->
        <div style="margin-bottom:var(--space-5);">
          <h1 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;line-height:1.3;margin-bottom:var(--space-3);">
            <?= e($event['title']) ?>
          </h1>
          <div style="display:flex;align-items:center;gap:var(--space-4);flex-wrap:wrap;">
            <div class="rating-display">
              <?= renderStars($event['rating']) ?>
              <span class="rating-number" style="font-size:var(--text-lg);"><?= number_format($event['rating'],1) ?></span>
              <span class="rating-count">(<?= $event['rating_count'] ?> รีวิว)</span>
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-2);color:var(--color-gray-500);font-size:var(--text-sm);">
              <span>👥</span>
              <span>ผู้จัดโดย: <strong style="color:var(--color-black);"><?= e($event['organizer'] ?? 'Japan Events Thailand') ?></strong></span>
            </div>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="tab-nav">
          <button class="tab-btn active" onclick="switchTab('detail', this)">รายละเอียด</button>
          <button class="tab-btn" onclick="switchTab('location', this)">สถานที่</button>
          <button class="tab-btn" onclick="switchTab('rules', this)">กฎและเงื่อนไข</button>
        </div>
        
        <!-- Tab: Detail -->
        <div id="tab-detail" class="tab-content active">
          <div style="line-height:1.8;color:var(--color-black-soft);margin-bottom:var(--space-6);">
            <?= nl2br(e($event['description'] ?? '')) ?>
          </div>
          
          <?php if (!empty($event['requirements'])): ?>
          <div class="card" style="padding:var(--space-5);margin-bottom:var(--space-4);border-left:4px solid var(--color-gold);">
            <h4 style="margin-bottom:var(--space-3);display:flex;align-items:center;gap:var(--space-2);">
              📋 สิ่งที่ต้องเตรียม
            </h4>
            <p style="font-size:var(--text-sm);line-height:1.7;color:var(--color-gray-600);"><?= nl2br(e($event['requirements'])) ?></p>
          </div>
          <?php endif; ?>
          
          <!-- Share -->
          <div style="margin-top:var(--space-6);padding-top:var(--space-5);border-top:1px solid var(--color-gray-200);">
            <p style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-3);">แชร์กิจกรรมนี้:</p>
            <div style="display:flex;gap:var(--space-2);">
              <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>showToast('คัดลอก URL แล้ว','success'))" class="btn btn-ghost btn-sm">📋 คัดลอก URL</button>
              <a href="https://www.facebook.com/sharer/sharer.php?u=<?= urlencode(APP_URL.'/event-detail.php?id='.$event['id']) ?>" target="_blank" class="btn btn-ghost btn-sm">📘 Facebook</a>
              <a href="https://line.me/R/msg/text/?<?= urlencode($event['title'].' '.APP_URL.'/event-detail.php?id='.$event['id']) ?>" target="_blank" class="btn btn-ghost btn-sm">💚 Line</a>
            </div>
          </div>
        </div>
        
        <!-- Tab: Location -->
        <div id="tab-location" class="tab-content">
          <div class="card" style="padding:var(--space-5);margin-bottom:var(--space-4);">
            <h4 style="margin-bottom:var(--space-3);font-size:var(--text-lg);">📍 <?= e($event['location_name'] ?? 'สถานที่จัดงาน') ?></h4>
            <p style="color:var(--color-gray-600);margin-bottom:var(--space-4);"><?= e($event['location_address'] ?? '') ?></p>
            <?php if (!empty($event['latitude']) && !empty($event['longitude'])): ?>
            <div style="border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--color-gray-200);">
              <iframe 
                src="https://maps.google.com/maps?q=<?= $event['latitude'] ?>,<?= $event['longitude'] ?>&output=embed&z=15"
                width="100%" height="300" style="border:0;display:block;" 
                allowfullscreen loading="lazy">
              </iframe>
            </div>
            <a href="https://maps.google.com/maps?q=<?= $event['latitude'] ?>,<?= $event['longitude'] ?>" 
               target="_blank" class="btn btn-ghost btn-sm" style="margin-top:var(--space-3);">
              🗺 เปิดใน Google Maps
            </a>
            <?php else: ?>
            <p style="color:var(--color-gray-400);font-size:var(--text-sm);">ไม่มีแผนที่</p>
            <?php endif; ?>
          </div>
          
          <?php if (!empty($event['organizer_contact'])): ?>
          <div class="card" style="padding:var(--space-5);">
            <h4 style="margin-bottom:var(--space-3);">📞 ติดต่อผู้จัดงาน</h4>
            <p style="font-size:var(--text-sm);"><?= e($event['organizer_contact']) ?></p>
          </div>
          <?php endif; ?>
        </div>
        
        <!-- Tab: Rules -->
        <div id="tab-rules" class="tab-content">
          <?php if (!empty($event['rules'])): ?>
          <div class="card" style="padding:var(--space-5);border-left:4px solid var(--color-red);">
            <h4 style="margin-bottom:var(--space-3);display:flex;align-items:center;gap:var(--space-2);">
              ⚠️ กฎและเงื่อนไขการเข้าร่วม
            </h4>
            <p style="font-size:var(--text-sm);line-height:1.8;color:var(--color-gray-600);"><?= nl2br(e($event['rules'])) ?></p>
          </div>
          <?php else: ?>
          <p style="color:var(--color-gray-400);">ไม่มีกฎพิเศษ</p>
          <?php endif; ?>
          
          <div class="card" style="padding:var(--space-5);margin-top:var(--space-4);background:rgba(198,40,40,0.03);">
            <h4 style="margin-bottom:var(--space-3);">🔄 นโยบายการยกเลิก</h4>
            <ul style="list-style:disc;padding-left:var(--space-5);font-size:var(--text-sm);line-height:2;color:var(--color-gray-600);">
              <li>ยกเลิกก่อน 7 วัน: คืนเงิน 100%</li>
              <li>ยกเลิกก่อน 3-7 วัน: คืนเงิน 50%</li>
              <li>ยกเลิกน้อยกว่า 3 วัน: ไม่คืนเงิน</li>
              <li>กิจกรรมถูกยกเลิกโดยผู้จัด: คืนเงิน 100%</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Right: Booking Card -->
      <div>
        <div class="booking-card">
          <div class="booking-card-header">
            <div style="font-size:var(--text-2xl);font-weight:800;margin-bottom:4px;">
              <?= $event['price'] == 0 ? 'ฟรี!' : '฿'.number_format($event['price'],0) ?>
            </div>
            <div style="opacity:0.8;font-size:var(--text-sm);"><?= $event['price'] > 0 ? 'บาท / คน' : 'ไม่มีค่าใช้จ่าย' ?></div>
          </div>
          <div class="booking-card-body">
            <!-- Seat progress -->
            <div style="margin-bottom:var(--space-5);">
              <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:var(--space-2);">
                <span style="font-weight:600;">ที่นั่งว่าง</span>
                <span style="color:<?= $pct>=90?'var(--color-danger)':($pct>=70?'var(--color-warning)':'var(--color-matcha)') ?>;font-weight:700;">
                  <?= $remaining ?> / <?= $event['capacity'] ?> ที่
                </span>
              </div>
              <div class="progress">
                <div class="progress-bar <?= $pct>=90?'red':($pct>=70?'yellow':'green') ?>" style="width:<?= min($pct,100) ?>%"></div>
              </div>
              <?php if ($pct >= 80 && $remaining > 0): ?>
              <p style="font-size:var(--text-xs);color:var(--color-warning);margin-top:4px;font-weight:600;">⚠️ ที่นั่งใกล้เต็ม! จองก่อนพลาด</p>
              <?php endif; ?>
            </div>
            
            <!-- Event Info -->
            <div style="margin-bottom:var(--space-5);">
              <div class="info-row">
                <div class="info-icon">📅</div>
                <div><div class="info-label">วันที่</div><div class="info-value"><?= formatDateThai($event['event_date']) ?></div></div>
              </div>
              <div class="info-row">
                <div class="info-icon">⏰</div>
                <div><div class="info-label">เวลา</div><div class="info-value"><?= formatTime($event['start_time']) ?> – <?= formatTime($event['end_time']) ?></div></div>
              </div>
              <div class="info-row">
                <div class="info-icon">📍</div>
                <div><div class="info-label">สถานที่</div><div class="info-value"><?= e($event['location_name'] ?? 'ไม่ระบุ') ?></div></div>
              </div>
              <div class="info-row">
                <div class="info-icon">👥</div>
                <div><div class="info-label">จำนวนสูงสุด</div><div class="info-value"><?= $event['capacity'] ?> คน</div></div>
              </div>
              <div class="info-row">
                <div class="info-icon">🎟</div>
                <div>
                  <div class="info-label">สถานะ</div>
                  <div class="info-value"><span class="badge <?= $status['class'] ?>"><?= $status['label'] ?></span></div>
                </div>
              </div>
            </div>
            
            <!-- Book Button -->
            <?php if ($canBook): ?>
              <?php if (isLoggedIn()): ?>
              <a href="booking.php?event_id=<?= $event['id'] ?>" class="btn btn-primary w-full btn-lg" style="justify-content:center;">
                🎌 จองกิจกรรมนี้
              </a>
              <?php else: ?>
              <a href="login.php?redirect=<?= urlencode('booking.php?event_id='.$event['id']) ?>" class="btn btn-primary w-full btn-lg" style="justify-content:center;">
                🔑 เข้าสู่ระบบเพื่อจอง
              </a>
              <?php endif; ?>
              <?php if (isLoggedIn()): ?>
              <button id="favBtnMobile" onclick="toggleFav(<?= $event['id'] ?>)" 
                      class="btn btn-ghost w-full" style="margin-top:var(--space-3);">
                <?= $isFav ? '❤️ ในรายการโปรดแล้ว' : '🤍 เพิ่มในรายการโปรด' ?>
              </button>
              <?php endif; ?>
            <?php else: ?>
            <button class="btn btn-ghost w-full btn-lg" disabled><?= $status['label'] ?> - ไม่สามารถจองได้</button>
            <?php endif; ?>
            
            <!-- Trust Badges -->
            <div style="display:flex;justify-content:center;gap:var(--space-4);margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--color-gray-100);">
              <div style="text-align:center;font-size:var(--text-xs);color:var(--color-gray-500);">
                <div style="font-size:1.2rem;">🔒</div>ปลอดภัย
              </div>
              <div style="text-align:center;font-size:var(--text-xs);color:var(--color-gray-500);">
                <div style="font-size:1.2rem;">✅</div>มี E-Ticket
              </div>
              <div style="text-align:center;font-size:var(--text-xs);color:var(--color-gray-500);">
                <div style="font-size:1.2rem;">🔄</div>คืนเงินได้
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<script>
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tabId).classList.add('active');
}

function toggleFav(eventId) {
  fetch('api/favorites.php', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({event_id: eventId})
  }).then(r => r.json()).then(data => {
    if (data.success) {
      const favBtn = document.getElementById('favBtn');
      const favBtnMobile = document.getElementById('favBtnMobile');
      if (favBtn) favBtn.textContent = data.favorited ? '❤️' : '🤍';
      if (favBtnMobile) favBtnMobile.textContent = data.favorited ? '❤️ ในรายการโปรดแล้ว' : '🤍 เพิ่มในรายการโปรด';
      showToast(data.message, 'success');
    } else if (data.redirect) {
      window.location.href = data.redirect;
    }
  });
}
</script>

<?php include 'includes/footer.php'; ?>
