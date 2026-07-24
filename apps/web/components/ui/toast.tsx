'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Toast { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; }
interface ToastContextType { addToast: (type: Toast['type'], message: string) => void; }

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() { return useContext(ToastContext); }

const icons: Record<string, string> = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
const colors: Record<string, string> = {
  success: 'border-green-500/30 bg-green-500/10 text-green-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  info: 'border-brand-500/30 bg-brand-500/10 text-brand-300',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString(36);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md animate-slide-up shadow-lg', colors[t.type])}>
            <span className="text-base">{icons[t.type]}</span>
            <p className="text-sm font-medium">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
