'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminEventForm } from '@/components/AdminEventForm';
import { EventItem } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, updateEvent } = useApp();
  const eventId = params.id as string;
  const event = getEventById(eventId);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white font-['Kanit']">ไม่พบกิจกรรมที่ต้องการแก้ไข</h1>
        <p className="text-xs text-slate-400">กิจกรรมนี้อาจถูกลบไปแล้ว</p>
        <Link href="/admin" className="btn-primary px-6 py-2.5 rounded-full text-xs font-semibold inline-block">
          กลับสู่แผงควบคุม Admin
        </Link>
      </div>
    );
  }

  const handleUpdate = async (eventData: Omit<EventItem, 'id' | 'booked_seats'>) => {
    await updateEvent(eventId, eventData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AdminEventForm
        initialData={event}
        onSubmit={handleUpdate}
        isEditing={true}
      />
    </div>
  );
}
