'use client';

import React from 'react';
import { Toaster } from 'sonner';

export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: '#0F1123',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#F1F5F9',
          fontFamily: 'Prompt, sans-serif',
        },
      }}
    />
  );
};
