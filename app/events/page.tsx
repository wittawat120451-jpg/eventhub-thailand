'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CATEGORIES_LIST } from '@/lib/sample-data';
import { EventCard } from '@/components/EventCard';
import { BookingModal } from '@/components/BookingModal';
import { EventItem } from '@/lib/types';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  Video, 
  MapPin, 
  SlidersHorizontal,
  X,
  Layers
} from 'lucide-react';

function EventsContent() {
  const searchParams = useSearchParams();
  const { events } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'onsite' | 'online'>('all');
  const [sortBy, setSortBy] = useState<'date-asc' | 'price-asc' | 'price-desc' | 'popular'>('date-asc');
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);

  // Initialize query params from URL
  useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('category');
    if (q) setSearchQuery(q);
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filtering & Sorting Logic
  const filteredEvents = events.filter((ev) => {
    // Keyword match
    const matchSearch =
      !searchQuery ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category match
    const matchCategory = selectedCategory === 'all' || ev.category === selectedCategory;

    // Price match
    const matchPrice =
      priceFilter === 'all' ||
      (priceFilter === 'free' && ev.price === 0) ||
      (priceFilter === 'paid' && ev.price > 0);

    // Type match
    const matchType = typeFilter === 'all' || ev.location_type === typeFilter;

    return matchSearch && matchCategory && matchPrice && matchType;
  });

  // Sort logic
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    if (sortBy === 'popular') {
      const ratioA = a.booked_seats / a.max_seats;
      const ratioB = b.booked_seats / b.max_seats;
      return ratioB - ratioA;
    }
    return 0;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceFilter('all');
    setTypeFilter('all');
    setSortBy('date-asc');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    priceFilter !== 'all' ||
    typeFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="space-y-3 pb-6 border-b border-purple-500/20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>กิจกรรมทั้งหมด</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Kanit']">
          ค้นหา & สำรวจอีเวนต์ ({sortedEvents.length})
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-light">
          เลือกค้นหากิจกรรมที่ตอบโจทย์ความสนใจของคุณ ไม่ว่าจะเป็น AI, เทคโนโลยี, ธุรกิจ, เวิร์กช็อป หรือคอนเสิร์ต
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 space-y-4 shadow-xl">
        
        {/* Top row: Search input & Sorting */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อกิจกรรม, วิทยากร, คีย์เวิร์ด..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-52 px-3 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="date-asc" className="bg-dark-900">วันที่จัดงาน (เร็วที่สุด)</option>
              <option value="popular" className="bg-dark-900">ยอดนิยม (ที่นั่งใกล้เต็ม)</option>
              <option value="price-asc" className="bg-dark-900">ราคา: ฟรี - น้อยไปมาก</option>
              <option value="price-desc" className="bg-dark-900">ราคา: มากไปน้อย</option>
            </select>
          </div>

        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-500/15">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-dark-800 text-slate-400 hover:text-white border border-purple-500/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sub Filters: Price & Type */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Price toggle */}
            <div className="inline-flex rounded-xl bg-dark-800 p-1 border border-purple-500/20">
              <button
                onClick={() => setPriceFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  priceFilter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400'
                }`}
              >
                ทุกราคา
              </button>
              <button
                onClick={() => setPriceFilter('free')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  priceFilter === 'free' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                ฟรี (Free)
              </button>
              <button
                onClick={() => setPriceFilter('paid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  priceFilter === 'paid' ? 'bg-brand-600 text-white' : 'text-slate-400'
                }`}
              >
                มีค่าใช้จ่าย
              </button>
            </div>

            {/* Type toggle */}
            <div className="inline-flex rounded-xl bg-dark-800 p-1 border border-purple-500/20">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  typeFilter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400'
                }`}
              >
                ทุกรูปแบบ
              </button>
              <button
                onClick={() => setTypeFilter('onsite')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  typeFilter === 'onsite' ? 'bg-purple-700 text-white' : 'text-slate-400'
                }`}
              >
                🏢 ออนไซต์
              </button>
              <button
                onClick={() => setTypeFilter('online')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  typeFilter === 'online' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                🌐 ออนไลน์
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-1 border border-rose-500/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Events Results Grid */}
      {sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onQuickBook={(ev) => setBookingEvent(ev)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-850/60 rounded-3xl border border-purple-500/20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Kanit']">
            ไม่พบกิจกรรมตามเงื่อนไขที่คุณเลือก
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            กรุณาลองปรับเปลี่ยนตัวกรอง ค้นหาด้วยคำอื่น หรือกดปุ่ม &quot;ล้างตัวกรองทั้งหมด&quot;
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary px-6 py-2.5 rounded-full text-xs font-semibold"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

      {/* Booking Modal Instance */}
      {bookingEvent && (
        <BookingModal
          event={bookingEvent}
          isOpen={Boolean(bookingEvent)}
          onClose={() => setBookingEvent(null)}
        />
      )}

    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">กำลังโหลดรายการกิจกรรม...</div>}>
      <EventsContent />
    </Suspense>
  );
}
