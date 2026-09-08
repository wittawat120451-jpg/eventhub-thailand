'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Calendar, 
  Ticket, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  Compass, 
  PlusCircle,
  Database
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, logout, switchRole, isSupabaseMode, bookings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeBookingsCount = bookings.filter((b) => b.status === 'confirmed').length;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-400 p-[2px] shadow-glow group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-400 group-hover:text-purple-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white font-['Kanit']">
                  EVENT<span className="gradient-text">HUB</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  TH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light -mt-1">ระบบจัดกิจกรรมและจอง Event</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-dark-850/80 p-1.5 rounded-full border border-purple-500/20 shadow-inner">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/') && pathname === '/'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              หน้าแรก
            </Link>

            <Link
              href="/events"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/events')
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-300" />
              กิจกรรมทั้งหมด
            </Link>

            <Link
              href="/my-bookings"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 relative ${
                isActive('/my-bookings')
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4 text-pink-300" />
              การจองของฉัน
              {activeBookingsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-bold flex items-center justify-center -mr-1">
                  {activeBookingsCount}
                </span>
              )}
            </Link>

            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-sm'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                แผงควบคุม Admin
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Supabase Status indicator */}
            <div 
              title={isSupabaseMode ? 'เชื่อมต่อ Supabase Live Database สำเร็จ' : 'กำลังใช้งานโหมด Local Store (สามารถต่อ Supabase ได้ง่าย)'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-dark-800 border border-slate-700/60 text-slate-300 cursor-default"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseMode ? 'text-emerald-400' : 'text-purple-400'}`} />
              <span>{isSupabaseMode ? 'Supabase Live' : 'Demo Store'}</span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseMode ? 'bg-emerald-400 animate-pulse' : 'bg-brand-400'}`} />
            </div>

            {/* Quick Role Switcher Button for convenient testing */}
            <button
              onClick={() => switchRole(currentUser?.role === 'admin' ? 'user' : 'admin')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
                currentUser?.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
              }`}
              title="กดเพื่อสลับโหมดผู้ใช้ทั่วไป / ผู้ดูแลระบบสำหรับทดสอบ"
            >
              {currentUser?.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>โหมด: แอดมิน (Admin)</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>โหมด: ผู้ใช้งานทั่วไป</span>
                </>
              )}
            </button>

            {currentUser?.role === 'admin' && (
              <Link
                href="/admin/new"
                className="btn-primary text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>สร้าง Event</span>
              </Link>
            )}

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-[2px]">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white max-w-[100px] truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{currentUser.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="btn-secondary text-xs px-4 py-2 rounded-full font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-xs px-4 py-2 rounded-full font-medium"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => switchRole(currentUser?.role === 'admin' ? 'user' : 'admin')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
            >
              {currentUser?.role === 'admin' ? 'Admin' : 'User'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-dark-800 text-slate-300 hover:text-white border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-purple-500/20 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/') && pathname === '/' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              หน้าแรก
            </Link>
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/events') ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-300" />
              กิจกรรมทั้งหมด
            </Link>
            <Link
              href="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive('/my-bookings') ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4 text-pink-300" />
                <span>การจองของฉัน</span>
              </div>
              {activeBookingsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {activeBookingsCount}
                </span>
              )}
            </Link>
            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive('/admin') ? 'bg-amber-600 text-white' : 'text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                แผงควบคุม Admin
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-700/50 flex flex-col gap-2">
            {currentUser ? (
              <div className="flex items-center justify-between bg-dark-800 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary py-2.5 rounded-xl text-center text-sm font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary py-2.5 rounded-xl text-center text-sm font-medium"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
