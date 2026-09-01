<?php
// Footer Include
?>
<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <!-- Brand -->
      <div>
        <div class="footer-brand-name">🌸 <?= APP_NAME_JP ?></div>
        <p class="footer-brand-desc">
          ระบบจองกิจกรรมและงานอีเวนต์ธีมญี่ปุ่น ค้นหา ตรวจสอบวันว่าง 
          และจองกิจกรรมได้อย่างง่ายดาย สะดวก รวดเร็ว ปลอดภัย
        </p>
        <div style="display:flex;gap:var(--space-3);">
          <a href="#" style="color:rgba(247,243,234,0.5);font-size:1.3rem;transition:color 0.2s;" 
             onmouseover="this.style.color='#C62828'" onmouseout="this.style.color='rgba(247,243,234,0.5)'">📘</a>
          <a href="#" style="color:rgba(247,243,234,0.5);font-size:1.3rem;transition:color 0.2s;"
             onmouseover="this.style.color='#C62828'" onmouseout="this.style.color='rgba(247,243,234,0.5)'">📸</a>
          <a href="#" style="color:rgba(247,243,234,0.5);font-size:1.3rem;transition:color 0.2s;"
             onmouseover="this.style.color='#C62828'" onmouseout="this.style.color='rgba(247,243,234,0.5)'">🐦</a>
        </div>
      </div>
      
      <!-- Links -->
      <div>
        <h4 class="footer-heading">กิจกรรม</h4>
        <div class="footer-links">
          <a href="<?= APP_URL ?>/events.php" class="footer-link">กิจกรรมทั้งหมด</a>
          <a href="<?= APP_URL ?>/calendar.php" class="footer-link">ปฏิทินกิจกรรม</a>
          <a href="<?= APP_URL ?>/events.php?category=เทศกาล" class="footer-link">เทศกาล</a>
          <a href="<?= APP_URL ?>/events.php?category=Workshop" class="footer-link">Workshop</a>
          <a href="<?= APP_URL ?>/events.php?category=คอนเสิร์ต" class="footer-link">คอนเสิร์ต</a>
        </div>
      </div>
      
      <div>
        <h4 class="footer-heading">บัญชีผู้ใช้</h4>
        <div class="footer-links">
          <a href="<?= APP_URL ?>/login.php" class="footer-link">เข้าสู่ระบบ</a>
          <a href="<?= APP_URL ?>/register.php" class="footer-link">สมัครสมาชิก</a>
          <a href="<?= APP_URL ?>/dashboard.php" class="footer-link">Dashboard</a>
          <a href="<?= APP_URL ?>/my-bookings.php" class="footer-link">การจองของฉัน</a>
          <a href="<?= APP_URL ?>/profile.php" class="footer-link">โปรไฟล์</a>
        </div>
      </div>
      
      <div id="contact">
        <h4 class="footer-heading">ติดต่อเรา</h4>
        <div class="footer-links">
          <span class="footer-link">📧 info@japan-event.com</span>
          <span class="footer-link">📞 02-XXX-XXXX</span>
          <span class="footer-link">📍 Bangkok, Thailand</span>
          <span class="footer-link">⏰ จ-ศ 09:00-18:00</span>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p class="footer-copy">
        © <?= date('Y') ?> <?= APP_NAME ?>. สงวนลิขสิทธิ์ทุกประการ
      </p>
      <div style="display:flex;gap:var(--space-4);">
        <a href="#" class="footer-link">นโยบายความเป็นส่วนตัว</a>
        <a href="#" class="footer-link">เงื่อนไขการใช้งาน</a>
      </div>
      <span class="footer-jp">桜 で 出会う・祭り で 繋がる</span>
    </div>
  </div>
</footer>

<!-- Main JS -->
<script src="<?= APP_URL ?>/assets/js/main.js"></script>
<?php if (isset($extraJs)) echo $extraJs; ?>
</body>
</html>
