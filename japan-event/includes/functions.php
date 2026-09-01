<?php
// =====================================================
// Helper Functions
// =====================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// --------------------------------------------------
// Sanitize output
// --------------------------------------------------
function e(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// --------------------------------------------------
// Generate unique booking code
// --------------------------------------------------
function generateBookingCode(): string {
    $year = date('Y');
    $pdo  = db();
    $stmt = $pdo->query("SELECT COUNT(*) FROM bookings WHERE YEAR(created_at) = $year");
    $count = (int) $stmt->fetchColumn() + 1;
    return BOOKING_CODE_PREFIX . '-' . $year . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);
}

// --------------------------------------------------
// Format price
// --------------------------------------------------
function formatPrice(float $price): string {
    if ($price == 0) return '<span class="badge-free">ฟรี</span>';
    return number_format($price, 0) . ' บาท';
}

// --------------------------------------------------
// Format date Thai
// --------------------------------------------------
function formatDateThai(string $date): string {
    $months = ['', 'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
               'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    $d = new DateTime($date);
    return $d->format('j') . ' ' . $months[(int)$d->format('n')] . ' ' . ($d->format('Y') + 543);
}

// --------------------------------------------------
// Format time
// --------------------------------------------------
function formatTime(string $time): string {
    return date('H:i', strtotime($time)) . ' น.';
}

// --------------------------------------------------
// Event status label + badge class
// --------------------------------------------------
function getEventStatusBadge(array $event): array {
    $remaining = $event['capacity'] - $event['booked_count'];
    $percentFull = ($event['booked_count'] / max($event['capacity'], 1)) * 100;
    
    if ($event['status'] === 'cancelled') return ['label' => 'ยกเลิก', 'class' => 'badge-cancelled'];
    if ($event['status'] === 'closed')    return ['label' => 'ปิดการจอง', 'class' => 'badge-closed'];
    if ($event['status'] === 'completed') return ['label' => 'เสร็จสิ้น', 'class' => 'badge-completed'];
    if ($remaining <= 0)                  return ['label' => 'เต็มแล้ว', 'class' => 'badge-full'];
    if ($percentFull >= 80)               return ['label' => 'ใกล้เต็ม', 'class' => 'badge-almost'];
    return ['label' => 'เปิดจอง', 'class' => 'badge-open'];
}

// --------------------------------------------------
// Get all events (with optional filters)
// --------------------------------------------------
function getEvents(array $filters = [], int $page = 1, int $perPage = EVENTS_PER_PAGE): array {
    $pdo = db();
    $where = ["e.status = 'published'"];
    $params = [];
    
    if (!empty($filters['search'])) {
        $where[] = "(e.title LIKE ? OR e.description LIKE ? OR l.name LIKE ?)";
        $s = '%' . $filters['search'] . '%';
        $params = array_merge($params, [$s, $s, $s]);
    }
    if (!empty($filters['category'])) {
        $where[] = "e.category = ?";
        $params[] = $filters['category'];
    }
    if (!empty($filters['date'])) {
        switch ($filters['date']) {
            case 'today':    $where[] = "e.event_date = CURDATE()"; break;
            case 'tomorrow': $where[] = "e.event_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)"; break;
            case 'week':     $where[] = "e.event_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)"; break;
            case 'month':    $where[] = "MONTH(e.event_date) = MONTH(CURDATE()) AND YEAR(e.event_date) = YEAR(CURDATE())"; break;
            default:
                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $filters['date'])) {
                    $where[] = "e.event_date = ?";
                    $params[] = $filters['date'];
                }
        }
    }
    if (!empty($filters['price_max'])) {
        $where[] = "e.price <= ?";
        $params[] = (float) $filters['price_max'];
    }
    if (!empty($filters['location_id'])) {
        $where[] = "e.location_id = ?";
        $params[] = (int) $filters['location_id'];
    }
    
    $whereStr = implode(' AND ', $where);
    $offset   = ($page - 1) * $perPage;
    
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM events e LEFT JOIN locations l ON e.location_id = l.id WHERE $whereStr");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();
    
    $stmt = $pdo->prepare("
        SELECT e.*, l.name AS location_name, l.address AS location_address
        FROM events e 
        LEFT JOIN locations l ON e.location_id = l.id 
        WHERE $whereStr 
        ORDER BY e.event_date ASC 
        LIMIT $perPage OFFSET $offset
    ");
    $stmt->execute($params);
    $events = $stmt->fetchAll();
    
    return [
        'events'      => $events,
        'total'       => $total,
        'pages'       => ceil($total / $perPage),
        'current_page'=> $page
    ];
}

