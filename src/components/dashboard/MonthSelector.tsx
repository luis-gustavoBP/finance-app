'use client';

import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { Button } from '@/components/ui/Button';

export function MonthSelector() {
    const { selectedDate, nextMonth, prevMonth } = useMonthFilter();

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
    }).format(selectedDate);

    // Capitalize first letter
    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="w-8 h-8 p-0 rounded-lg hover:bg-slate-50"
            >
                ←
            </Button>

            <div className="min-w-[140px] text-center font-semibold text-slate-700 select-none">
                {displayDate}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="w-8 h-8 p-0 rounded-lg hover:bg-slate-50"
            >
                →
            </Button>
        </div>
    );
}
