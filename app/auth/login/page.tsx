'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Calendar, Mail, Lock, Sparkles, ShieldCheck, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'admin' | 'user') => {
    setLoading(true);
    try {
      if (type === 'admin') {
        await login('admin@eventhub.th');
        router.push('/admin');
      } else {
        await login('somchai@example.com');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Top Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-400 p-[2px]">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-['Kanit']">
              EVENT<span className="gradient-text">HUB</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white font-['Kanit']">เข้าสู่ระบบ</h1>
          <p className="text-xs text-slate-400">เข้าสู่ระบบเพื่อจองกิจกรรมและดูบัตร E-Ticket ของคุณ</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 space-y-5 shadow-2xl">
          
          {/* Quick Demo Login Switcher */}
          <div className="p-3 rounded-2xl bg-dark-900/80 border border-purple-500/20 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block text-center">
              ⚡ ทดสอบเข้าสู่ระบบแบบด่วน (1-Click Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ User</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ Admin</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-700/60 w-full" />
            <span className="bg-dark-850 px-3 text-[11px] text-slate-500 uppercase">หรือกรอกอีเมล</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  รหัสผ่าน (Password)
                </label>
                <a href="#" className="text-[11px] text-brand-400 hover:underline">
                  ลืมรหัสผ่าน?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            ยังไม่มีบัญชีผู้ใช้?{' '}
            <Link href="/auth/register" className="text-brand-300 hover:text-white font-semibold underline">
              สมัครสมาชิกฟรี
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
