<?php
// =====================================================
// Japanese Event Booking System - Configuration
// =====================================================

// App Info
define('APP_NAME', 'Sakura Events');
define('APP_NAME_JP', '桜イベント');
define('APP_TAGLINE', 'ระบบจองกิจกรรมธีมญี่ปุ่น');
define('APP_URL', 'http://localhost/japan-event');
define('APP_VERSION', '1.0.0');

// Database
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'japan_event_booking');
define('DB_CHARSET', 'utf8mb4');

// Session
define('SESSION_NAME', 'japan_event_session');
define('SESSION_LIFETIME', 86400); // 24 hours

// Security
define('CSRF_TOKEN_NAME', '_csrf_token');
define('BCRYPT_COST', 12);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

// Pagination
define('EVENTS_PER_PAGE', 12);
define('BOOKINGS_PER_PAGE', 10);

// Booking
define('BOOKING_CODE_PREFIX', 'JP');
define('MAX_BOOKING_QUANTITY', 10);
define('BOOKING_EXPIRY_HOURS', 24);

// Directories
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('QR_DIR', __DIR__ . '/../uploads/qrcodes/');

// Timezone
date_default_timezone_set('Asia/Bangkok');

// Error Reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => SESSION_LIFETIME,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}
