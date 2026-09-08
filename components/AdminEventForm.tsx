'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EventItem } from '@/lib/types';
import { CATEGORIES_LIST } from '@/lib/sample-data';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Image as ImageIcon, 
  User, 
  Tag, 
  FileText, 
  Save, 
  ArrowLeft,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface AdminEventFormProps {
  initialData?: EventItem;
  onSubmit: (eventData: Omit<EventItem, 'id' | 'booked_seats'>) => Promise<void>;
  isEditing?: boolean;
}

const PRESET_IMAGES = [
  { name: 'AI & Tech Conference', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Music & Concert', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Startup Pitch', url: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'UI/UX Workshop', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cybersecurity Lab', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Night Marathon', url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80' },
];

export const AdminEventForm: React.FC<AdminEventFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
}) => {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Tech & AI');
  const [date, setDate] = useState(initialData?.date || '2026-11-15');
  const [time, setTime] = useState(initialData?.time || '13:00 - 17:00 น.');
  const [location, setLocation] = useState(initialData?.location || '');
  const [locationType, setLocationType] = useState<'onsite' | 'online'>(initialData?.location_type || 'onsite');
  const [maxSeats, setMaxSeats] = useState(initialData?.max_seats || 100);
  const [price, setPrice] = useState(initialData?.price || 0);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || PRESET_IMAGES[0].url);
  const [organizer, setOrganizer] = useState(initialData?.organizer || 'EventHub Organizer Thailand');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || 'Event, Workshop, 2026');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !imageUrl) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSubmit({
        title,
        description,
        category,
        date,
        time,
        location,
        location_type: locationType,
        max_seats: Number(maxSeats),
        price: Number(price),
        image_url: imageUrl,
        organizer,
        tags,
        featured,
      });

      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-purple-500/20">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าแผงควบคุม Admin</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-['Kanit']">
            {isEditing ? '✏️ แก้ไขข้อมูลกิจกรรม' : '✨ สร้างกิจกรรมใหม่'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            กรอกข้อมูลรายละเอียดกิจกรรมให้ครบถ้วน ข้อมูลจะแสดงผลบนหน้าเว็บไซต์และบันทึกลงระบบ
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-glow disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'เผยแพร่กิจกรรม'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Basic Info */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-5">
            <h2 className="text-base font-bold text-white font-['Kanit'] flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>ข้อมูลพื้นฐานของกิจกรรม</span>
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ชื่อกิจกรรม (Event Title) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น Thailand AI Summit 2026"
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                รายละเอียดกิจกรรม (Description) <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายเกี่ยวกับกิจกรรม หัวข้อสัมมนา ไฮไลต์ สิ่งที่จะได้รับ..."
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>

            {/* Category & Location Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  หมวดหมู่กิจกรรม <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-brand-500"
                >
                  {CATEGORIES_LIST.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-dark-900">
                      {cat.name} ({cat.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  รูปแบบการจัดงาน
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationType('onsite')}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all ${
                      locationType === 'onsite'
                        ? 'bg-brand-600/30 text-brand-300 border-brand-500'
                        : 'bg-dark-800 text-slate-400 border-slate-700 hover:bg-dark-700'
                    }`}
                  >
                    🏢 ออนไซต์ (Onsite)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('online')}
                    className={`py-3 rounded-xl text-xs font-semibold border transition-all ${
                      locationType === 'online'
                        ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500'
                        : 'bg-dark-800 text-slate-400 border-slate-700 hover:bg-dark-700'
                    }`}
                  >
                    🌐 ออนไลน์ (Online)
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Card: Date, Time & Venue */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-5">
            <h2 className="text-base font-bold text-white font-['Kanit'] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>กำหนดการและสถานที่</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  วันที่จัดงาน <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ช่วงเวลา (Time) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="เช่น 13:00 - 17:00 น."
                  className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                สถานที่จัดงาน (Location / Link) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={
                    locationType === 'online'
                      ? 'เช่น Online Zoom Room (จะส่งลิงก์หลังลงทะเบียน)'
                      : 'เช่น True Digital Park, Grand Hall ชั้น 3, กรุงเทพฯ'
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

          </div>

          {/* Card: Capacity & Pricing */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-5">
            <h2 className="text-base font-bold text-white font-['Kanit'] flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              <span>จำนวนที่นั่งและราคาบัตร</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  จำนวนผู้เข้าร่วมสูงสุด (Max Seats) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ราคาบัตร (บาท, ใส่ 0 หากเป็นกิจกรรมฟรี) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Organizer & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ชื่อผู้จัดงาน (Organizer)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  แท็กคำค้นหา (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="AI, NextJS, Free, Workshop"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Col: Image Preview & Settings */}
        <div className="space-y-6">
          
          {/* Card: Image Upload / Preset */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h2 className="text-base font-bold text-white font-['Kanit'] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-400" />
              <span>รูปภาพหน้าปกกิจกรรม</span>
            </h2>

            {/* Live Image Preview */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-purple-500/30 bg-dark-900 group">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                }}
              />
              <div className="absolute inset-0 bg-dark-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-medium">
                พรีวิวภาพหน้าปก
              </div>
            </div>

            {/* Image URL Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                URL รูปภาพ <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Preset Images Quick Selector */}
            <div className="space-y-2 pt-2 border-t border-purple-500/15">
              <label className="block text-[11px] font-medium text-slate-400">
                หรือเลือกภาพตัวอย่างสำเร็จรูป:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative h-14 rounded-xl overflow-hidden border transition-all ${
                      imageUrl === preset.url
                        ? 'border-brand-400 ring-2 ring-brand-500/50'
                        : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {imageUrl === preset.url && (
                      <div className="absolute inset-0 bg-brand-600/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Card: Display Settings */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            <h2 className="text-base font-bold text-white font-['Kanit'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>การแสดงผล</span>
            </h2>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-dark-800 border border-purple-500/20 cursor-pointer hover:border-brand-500/40 transition-colors">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-dark-900 border-slate-700"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-white block">
                  ไฮไลต์เป็นอีเวนต์แนะนำ (Featured)
                </span>
                <span className="text-slate-400 block">
                  แสดงในแถบยอดนิยมและแบนเนอร์หลักของหน้าแรก
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-2xl text-sm font-bold shadow-glow flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'กำลังบันทึกข้อมูล...' : isEditing ? 'บันทึกการแก้ไข' : 'สร้างและเปิดรับสมัคร'}</span>
            </button>
            <Link
              href="/admin"
              className="w-full btn-secondary py-3 rounded-2xl text-xs font-semibold text-center block"
            >
              ยกเลิก
            </Link>
          </div>

        </div>

      </div>

    </form>
  );
};
