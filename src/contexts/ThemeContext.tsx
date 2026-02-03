'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [darkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Ensure dark mode class is removed
        document.documentElement.classList.remove('dark');
    }, []);

    // No-op for toggle since we are enforcing light mode
    const toggleDarkMode = () => { };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
