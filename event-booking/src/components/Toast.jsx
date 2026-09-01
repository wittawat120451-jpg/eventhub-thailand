/**
 * ==============================================================================
 * ไฟล์: src/components/Toast.jsx
 * หน้าที่: แสดงข้อความแจ้งเตือน (Toast Notification) เช่น จองสำเร็จ หรือ แจ้งข้อผิดพลาด
 * ==============================================================================
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        background: isSuccess ? '#065F46' : isError ? '#991B1B' : '#1E293B',
        color: '#FFFFFF',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)',
        border: `1px solid ${isSuccess ? '#10B981' : isError ? '#EF4444' : '#475569'}`,
        maxWidth: '420px',
        animation: 'modalPop 0.25s ease-out'
      }}
    >
      {isSuccess && <CheckCircle2 size={22} color="#34D399" />}
      {isError && <AlertCircle size={22} color="#F87171" />}
      {!isSuccess && !isError && <Info size={22} color="#60A5FA" />}

      <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.4 }}>
        {message}
      </div>

      <button
        onClick={onClose}
        style={{
          color: '#CBD5E1',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="ปิดข้อความแจ้งเตือน"
      >
        <X size={16} />
      </button>
    </div>
  );
}
