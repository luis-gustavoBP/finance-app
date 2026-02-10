'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MonthFilterProvider } from '@/contexts/MonthFilterContext';
import { ToastProvider } from '@/contexts/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <MonthFilterProvider>
                <ThemeProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </ThemeProvider>
            </MonthFilterProvider>
        </AuthProvider>
    );
}
