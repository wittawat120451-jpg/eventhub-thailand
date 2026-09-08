export type EventCategory = 
  | 'Tech & AI'
  | 'Music & Festival'
  | 'Business & Startup'
  | 'Workshop & Skills'
  | 'Design & Creative'
  | 'Health & Sport';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: EventCategory | string;
  date: string; // e.g. "2026-10-15"
  time: string; // e.g. "13:00 - 17:00"
  location: string;
  location_type: 'onsite' | 'online';
  max_seats: number;
  booked_seats: number;
  price: number; // 0 = Free
  image_url: string;
  organizer: string;
  organizer_avatar?: string;
  tags: string[];
  featured?: boolean;
  agenda?: { time: string; title: string; speaker?: string }[];
  created_at?: string;
}

export interface Booking {
  id: string;
  event_id: string;
  event?: EventItem;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  ticket_count: number;
  total_price: number;
  booking_date: string;
  status: 'confirmed' | 'cancelled' | 'attended';
  ticket_code: string; // e.g. "EVT-89241"
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  phone?: string;
}
