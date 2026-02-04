'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MonthFilterProvider } from '@/contexts/MonthFilterContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <MonthFilterProvider>
                <ThemeProvider>{children}</ThemeProvider>
            </MonthFilterProvider>
        </AuthProvider>
    );
}
