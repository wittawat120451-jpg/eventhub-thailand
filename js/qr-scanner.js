/**
 * EVENTSPHERE - QR Code Check-in Scanner Module
 */

class QRScannerModule {
  constructor() {
    this.isScanning = false;
    this.initEventListeners();
  }

  initEventListeners() {
    const scanBtn = document.getElementById('openQRScannerBtn');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => this.openScannerModal());
    }

    const checkInManualForm = document.getElementById('manualCheckInForm');
    if (checkInManualForm) {
      checkInManualForm.addEventListener('submit', (e) => this.handleManualCheckIn(e));
    }
  }

  openScannerModal() {
    const modal = document.getElementById('qrScannerModal');
    const resultBox = document.getElementById('scanResultBox');
    const input = document.getElementById('manualTicketIdInput');

    if (resultBox) resultBox.style.display = 'none';
    if (input) input.value = '';

    modal.classList.add('show');
  }

  closeScannerModal() {
    const modal = document.getElementById('qrScannerModal');
    if (modal) modal.classList.remove('show');
  }

  handleManualCheckIn(e) {
    e.preventDefault();
    const input = document.getElementById('manualTicketIdInput');
    if (!input) return;

    const rawCode = input.value.trim();
    if (!rawCode) {
      window.app.showToast('กรุณากรอกรหัสการจอง หรือสแกน QR Code', 'warning');
      return;
    }

    this.processCheckIn(rawCode);
  }

  // Process QR Payload or Ticket Ref
  processCheckIn(code) {
    // Extract ID if full payload like EVENTSPHERE:bk-982101:...
    let bookingIdOrRef = code;
    if (code.startsWith('EVENTSPHERE:')) {
      const parts = code.split(':');
      bookingIdOrRef = parts[1] || code;
    }

    try {
      const result = window.store.checkInBooking(bookingIdOrRef);
      const booking = result.booking;
      const event = window.store.getEventById(booking.eventId);

      this.playSuccessBeep();

      const resultBox = document.getElementById('scanResultBox');
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div style="background: ${result.alreadyCheckedIn ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'}; border: 1.5px solid ${result.alreadyCheckedIn ? 'var(--accent-amber)' : 'var(--accent-emerald)'}; border-radius: var(--radius-lg); padding: 1.25rem; text-align: center; animation: modalPop 0.3s ease;">
            <div style="font-size: 2.5rem; color: ${result.alreadyCheckedIn ? 'var(--accent-amber)' : 'var(--accent-emerald)'}; margin-bottom: 0.5rem;">
              <i class="fa-solid ${result.alreadyCheckedIn ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">
              ${result.alreadyCheckedIn ? 'ตั๋วนี้เคยเช็คอินไปแล้ว' : 'เช็คอินสำเร็จเรียบร้อย!'}
            </h3>
            <p style="font-size: 1.05rem; font-weight: 700; color: var(--primary-400); margin-bottom: 0.5rem;">
              ${booking.attendeeName} (${booking.seats} ที่นั่ง)
            </p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
              ${event ? event.title : ''} &bull; รหัส: ${booking.refCode}
            </p>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">
              เวลาเช็คอิน: ${new Date(booking.checkedInAt || Date.now()).toLocaleTimeString('th-TH')} น.
            </div>
          </div>
        `;
      }

      window.app.showToast(`เช็คอินคุณ ${booking.attendeeName} สำเร็จ!`, 'success');
    } catch (err) {
      this.playErrorBeep();
      window.app.showToast(err.message, 'error');
    }
  }

  // Web Audio Synthesizer Beeps
  playSuccessBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.1); // D6
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  playErrorBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  }
}

// Global Scanner Instance
window.qrScannerModule = new QRScannerModule();
