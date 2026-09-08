'use client';

import React from 'react';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import { formatThaiDate, formatPrice } from '@/lib/utils';
import { Calendar, MapPin, Users, ArrowRight, Sparkles, Video } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onQuickBook?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onQuickBook }) => {
  const seatsLeft = Math.max(0, event.max_seats - event.booked_seats);
  const percentBooked = Math.min(100, Math.round((event.booked_seats / event.max_seats) * 100));
  const isSoldOut = seatsLeft <= 0;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col h-full relative border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300">
      
      {/* Event Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-dark-800">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

        {/* Category & Online Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-brand-900/80 text-brand-200 border border-brand-500/40 shadow-sm">
            {event.category}
          </span>
          {event.location_type === 'online' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-cyan-900/80 text-cyan-200 border border-cyan-500/40 flex items-center gap-1">
              <Video className="w-3 h-3" />
              Online
            </span>
          )}
          {event.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-amber-500/90 text-dark-900 flex items-center gap-1 shadow-glow font-['Kanit']">
              <Sparkles className="w-3 h-3 fill-dark-900" />
              ยอดนิยม
            </span>
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-lg ${
              event.price === 0
                ? 'bg-emerald-500/90 text-white border border-emerald-400/50'
                : 'bg-dark-900/90 text-purple-300 border border-purple-500/50 font-["Kanit"]'
            }`}
          >
            {formatPrice(event.price)}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs font-medium text-brand-300">
            <Calendar className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>{formatThaiDate(event.date)} • {event.time}</span>
          </div>

          {/* Event Title */}
          <Link href={`/events/${event.id}`}>
            <h3 className="font-bold text-lg text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug font-['Kanit']">
              {event.title}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-xs text-slate-300 pt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Bottom Section: Seats & Actions */}
        <div className="space-y-3 pt-3 border-t border-purple-500/10">
          
          {/* Seat Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {isSoldOut ? (
                  <span className="text-rose-400 font-semibold">ที่นั่งเต็มแล้ว</span>
                ) : (
                  <span>
                    เหลือ <strong className="text-white font-semibold">{seatsLeft}</strong> จาก {event.max_seats} ที่นั่ง
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium text-slate-400">{percentBooked}%</span>
            </div>

            <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500'
                    : percentBooked > 80
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-brand-500 to-cyan-400'
                }`}
                style={{ width: `${percentBooked}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/events/${event.id}`}
              className="flex-1 btn-secondary py-2.5 px-3 rounded-xl text-xs font-semibold text-center hover:bg-white/10 flex items-center justify-center gap-1 transition-all"
            >
              <span>รายละเอียด</span>
            </Link>

            {onQuickBook ? (
              <button
                type="button"
                onClick={() => onQuickBook(event)}
                disabled={isSoldOut}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1 transition-all ${
                  isSoldOut
                    ? 'bg-dark-700 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'btn-primary shadow-glow'
                }`}
              >
                <span>{isSoldOut ? 'เต็มแล้ว' : 'จองทันที'}</span>
                {!isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <Link
                href={`/events/${event.id}`}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1 transition-all ${
                  isSoldOut
                    ? 'bg-dark-700 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'btn-primary shadow-glow'
                }`}
              >
                <span>{isSoldOut ? 'เต็มแล้ว' : 'จองบัตร'}</span>
                {!isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