// --------------------------------------------------
// Get single event
// --------------------------------------------------
function getEvent(int $id): ?array {
    $pdo  = db();
    $stmt = $pdo->prepare("
        SELECT e.*, l.name AS location_name, l.address AS location_address,
               l.latitude, l.longitude, l.capacity AS location_capacity
        FROM events e 
        LEFT JOIN locations l ON e.location_id = l.id 
        WHERE e.id = ?
    ");
    $stmt->execute([$id]);
    return $stmt->fetch() ?: null;
}

// --------------------------------------------------
// Get events for calendar (month)
// --------------------------------------------------
function getEventsForCalendar(int $year, int $month): array {
    $pdo  = db();
    $stmt = $pdo->prepare("
        SELECT e.id, e.title, e.event_date, e.start_time, e.capacity, e.booked_count, e.status, e.price, e.category_icon
        FROM events e 
        WHERE YEAR(e.event_date) = ? AND MONTH(e.event_date) = ? AND e.status IN ('published','closed','completed')
        ORDER BY e.event_date, e.start_time
    ");
    $stmt->execute([$year, $month]);
    $events = $stmt->fetchAll();
    
    // Group by date
    $calendar = [];
    foreach ($events as $evt) {
        $calendar[$evt['event_date']][] = $evt;
    }
    return $calendar;
}

// --------------------------------------------------
// Get categories with event counts
// --------------------------------------------------
function getCategories(): array {
    $pdo  = db();
    $stmt = $pdo->query("
        SELECT category, category_icon, COUNT(*) AS event_count 
        FROM events WHERE status = 'published' 
        GROUP BY category, category_icon ORDER BY event_count DESC
    ");
    return $stmt->fetchAll();
}

// --------------------------------------------------
// Create booking
// --------------------------------------------------
function createBooking(int $userId, int $eventId, int $quantity, string $notes = ''): array {
    $pdo = db();
    
    // Lock and check seats
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT capacity, booked_count, status, price, title FROM events WHERE id = ? FOR UPDATE");
        $stmt->execute([$eventId]);
        $event = $stmt->fetch();
        
        if (!$event) throw new Exception('ไม่พบกิจกรรม');
        if ($event['status'] !== 'published') throw new Exception('กิจกรรมนี้ปิดรับจองแล้ว');
        
        $remaining = $event['capacity'] - $event['booked_count'];
        if ($remaining < $quantity) throw new Exception("ที่นั่งไม่เพียงพอ มีที่นั่งว่างเพียง $remaining ที่");
        if ($quantity < 1 || $quantity > MAX_BOOKING_QUANTITY) throw new Exception("จำนวนผู้เข้าร่วมต้อง 1-" . MAX_BOOKING_QUANTITY . " คน");
        
        $totalPrice   = $event['price'] * $quantity;
        $bookingCode  = generateBookingCode();
        
        $stmt = $pdo->prepare("INSERT INTO bookings (booking_code, user_id, event_id, quantity, total_price, payment_status, booking_status, notes) VALUES (?, ?, ?, ?, ?, 'pending', 'pending', ?)");
        $stmt->execute([$bookingCode, $userId, $eventId, $quantity, $totalPrice, $notes]);
        $bookingId = $pdo->lastInsertId();
        
        // Update booked_count
        $pdo->prepare("UPDATE events SET booked_count = booked_count + ? WHERE id = ?")->execute([$quantity, $eventId]);
        
        // Generate QR data
        $qrData  = "BOOKING:{$bookingCode}|EVENT:{$eventId}|USER:{$userId}|QTY:{$quantity}";
        $qrCode  = 'QR-' . $bookingCode;
        $pdo->prepare("INSERT INTO tickets (booking_id, qr_code, qr_data) VALUES (?, ?, ?)")->execute([$bookingId, $qrCode, $qrData]);
        
        $pdo->commit();
        
        // Notifications
        addNotification($userId, '🎌 จองสำเร็จ!', "การจอง \"{$event['title']}\" เรียบร้อยแล้ว รหัสจอง: {$bookingCode}", 'booking', $bookingId);
        
        return ['success' => true, 'booking_id' => $bookingId, 'booking_code' => $bookingCode, 'total_price' => $totalPrice];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

// --------------------------------------------------
// Get booking details
// --------------------------------------------------
function getBooking(int $bookingId, ?int $userId = null): ?array {
    $pdo  = db();
    $sql  = "SELECT b.*, e.title, e.event_date, e.start_time, e.end_time, e.image, e.category,
                    l.name AS location_name, l.address AS location_address,
                    u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
                    t.qr_code, t.qr_data, t.ticket_status,
                    p.payment_method, p.paid_at, p.transaction_id
             FROM bookings b
             JOIN events e ON b.event_id = e.id
             LEFT JOIN locations l ON e.location_id = l.id
             JOIN users u ON b.user_id = u.id
             LEFT JOIN tickets t ON t.booking_id = b.id
             LEFT JOIN payments p ON p.booking_id = b.id
             WHERE b.id = ?";
    $params = [$bookingId];
    if ($userId !== null) { $sql .= " AND b.user_id = ?"; $params[] = $userId; }
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch() ?: null;
}

// --------------------------------------------------
// Get user bookings
// --------------------------------------------------
function getUserBookings(int $userId): array {
    $pdo  = db();
    $stmt = $pdo->prepare("
        SELECT b.*, e.title, e.event_date, e.start_time, e.image, e.category_icon,
               l.name AS location_name, t.ticket_status
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        LEFT JOIN locations l ON e.location_id = l.id
        LEFT JOIN tickets t ON t.booking_id = b.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    ");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

// --------------------------------------------------
// Cancel booking
// --------------------------------------------------
function cancelBooking(int $bookingId, int $userId): array {
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ?");
        $stmt->execute([$bookingId, $userId]);
        $booking = $stmt->fetch();
        if (!$booking) throw new Exception('ไม่พบการจองนี้');
        if ($booking['booking_status'] === 'cancelled') throw new Exception('การจองนี้ถูกยกเลิกแล้ว');
        
        $pdo->prepare("UPDATE bookings SET booking_status = 'cancelled', payment_status = 'refunded' WHERE id = ?")->execute([$bookingId]);
        $pdo->prepare("UPDATE tickets SET ticket_status = 'cancelled' WHERE booking_id = ?")->execute([$bookingId]);
        $pdo->prepare("UPDATE events SET booked_count = GREATEST(0, booked_count - ?) WHERE id = ?")->execute([$booking['quantity'], $booking['event_id']]);
        
        $pdo->commit();
        addNotification($userId, '❌ ยกเลิกการจอง', "การจอง #{$booking['booking_code']} ถูกยกเลิกแล้ว", 'booking', $bookingId);
        return ['success' => true, 'message' => 'ยกเลิกการจองสำเร็จ'];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

// --------------------------------------------------
// Check-in ticket
// --------------------------------------------------
function checkinTicket(string $qrCode, int $staffId): array {
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT t.*, b.booking_code, b.quantity, b.user_id, b.event_id, 
                                      e.title, e.event_date, u.name AS user_name
                               FROM tickets t
                               JOIN bookings b ON t.booking_id = b.id
                               JOIN events e ON b.event_id = e.id
                               JOIN users u ON b.user_id = u.id
                               WHERE t.qr_code = ? FOR UPDATE");
        $stmt->execute([$qrCode]);
        $ticket = $stmt->fetch();
        
        if (!$ticket) throw new Exception('ไม่พบ QR Code นี้ในระบบ');
        if ($ticket['ticket_status'] === 'used') throw new Exception('QR Code นี้ถูกใช้ Check-in ไปแล้ว');
        if ($ticket['ticket_status'] === 'cancelled') throw new Exception('Ticket นี้ถูกยกเลิกแล้ว');
        
        $pdo->prepare("UPDATE tickets SET ticket_status='used', checked_in_at=NOW(), checked_in_by=? WHERE id=?")->execute([$staffId, $ticket['id']]);
        $pdo->prepare("UPDATE bookings SET booking_status='completed' WHERE id=?")->execute([$ticket['booking_id']]);
        $pdo->commit();
        
        return ['success' => true, 'ticket' => $ticket, 'message' => 'Check-in สำเร็จ!'];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

// --------------------------------------------------
// Toggle favorite
// --------------------------------------------------
function toggleFavorite(int $userId, int $eventId): array {
    $pdo  = db();
    $stmt = $pdo->prepare("SELECT id FROM favorites WHERE user_id = ? AND event_id = ?");
    $stmt->execute([$userId, $eventId]);
    if ($stmt->fetch()) {
        $pdo->prepare("DELETE FROM favorites WHERE user_id = ? AND event_id = ?")->execute([$userId, $eventId]);
        return ['success' => true, 'favorited' => false, 'message' => 'ลบออกจากรายการโปรดแล้ว'];
    }
    $pdo->prepare("INSERT INTO favorites (user_id, event_id) VALUES (?, ?)")->execute([$userId, $eventId]);
    return ['success' => true, 'favorited' => true, 'message' => 'เพิ่มในรายการโปรดแล้ว'];
}

// --------------------------------------------------
// Check if event is favorited
// --------------------------------------------------
function isFavorited(int $userId, int $eventId): bool {
    $pdo  = db();
    $stmt = $pdo->prepare("SELECT id FROM favorites WHERE user_id = ? AND event_id = ?");
    $stmt->execute([$userId, $eventId]);
    return (bool) $stmt->fetch();
}

// --------------------------------------------------
// Get user favorites
// --------------------------------------------------
function getUserFavorites(int $userId): array {
    $pdo  = db();
    $stmt = $pdo->prepare("
        SELECT e.*, l.name AS location_name
        FROM favorites f
        JOIN events e ON f.event_id = e.id
        LEFT JOIN locations l ON e.location_id = l.id
        WHERE f.user_id = ? AND e.status = 'published'
        ORDER BY f.created_at DESC
    ");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

// --------------------------------------------------
// Confirm payment
// --------------------------------------------------
function confirmPayment(int $bookingId, string $method, ?string $transactionId = null): array {
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$bookingId]);
        $booking = $stmt->fetch();
        if (!$booking) throw new Exception('ไม่พบการจอง');
        
        $pdo->prepare("UPDATE bookings SET payment_status='paid', booking_status='confirmed' WHERE id=?")->execute([$bookingId]);
        $pdo->prepare("INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, paid_at) VALUES (?, ?, ?, 'paid', ?, NOW())")->execute([$bookingId, $booking['total_price'], $method, $transactionId ?? uniqid('TXN')]);
        
        $pdo->commit();
        addNotification($booking['user_id'], '✅ ชำระเงินสำเร็จ', "รับชำระเงิน {$booking['total_price']} บาท สำหรับการจอง #{$booking['booking_code']} เรียบร้อยแล้ว", 'payment', $bookingId);
        return ['success' => true, 'message' => 'ชำระเงินสำเร็จ'];
    } catch (Exception $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

// --------------------------------------------------
// Admin: Analytics summary
// --------------------------------------------------
function getAnalytics(): array {
    $pdo = db();
    return [
        'total_users'    => (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role='user'")->fetchColumn(),
        'total_events'   => (int) $pdo->query("SELECT COUNT(*) FROM events")->fetchColumn(),
        'total_bookings' => (int) $pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn(),
        'total_revenue'  => (float) $pdo->query("SELECT COALESCE(SUM(total_price),0) FROM bookings WHERE payment_status='paid'")->fetchColumn(),
        'today_bookings' => (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE DATE(created_at)=CURDATE()")->fetchColumn(),
        'pending_payments'=> (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE payment_status='pending'")->fetchColumn(),
        'popular_events' => $pdo->query("SELECT e.title, e.category_icon, e.booked_count, e.capacity FROM events e ORDER BY e.booked_count DESC LIMIT 5")->fetchAll(),
        'monthly_revenue'=> $pdo->query("SELECT DATE_FORMAT(created_at,'%Y-%m') as month, SUM(total_price) as revenue FROM bookings WHERE payment_status='paid' GROUP BY month ORDER BY month DESC LIMIT 6")->fetchAll(),
    ];
}

// --------------------------------------------------
// Get all locations
// --------------------------------------------------
function getLocations(): array {
    return db()->query("SELECT * FROM locations WHERE status='active' ORDER BY name")->fetchAll();
}

// --------------------------------------------------
// Redirect with message
// --------------------------------------------------
function redirect(string $url, string $message = '', string $type = 'success'): void {
    if ($message) $_SESSION['flash'] = ['message' => $message, 'type' => $type];
    header('Location: ' . $url);
    exit;
}

function getFlash(): ?array {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

// --------------------------------------------------
// Star rating display
// --------------------------------------------------
function renderStars(float $rating): string {
    $full  = floor($rating);
    $half  = ($rating - $full) >= 0.5 ? 1 : 0;
    $empty = 5 - $full - $half;
    $html  = '';
    for ($i = 0; $i < $full; $i++)  $html .= '<span class="star full">★</span>';
    if ($half)                       $html .= '<span class="star half">★</span>';
    for ($i = 0; $i < $empty; $i++) $html .= '<span class="star empty">☆</span>';
    return $html;
}

// --------------------------------------------------
// Get featured/upcoming events
// --------------------------------------------------
function getFeaturedEvents(int $limit = 6): array {
    $pdo  = db();
    $stmt = $pdo->prepare("
        SELECT e.*, l.name AS location_name 
        FROM events e 
        LEFT JOIN locations l ON e.location_id = l.id 
        WHERE e.status = 'published' AND e.event_date >= CURDATE()
        ORDER BY e.booked_count DESC, e.event_date ASC 
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    return $stmt->fetchAll();
}

// --------------------------------------------------
// Generate QR code image (simple text-based via Google Charts or PHP QR)
// --------------------------------------------------
function getQrCodeUrl(string $data): string {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' . urlencode($data);
}
