'use client';

import { ExpenseProvider } from '@/contexts/ExpenseContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ExpenseProvider>{children}</ExpenseProvider>
        </ThemeProvider>
    );
}
