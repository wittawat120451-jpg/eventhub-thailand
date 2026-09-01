<?php
// =====================================================
// Events List Page
// =====================================================
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

// Filters from query string
$filters = [
    'search'    => trim($_GET['search'] ?? ''),
    'category'  => trim($_GET['category'] ?? ''),
    'date'      => trim($_GET['date'] ?? ''),
    'price_max' => isset($_GET['price_max']) && $_GET['price_max'] !== '' ? $_GET['price_max'] : '',
    'location_id'=> trim($_GET['location_id'] ?? ''),
];
$page       = max(1, (int)($_GET['page'] ?? 1));
$result     = getEvents($filters, $page);
$categories = getCategories();
$locations  = getLocations();

$pageTitle = 'กิจกรรมทั้งหมด';

// Helper image function
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

include 'includes/header.php';
?>

<style>
.events-page { padding: var(--space-8) 0 var(--space-16); }
.events-layout { display: grid; grid-template-columns: 260px 1fr; gap: var(--space-8); align-items: start; }
.filter-sidebar { background:var(--color-white); border-radius:var(--radius-xl); box-shadow:var(--shadow-sm); padding:var(--space-6); position:sticky; top:calc(var(--nav-height) + var(--space-4)); }
.filter-section { margin-bottom:var(--space-6); }
.filter-section:last-child { margin-bottom:0; }
.filter-title { font-size:var(--text-sm); font-weight:700; color:var(--color-black); margin-bottom:var(--space-3); padding-bottom:var(--space-2); border-bottom:2px solid var(--color-red); display:block; }
.filter-option { display:flex; align-items:center; gap:var(--space-2); padding:var(--space-2) 0; cursor:pointer; }
.filter-option input { accent-color: var(--color-red); }
.filter-option label { font-size:var(--text-sm); cursor:pointer; }
.events-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-5); flex-wrap:wrap; gap:var(--space-3); }
.active-filters { display:flex; flex-wrap:wrap; gap:var(--space-2); margin-bottom:var(--space-4); }
.active-filter-tag { display:inline-flex; align-items:center; gap:var(--space-2); background:rgba(198,40,40,0.08); color:var(--color-red); border:1px solid rgba(198,40,40,0.2); padding:2px var(--space-3); border-radius:var(--radius-full); font-size:var(--text-xs); font-weight:600; }
.active-filter-tag a { color:var(--color-red); font-size:10px; margin-left:2px; }
@media(max-width:768px){ .events-layout{grid-template-columns:1fr;} .filter-sidebar{position:static;} }
</style>

<!-- Page Header -->
<div style="background:linear-gradient(135deg,#1E1E1E 0%,#2C1810 100%);padding:var(--space-10) 0;text-align:center;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=50');background-size:cover;background-position:center;opacity:0.15;"></div>
  <div class="container" style="position:relative;z-index:1;">
    <span style="font-family:var(--font-jp);font-size:var(--text-sm);color:var(--color-gold);letter-spacing:0.2em;display:block;margin-bottom:var(--space-2);">イベント一覧</span>
    <h1 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:var(--color-cream);margin-bottom:var(--space-3);">
      <?= !empty($filters['category']) ? e($filters['category']) : 'กิจกรรมทั้งหมด' ?>
    </h1>
    <p style="color:rgba(247,243,234,0.65);font-size:var(--text-base);">พบ <?= $result['total'] ?> กิจกรรม</p>
  </div>
</div>

