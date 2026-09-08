'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, Booking, UserProfile } from '@/lib/types';
import { INITIAL_EVENTS } from '@/lib/sample-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateTicketCode } from '@/lib/utils';
import { toast } from 'sonner';

interface AppContextType {
  events: EventItem[];
  bookings: Booking[];
  currentUser: UserProfile | null;
  isSupabaseMode: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'user' | 'admin') => void;
  getEventById: (id: string) => EventItem | undefined;
  createBooking: (
    eventId: string,
    guestInfo: { name: string; email: string; phone?: string; ticketCount: number }
  ) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  getUserBookings: () => Booking[];
  addEvent: (eventData: Omit<EventItem, 'id' | 'booked_seats'>) => Promise<EventItem | null>;
  updateEvent: (id: string, eventData: Partial<EventItem>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_EVENTS_KEY = 'eventhub_events_v1';
const LOCAL_STORAGE_BOOKINGS_KEY = 'eventhub_bookings_v1';
const LOCAL_STORAGE_USER_KEY = 'eventhub_user_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isSupabaseMode = isSupabaseConfigured;

  // Initialize data from LocalStorage or Supabase
  useEffect(() => {
    const initData = async () => {
      setLoading(true);

      // Default demo user if none exists
      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {
          // fallback
        }
      } else {
        const defaultUser: UserProfile = {
          id: 'usr-demo-01',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          role: 'user',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          phone: '081-234-5678',
        };
        setCurrentUser(defaultUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(defaultUser));
      }

      if (isSupabaseMode) {
        try {
          // Fetch events from Supabase
          const { data: dbEvents, error: evError } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

          if (!evError && dbEvents && dbEvents.length > 0) {
            setEvents(dbEvents as EventItem[]);
          } else {
            setEvents(INITIAL_EVENTS);
          }

          // Fetch bookings
          const { data: dbBookings, error: bkError } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

          if (!bkError && dbBookings) {
            setBookings(dbBookings as Booking[]);
          }
        } catch (err) {
          console.warn('Supabase fetch failed, falling back to local store:', err);
          loadLocalStore();
        }
      } else {
        loadLocalStore();
      }

      setLoading(false);
    };

    const loadLocalStore = () => {
      const storedEvents = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
      if (storedEvents) {
        try {
          setEvents(JSON.parse(storedEvents));
        } catch {
          setEvents(INITIAL_EVENTS);
        }
      } else {
        setEvents(INITIAL_EVENTS);
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
      }

      const storedBookings = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
      if (storedBookings) {
        try {
          setBookings(JSON.parse(storedBookings));
        } catch {
          setBookings([]);
        }
      } else {
        // Initial sample booking for demonstration
        const sampleBooking: Booking = {
          id: 'bk-demo-001',
          event_id: 'evt-ai-summit-2026',
          user_id: 'usr-demo-01',
          user_name: 'สมชาย ใจดี',
          user_email: 'somchai@example.com',
          user_phone: '081-234-5678',
          ticket_count: 1,
          total_price: 0,
          booking_date: new Date().toISOString(),
          status: 'confirmed',
          ticket_code: 'EVT-THAI-AI26',
          created_at: new Date().toISOString(),
        };
        setBookings([sampleBooking]);
        localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify([sampleBooking]));
      }
    };

    initData();
  }, [isSupabaseMode]);

  // Sync to LocalStorage whenever events or bookings change
  useEffect(() => {
    if (!loading && !isSupabaseMode) {
      localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(events));
      localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
    }
  }, [events, bookings, loading, isSupabaseMode]);

  // Sync user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [currentUser]);

  // Authentication Helpers
  const login = async (email: string): Promise<boolean> => {
    const isAdmin = email.toLowerCase().includes('admin');
    const user: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      email,
      name: isAdmin ? 'Admin ผู้ดูแลระบบ' : email.split('@')[0],
      role: isAdmin ? 'admin' : 'user',
      avatar_url: isAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };
    setCurrentUser(user);
    toast.success(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${user.name}`);
    return true;
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    const isAdmin = email.toLowerCase().includes('admin');
    const user: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      email,
      name,
      role: isAdmin ? 'admin' : 'user',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };
    setCurrentUser(user);
    toast.success(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${name}`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    toast.info('ออกจากระบบเรียบร้อยแล้ว');
  };

  const switchRole = (role: 'user' | 'admin') => {
    if (!currentUser) {
      setCurrentUser({
        id: 'usr-switch',
        name: role === 'admin' ? 'Admin ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป',
        email: role === 'admin' ? 'admin@eventhub.th' : 'user@eventhub.th',
        role,
      });
    } else {
      setCurrentUser({
        ...currentUser,
        role,
        name: role === 'admin' ? 'Admin ผู้ดูแลระบบ' : currentUser.name.replace('Admin ', ''),
      });
    }
    toast.success(`สลับโหมดเป็น: ${role === 'admin' ? '🛡️ ผู้ดูแลระบบ (Admin)' : '👤 ผู้ใช้งานทั่วไป (User)'}`);
  };

  // Event Helpers
  const getEventById = (id: string): EventItem | undefined => {
    return events.find((e) => e.id === id);
  };

  // Booking Flow
  const createBooking = async (
    eventId: string,
    guestInfo: { name: string; email: string; phone?: string; ticketCount: number }
  ): Promise<Booking | null> => {
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      toast.error('ไม่พบข้อมูลกิจกรรมนี้');
      return null;
    }

    const availableSeats = event.max_seats - event.booked_seats;
    if (availableSeats < guestInfo.ticketCount) {
      toast.error(`ขออภัย ที่นั่งเหลือเพียง ${availableSeats} ที่นั่ง`);
      return null;
    }

    const newBooking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event_id: eventId,
      event: event,
      user_id: currentUser?.id || 'guest',
      user_name: guestInfo.name,
      user_email: guestInfo.email,
      user_phone: guestInfo.phone || '-',
      ticket_count: guestInfo.ticketCount,
      total_price: event.price * guestInfo.ticketCount,
      booking_date: new Date().toISOString(),
      status: 'confirmed',
      ticket_code: generateTicketCode(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseMode) {
      try {
        const { error } = await supabase.from('bookings').insert([
          {
            event_id: newBooking.event_id,
            user_id: currentUser?.id || null,
            user_name: newBooking.user_name,
            user_email: newBooking.user_email,
            user_phone: newBooking.user_phone,
            ticket_count: newBooking.ticket_count,
            total_price: newBooking.total_price,
            booking_date: newBooking.booking_date,
            status: newBooking.status,
            ticket_code: newBooking.ticket_code,
          },
        ]);
        if (error) throw error;
      } catch (err: any) {
        console.error('Supabase booking error:', err);
      }
    }

    // Update local state
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, booked_seats: Math.min(e.max_seats, e.booked_seats + guestInfo.ticketCount) }
          : e
      )
    );

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    if (booking.status === 'cancelled') {
      toast.info('การจองนี้ถูกยกเลิกไปแล้ว');
      return true;
    }

    if (isSupabaseMode) {
      try {
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
      } catch (err) {
        console.error('Supabase cancel error:', err);
      }
    }

    // Update booking status
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );

    // Replenish seats in event
    setEvents((prev) =>
      prev.map((e) =>
        e.id === booking.event_id
          ? { ...e, booked_seats: Math.max(0, e.booked_seats - booking.ticket_count) }
          : e
      )
    );

    toast.success('ยกเลิกการจองและคืนที่นั่งเรียบร้อยแล้ว');
    return true;
  };

  const getUserBookings = (): Booking[] => {
    if (!currentUser) return bookings;
    // Match by user_id or email
    return bookings.map((b) => {
      const ev = events.find((e) => e.id === b.event_id);
      return { ...b, event: ev };
    });
  };

  // Admin Actions
  const addEvent = async (eventData: Omit<EventItem, 'id' | 'booked_seats'>): Promise<EventItem | null> => {
    const newId = `evt-${Date.now().toString(36)}`;
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      booked_seats: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseMode) {
      try {
        const { data, error } = await supabase.from('events').insert([newEvent]).select().single();
        if (error) throw error;
        if (data) {
          setEvents((prev) => [data as EventItem, ...prev]);
          toast.success('สร้างกิจกรรมใหม่บน Supabase สำเร็จ!');
          return data as EventItem;
        }
      } catch (err: any) {
        console.error('Supabase addEvent error:', err);
      }
    }

    setEvents((prev) => [newEvent, ...prev]);
    toast.success('สร้างกิจกรรมใหม่สำเร็จ!');
    return newEvent;
  };

  const updateEvent = async (id: string, eventData: Partial<EventItem>): Promise<boolean> => {
    if (isSupabaseMode) {
      try {
        const { error } = await supabase.from('events').update(eventData).eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Supabase updateEvent error:', err);
      }
    }

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...eventData } : e))
    );
    toast.success('อัปเดตข้อมูลกิจกรรมสำเร็จ!');
    return true;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    if (isSupabaseMode) {
      try {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.error('Supabase deleteEvent error:', err);
      }
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
    // Remove associated bookings
    setBookings((prev) => prev.filter((b) => b.event_id !== id));
    toast.success('ลบกิจกรรมเรียบร้อยแล้ว');
    return true;
  };

  const resetToSampleData = () => {
    setEvents(INITIAL_EVENTS);
    setBookings([]);
    localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
    localStorage.removeItem(LOCAL_STORAGE_BOOKINGS_KEY);
    toast.success('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
  };

  return (
    <AppContext.Provider
      value={{
        events,
        bookings,
        currentUser,
        isSupabaseMode,
        loading,
        login,
        register,
        logout,
        switchRole,
        getEventById,
        createBooking,
        cancelBooking,
        getUserBookings,
        addEvent,
        updateEvent,
        deleteEvent,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
