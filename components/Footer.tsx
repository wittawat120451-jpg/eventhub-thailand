'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Mail, Phone, MapPin, Heart, ArrowUpRight, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 border-t border-purple-500/20 pt-16 pb-12 mt-24 relative overflow-hidden">
      {/* Glow gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-brand-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-400 p-[2px]">
                <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-brand-400" />
                </div>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-['Kanit']">
                EVENT<span className="gradient-text">HUB</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              แพลตฟอร์มศูนย์รวมกิจกรรม สัมมนา เวิร์กช็อป คอนเสิร์ต และการจองบัตร Event ระดับมืออาชีพที่ทันสมัยและใช้งานง่ายที่สุดในประเทศไทย
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                ⚡ Next.js + Tailwind CSS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                🛡️ Supabase Ready
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase font-['Kanit']">
              นำทางด่วน
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors flex items-center gap-1">
                  ค้นหากิจกรรมทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-white transition-colors flex items-center gap-1">
                  บัตรของฉัน (My Tickets)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  ระบบผู้จัดงาน (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase font-['Kanit']">
              หมวดหมู่ยอดนิยม
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/events?category=Tech & AI" className="hover:text-white transition-colors">
                  เทคโนโลยี & AI
                </Link>
              </li>
              <li>
                <Link href="/events?category=Music & Festival" className="hover:text-white transition-colors">
                  ดนตรี & คอนเสิร์ต
                </Link>
              </li>
              <li>
                <Link href="/events?category=Business & Startup" className="hover:text-white transition-colors">
                  ธุรกิจ & สตาร์ทอัพ
                </Link>
              </li>
              <li>
                <Link href="/events?category=Design & Creative" className="hover:text-white transition-colors">
                  ดีไซน์ & ครีเอทีฟ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase font-['Kanit']">
              รับข่าวสารอีเวนต์ใหม่
            </h3>
            <p className="text-xs text-slate-400">
              ไม่พลาดกิจกรรมพิเศษและส่วนลดบัตร Early Bird ก่อนใคร
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="อีเมลของคุณ..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-semibold"
              >
                ติดตามข่าวสาร
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 EventHub Thailand. พัฒนาด้วย Next.js, Tailwind CSS และ Supabase.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>พร้อม Deploy บน Vercel 🚀</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