<main class="events-page">
  <div class="container">
    <!-- Mobile Search -->
    <form action="" method="GET" style="margin-bottom:var(--space-4);">
      <div class="search-box" style="border-radius:var(--radius-lg);">
        <span style="padding:0 var(--space-3);color:var(--color-gray-400);">🔍</span>
        <input type="text" name="search" class="search-input" placeholder="ค้นหากิจกรรม..." value="<?= e($filters['search']) ?>">
        <?= !empty($filters['category']) ? '<input type="hidden" name="category" value="'.e($filters['category']).'">' : '' ?>
        <button type="submit" class="btn btn-primary btn-sm" style="margin:4px;">ค้นหา</button>
      </div>
    </form>
    
    <!-- Quick Filters -->
    <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-5);">
      <a href="events.php" class="filter-chip <?= empty($filters['date']) && empty($filters['category']) ? 'active' : '' ?>">🌸 ทั้งหมด</a>
      <a href="?date=today<?= !empty($filters['category']) ? '&category='.urlencode($filters['category']) : '' ?>" class="filter-chip <?= $filters['date']==='today' ? 'active' : '' ?>">📅 วันนี้</a>
      <a href="?date=week<?= !empty($filters['category']) ? '&category='.urlencode($filters['category']) : '' ?>" class="filter-chip <?= $filters['date']==='week' ? 'active' : '' ?>">📆 สัปดาห์นี้</a>
      <a href="?date=month<?= !empty($filters['category']) ? '&category='.urlencode($filters['category']) : '' ?>" class="filter-chip <?= $filters['date']==='month' ? 'active' : '' ?>">🗓 เดือนนี้</a>
      <?php foreach ($categories as $cat): ?>
      <a href="?category=<?= urlencode($cat['category']) ?>" class="filter-chip <?= $filters['category']===$cat['category'] ? 'active' : '' ?>">
        <?= e($cat['category_icon']) ?> <?= e($cat['category']) ?>
      </a>
      <?php endforeach; ?>
    </div>
    
    <!-- Active Filters -->
    <?php 
    $hasFilters = array_filter($filters);
    if (!empty($hasFilters)): ?>
    <div class="active-filters">
      <?php if (!empty($filters['search'])): ?>
      <span class="active-filter-tag">🔍 "<?= e($filters['search']) ?>" <a href="?<?= http_build_query(array_merge($filters, ['search'=>''])) ?>">✕</a></span>
      <?php endif; ?>
      <?php if (!empty($filters['category'])): ?>
      <span class="active-filter-tag">🏷 <?= e($filters['category']) ?> <a href="?<?= http_build_query(array_merge($filters, ['category'=>''])) ?>">✕</a></span>
      <?php endif; ?>
      <?php if (!empty($filters['date'])): ?>
      <span class="active-filter-tag">📅 <?= e($filters['date']) ?> <a href="?<?= http_build_query(array_merge($filters, ['date'=>''])) ?>">✕</a></span>
      <?php endif; ?>
      <a href="events.php" class="active-filter-tag" style="background:rgba(244,67,54,0.08);cursor:pointer;">✕ ล้างตัวกรองทั้งหมด</a>
    </div>
    <?php endif; ?>
    
    <div class="events-layout">
      <!-- Filter Sidebar -->
      <aside class="filter-sidebar">
        <h3 style="font-size:var(--text-lg);font-weight:700;margin-bottom:var(--space-5);display:flex;align-items:center;gap:var(--space-2);">
          🔧 กรองกิจกรรม
        </h3>
        
        <form action="" method="GET" id="filterForm">
          <?= !empty($filters['search']) ? '<input type="hidden" name="search" value="'.e($filters['search']).'">' : '' ?>
          
          <!-- Date Filter -->
          <div class="filter-section">
            <span class="filter-title">📅 วันที่</span>
            <label class="filter-option"><input type="radio" name="date" value="" <?= empty($filters['date'])?'checked':'' ?> onchange="this.form.submit()"> <label>ทั้งหมด</label></label>
            <label class="filter-option"><input type="radio" name="date" value="today" <?= $filters['date']==='today'?'checked':'' ?> onchange="this.form.submit()"> <label>วันนี้</label></label>
            <label class="filter-option"><input type="radio" name="date" value="tomorrow" <?= $filters['date']==='tomorrow'?'checked':'' ?> onchange="this.form.submit()"> <label>พรุ่งนี้</label></label>
            <label class="filter-option"><input type="radio" name="date" value="week" <?= $filters['date']==='week'?'checked':'' ?> onchange="this.form.submit()"> <label>สัปดาห์นี้</label></label>
            <label class="filter-option"><input type="radio" name="date" value="month" <?= $filters['date']==='month'?'checked':'' ?> onchange="this.form.submit()"> <label>เดือนนี้</label></label>
          </div>
          
          <!-- Category Filter -->
          <div class="filter-section">
            <span class="filter-title">🏷 ประเภทกิจกรรม</span>
            <label class="filter-option"><input type="radio" name="category" value="" <?= empty($filters['category'])?'checked':'' ?> onchange="this.form.submit()"> <label>ทั้งหมด</label></label>
            <?php foreach ($categories as $cat): ?>
            <label class="filter-option">
              <input type="radio" name="category" value="<?= e($cat['category']) ?>" 
                     <?= $filters['category']===$cat['category']?'checked':'' ?> 
                     onchange="this.form.submit()">
              <label><?= e($cat['category_icon']) ?> <?= e($cat['category']) ?> (<?= $cat['event_count'] ?>)</label>
            </label>
            <?php endforeach; ?>
          </div>
          
          <!-- Price Filter -->
          <div class="filter-section">
            <span class="filter-title">💰 ราคา</span>
            <label class="filter-option"><input type="radio" name="price_max" value="" <?= $filters['price_max']===''?'checked':'' ?> onchange="this.form.submit()"> <label>ทุกราคา</label></label>
            <label class="filter-option"><input type="radio" name="price_max" value="0" <?= $filters['price_max']==='0'?'checked':'' ?> onchange="this.form.submit()"> <label>🆓 ฟรี</label></label>
            <label class="filter-option"><input type="radio" name="price_max" value="500" <?= $filters['price_max']==='500'?'checked':'' ?> onchange="this.form.submit()"> <label>ไม่เกิน ฿500</label></label>
            <label class="filter-option"><input type="radio" name="price_max" value="1000" <?= $filters['price_max']==='1000'?'checked':'' ?> onchange="this.form.submit()"> <label>ไม่เกิน ฿1,000</label></label>
            <label class="filter-option"><input type="radio" name="price_max" value="2000" <?= $filters['price_max']==='2000'?'checked':'' ?> onchange="this.form.submit()"> <label>ไม่เกิน ฿2,000</label></label>
          </div>
          
          <!-- Location Filter -->
          <div class="filter-section">
            <span class="filter-title">📍 สถานที่</span>
            <select name="location_id" class="form-control" onchange="this.form.submit()">
              <option value="">ทุกสถานที่</option>
              <?php foreach ($locations as $loc): ?>
              <option value="<?= $loc['id'] ?>" <?= $filters['location_id']==(string)$loc['id']?'selected':'' ?>>
                <?= e($loc['name']) ?>
              </option>
              <?php endforeach; ?>
            </select>
          </div>
          
          <a href="events.php" class="btn btn-ghost w-full" style="margin-top:var(--space-4);">ล้างตัวกรอง</a>
        </form>
      </aside>
      
      <!-- Events Grid -->
      <div>
        <div class="events-header">
          <div>
            <span style="font-size:var(--text-sm);color:var(--color-gray-500);">
              แสดง <?= count($result['events']) ?> จาก <?= $result['total'] ?> กิจกรรม
              <?= !empty($filters['category']) ? " &ndash; " . e($filters['category']) : '' ?>
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <span style="font-size:var(--text-sm);color:var(--color-gray-500);">เรียงโดย:</span>
            <select class="form-control" style="width:auto;padding:var(--space-2) var(--space-3);" onchange="sortEvents(this.value)">
              <option value="date">วันที่ใกล้สุด</option>
              <option value="popular">ยอดนิยม</option>
              <option value="price_low">ราคาต่ำ-สูง</option>
              <option value="price_high">ราคาสูง-ต่ำ</option>
            </select>
          </div>
        </div>
        
        <?php if (!empty($result['events'])): ?>
        <div class="events-grid" id="eventsGrid">
          <?php foreach ($result['events'] as $event): 
            $status    = getEventStatusBadge($event);
            $remaining = $event['capacity'] - $event['booked_count'];
            $pct       = ($event['booked_count'] / max($event['capacity'], 1)) * 100;
            $isFav     = isLoggedIn() ? isFavorited($_SESSION['user_id'], $event['id']) : false;
            $imgUrl    = getEventImageUrl($event);
          ?>
          <div class="card event-card" onclick="window.location='event-detail.php?id=<?= $event['id'] ?>'">
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
                  <span class="rating-count">(<?= $event['rating_count'] ?>)</span>
                </div>
              </div>
              <h3 style="font-size:var(--text-base);font-weight:700;margin-bottom:var(--space-3);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                <?= e($event['title']) ?>
              </h3>
              <div class="event-meta">
                <div class="event-meta-item"><span class="event-meta-icon">📅</span><span><?= formatDateThai($event['event_date']) ?></span></div>
                <div class="event-meta-item"><span class="event-meta-icon">⏰</span><span><?= formatTime($event['start_time']) ?> – <?= formatTime($event['end_time']) ?></span></div>
                <div class="event-meta-item"><span class="event-meta-icon">📍</span><span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"><?= e($event['location_name'] ?? 'ไม่ระบุสถานที่') ?></span></div>
                <div class="event-meta-item"><span class="event-meta-icon">👥</span><span>เหลือ <?= $remaining ?> / <?= $event['capacity'] ?> ที่นั่ง</span></div>
              </div>
              <div class="seats-indicator" style="margin-top:var(--space-2);">
                <div class="seats-bar" style="flex:1;">
                  <div class="seats-fill <?= $pct>=90?'red':($pct>=70?'yellow':'green') ?>" style="width:<?= min($pct,100) ?>%"></div>
                </div>
                <span style="font-size:10px;color:var(--color-gray-400);"><?= round($pct) ?>%</span>
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
                <a href="event-detail.php?id=<?= $event['id'] ?>" class="btn btn-ghost btn-sm" onclick="event.stopPropagation()">ดูรายละเอียด</a>
                <?php if ($status['class'] === 'badge-open' || $status['class'] === 'badge-almost'): ?>
                <a href="booking.php?event_id=<?= $event['id'] ?>" class="btn btn-primary btn-sm" onclick="event.stopPropagation()">จองเลย</a>
                <?php else: ?>
                <button class="btn btn-ghost btn-sm" disabled onclick="event.stopPropagation()"><?= $status['label'] ?></button>
                <?php endif; ?>
              </div>
            </div>
          </div>
          <?php endforeach; ?>
        </div>
        
        <!-- Pagination -->
        <?php if ($result['pages'] > 1): ?>
        <div class="pagination">
          <?php if ($page > 1): ?>
          <a href="?<?= http_build_query(array_merge($filters, ['page'=>$page-1])) ?>" class="page-btn">‹</a>
          <?php endif; ?>
          <?php for ($p = max(1,$page-2); $p <= min($result['pages'],$page+2); $p++): ?>
          <a href="?<?= http_build_query(array_merge($filters, ['page'=>$p])) ?>" 
             class="page-btn <?= $p===$page?'active':'' ?>"><?= $p ?></a>
          <?php endfor; ?>
          <?php if ($page < $result['pages']): ?>
          <a href="?<?= http_build_query(array_merge($filters, ['page'=>$page+1])) ?>" class="page-btn">›</a>
          <?php endif; ?>
        </div>
        <?php endif; ?>
        
        <?php else: ?>
        <div class="empty-state">
          <div class="empty-state-icon">🌸</div>
          <p class="empty-state-title">ไม่พบกิจกรรม</p>
          <p class="empty-state-desc">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          <a href="events.php" class="btn btn-primary">ดูกิจกรรมทั้งหมด</a>
        </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</main>

<script>
function toggleFavoriteJS(eventId, btn) {
  fetch('api/favorites.php', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({event_id: eventId})
  }).then(r => r.json()).then(data => {
    if (data.success) {
      btn.textContent = data.favorited ? '❤️' : '🤍';
      btn.classList.toggle('active', data.favorited);
      showToast(data.message, 'success');
    } else if (data.redirect) {
      window.location.href = data.redirect;
    }
  });
}
function sortEvents(val) {
  const url = new URL(window.location);
  url.searchParams.set('sort', val);
  window.location = url;
}
</script>

<?php include 'includes/footer.php'; ?>
