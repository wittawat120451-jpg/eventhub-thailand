<?php
// =====================================================
// Authentication & Authorization Functions
// =====================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// --------------------------------------------------
// Register new user
// --------------------------------------------------
function registerUser(string $name, string $email, string $phone, string $password): array {
    // Validate
    if (empty($name) || strlen($name) < 2) return ['success' => false, 'message' => 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return ['success' => false, 'message' => 'รูปแบบ Email ไม่ถูกต้อง'];
    if (strlen($password) < 8) return ['success' => false, 'message' => 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'];
    
    $pdo = db();
    
    // Check email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) return ['success' => false, 'message' => 'Email นี้ถูกใช้งานแล้ว'];
    
    // Hash password & insert
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'user')");
    $stmt->execute([$name, $email, $phone, $hash]);
    $userId = $pdo->lastInsertId();
    
    // Send welcome notification
    addNotification($userId, '🎌 ยินดีต้อนรับสู่ Sakura Events!', 'บัญชีของคุณถูกสร้างเรียบร้อยแล้ว เริ่มต้นค้นหากิจกรรมญี่ปุ่นที่คุณชื่นชอบได้เลย!', 'system');
    
    return ['success' => true, 'message' => 'สมัครสมาชิกสำเร็จ!', 'user_id' => $userId];
}

// --------------------------------------------------
// Login user
// --------------------------------------------------
function loginUser(string $email, string $password): array {
    $pdo = db();
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND status = 'active'");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        return ['success' => false, 'message' => 'Email หรือรหัสผ่านไม่ถูกต้อง'];
    }
    
    // Set session
    $_SESSION['user_id']   = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email']= $user['email'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['logged_in'] = true;
    
    return ['success' => true, 'message' => 'เข้าสู่ระบบสำเร็จ', 'role' => $user['role']];
}

// --------------------------------------------------
// Check if user is logged in
// --------------------------------------------------
function isLoggedIn(): bool {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

function isAdmin(): bool {
    return isLoggedIn() && ($_SESSION['user_role'] === 'admin' || $_SESSION['user_role'] === 'staff');
}

function requireLogin(string $redirect = '/japan-event/login.php'): void {
    if (!isLoggedIn()) {
        header('Location: ' . $redirect . '?redirect=' . urlencode($_SERVER['REQUEST_URI']));
        exit;
    }
}

function requireAdmin(): void {
    if (!isAdmin()) {
        header('Location: /japan-event/index.php?error=unauthorized');
        exit;
    }
}

// --------------------------------------------------
// Get current user
// --------------------------------------------------
function getCurrentUser(): ?array {
    if (!isLoggedIn()) return null;
    $pdo = db();
    $stmt = $pdo->prepare("SELECT id, name, email, phone, role, avatar, status, created_at FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch() ?: null;
}

// --------------------------------------------------
// Logout
// --------------------------------------------------
function logoutUser(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        setcookie(session_name(), '', time() - 42000, '/');
    }
    session_destroy();
}

// --------------------------------------------------
// CSRF Token
// --------------------------------------------------
function generateCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function csrfField(): string {
    return '<input type="hidden" name="' . CSRF_TOKEN_NAME . '" value="' . generateCsrfToken() . '">';
}

// --------------------------------------------------
// Add Notification
// --------------------------------------------------
function addNotification(int $userId, string $title, string $message, string $type = 'system', ?int $relatedId = null): void {
    $pdo = db();
    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $title, $message, $type, $relatedId]);
}

// --------------------------------------------------
// Get unread notification count
// --------------------------------------------------
function getUnreadNotificationCount(int $userId): int {
    $pdo = db();
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt->execute([$userId]);
    return (int) $stmt->fetchColumn();
}
