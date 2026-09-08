'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AdminEventForm } from '@/components/AdminEventForm';
import { EventItem } from '@/lib/types';

export default function NewEventPage() {
  const { addEvent } = useApp();

  const handleCreate = async (eventData: Omit<EventItem, 'id' | 'booked_seats'>) => {
    await addEvent(eventData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AdminEventForm onSubmit={handleCreate} isEditing={false} />
    </div>
  );
}
