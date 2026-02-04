'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface MonthFilterContextType {
    selectedDate: Date;
    setDate: (date: Date) => void;
    nextMonth: () => void;
    prevMonth: () => void;
}

const MonthFilterContext = createContext<MonthFilterContextType | undefined>(undefined);

export function MonthFilterProvider({ children }: { children: ReactNode }) {
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        // Initialize with current date
        return new Date();
    });

    const nextMonth = () => {
        setSelectedDate(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + 1);
            return next;
        });
    };

    const prevMonth = () => {
        setSelectedDate(prev => {
            const previous = new Date(prev);
            previous.setMonth(previous.getMonth() - 1);
            return previous;
        });
    };

    const setDate = (date: Date) => {
        setSelectedDate(new Date(date));
    };

    return (
        <MonthFilterContext.Provider value={{ selectedDate, setDate, nextMonth, prevMonth }}>
            {children}
        </MonthFilterContext.Provider>
    );
}

export function useMonthFilter() {
    const context = useContext(MonthFilterContext);
    if (context === undefined) {
        throw new Error('useMonthFilter must be used within a MonthFilterProvider');
    }
    return context;
}
