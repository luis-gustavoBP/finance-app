'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((current) => [...current, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 flex flex-col gap-3 z-[9999] pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
    return (
        <div className={cn(
            "pointer-events-auto flex items-center gap-3 p-4 pr-3 rounded-2xl border backdrop-blur-2xl shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300 max-w-sm ml-auto",
            toast.type === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            toast.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-400",
            toast.type === 'info' && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
        )}>
            <div className="shrink-0">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>

            <p className="text-[13px] font-medium leading-relaxed flex-1">
                {toast.message}
            </p>

            <button
                onClick={onClose}
                className="shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors opacity-50 hover:opacity-100"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
