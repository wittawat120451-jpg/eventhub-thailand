'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Calendar, User, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    try {
      const ok = await register(name, email, password);
      if (ok) {
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
          <h1 className="text-2xl font-bold text-white font-['Kanit']">สร้างบัญชีใหม่</h1>
          <p className="text-xs text-slate-400">สมัครสมาชิกเพื่อเริ่มต้นจองกิจกรรมและสะสมบัตร E-Ticket</p>
        </div>

        {/* Register Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 space-y-5 shadow-2xl">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

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
              <label className="block text-xs font-medium text-slate-300 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-800 border border-purple-500/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>รับสิทธิประโยชน์และข่าวสารอีเวนต์ก่อนใคร</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ยกเลิกการจองและจัดการบัตรได้ทุกเมื่อ</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            มีบัญชีผู้ใช้แล้ว?{' '}
            <Link href="/auth/login" className="text-brand-300 hover:text-white font-semibold underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
