/**
 * Automated Verification & Unit Test Suite for EventSphere
 */

const storeMock = {};
global.localStorage = {
  getItem: (key) => storeMock[key] || null,
  setItem: (key, val) => { storeMock[key] = String(val); },
  removeItem: (key) => { delete storeMock[key]; },
  clear: () => { Object.keys(storeMock).forEach(k => delete storeMock[k]); }
};

global.document = {
  documentElement: { setAttribute: () => {} }
};
global.window = {
  localStorage: global.localStorage,
  store: null
};

const fs = require('fs');
const path = require('path');

const storeCode = fs.readFileSync(path.join(__dirname, 'js/store.js'), 'utf8');
eval(storeCode);

console.log('--- RUNNING AUTOMATED UNIT TESTS ---');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Test Initial Data Load
const events = window.store.getEvents();
assert(events.length >= 6, `Should have at least 6 initial events (found ${events.length})`);

// 2. Test Booking & Quota Guard
const testEvent = events[0]; // evt-001 (capacity 300, bookedSeats 288 -> remaining 12)
const remainingBefore = testEvent.capacity - testEvent.bookedSeats;
assert(remainingBefore === 12, `Initial remaining seats for ${testEvent.title} should be 12`);

const initialBooked = testEvent.bookedSeats;

// Successful booking
const booking = window.store.createBooking({
  userId: 'usr-demo-001',
  eventId: testEvent.id,
  attendeeName: 'ทดสอบ ผู้ใช้',
  attendeeEmail: 'test@example.com',
  attendeePhone: '0811112222',
  seats: 3
});

assert(booking && booking.id && booking.refCode, 'Booking should be created with unique ID and RefCode');
assert(booking.seats === 3, 'Booking seats should be 3');
assert(booking.status === 'confirmed', 'Booking status should be confirmed');

const eventAfterBooking = window.store.getEventById(testEvent.id);
assert(eventAfterBooking.bookedSeats === initialBooked + 3, `Booked seats should increment to ${initialBooked + 3} (found ${eventAfterBooking.bookedSeats})`);

// Overbooking prevention test
let overbookedError = false;
try {
  window.store.createBooking({
    userId: 'usr-demo-001',
    eventId: testEvent.id,
    attendeeName: 'Overbook User',
    attendeeEmail: 'over@example.com',
    attendeePhone: '0899999999',
    seats: 20 // Only 9 seats remain
  });
} catch (e) {
  overbookedError = true;
}
assert(overbookedError, 'Quota guard should prevent booking more seats than available');

// 3. Test Waiting List & Auto Promotion
const soldOutEvent = events[1]; // evt-002 capacity 500, bookedSeats 500 (Sold out)
const waitlistEntry = window.store.joinWaitlist(soldOutEvent.id, {
  userId: 'usr-wait-001',
  name: 'ผู้รอ คิวสำรอง',
  email: 'waitlist@example.com',
  phone: '0855554444',
  seats: 2
});

assert(waitlistEntry && waitlistEntry.queueNumber === 1, 'Waitlist entry should be created as queue #1');

// Now simulate a cancellation of an existing booking on that sold-out event to test auto promotion!
const mockBookingOnSoldOut = {
  id: 'bk-mock-soldout',
  refCode: 'EVT-MOCK',
  userId: 'usr-other',
  eventId: soldOutEvent.id,
  attendeeName: 'คนยกเลิก',
  attendeeEmail: 'cancel@example.com',
  attendeePhone: '0800000000',
  seats: 2,
  totalPrice: 5000,
  status: 'confirmed',
  createdAt: new Date().toISOString()
};

const allBookings = window.store.getBookings();
allBookings.push(mockBookingOnSoldOut);
global.localStorage.setItem('eventsphere_bookings_v2', JSON.stringify(allBookings));

// Cancel with admin flag to bypass 24h
window.store.cancelBooking(mockBookingOnSoldOut.id, true);

// Check if waitlist candidate was automatically promoted!
const updatedWaitlists = window.store.getWaitlists();
const promotedWaitlist = updatedWaitlists.find(w => w.id === waitlistEntry.id);
assert(promotedWaitlist.status === 'promoted', 'Waitlist candidate should be automatically promoted to confirmed booking upon seat vacancy');

const userBookings = window.store.getUserBookings('usr-wait-001');
assert(userBookings.length > 0 && userBookings[0].eventId === soldOutEvent.id, 'Promoted user should have confirmed booking in their history');

// 4. Test Notifications
const notifs = window.store.getNotifications('usr-wait-001');
assert(notifs.length > 0, 'Promoted user should receive high-priority notification');

// 5. Test Check-In System
const checkInRes = window.store.checkInBooking(booking.id);
assert(checkInRes.booking.status === 'checked_in', 'Check-in should update status to checked_in');

console.log('\n✨ ALL SYSTEM TESTS PASSED SUCCESSFULLY! ✨');
