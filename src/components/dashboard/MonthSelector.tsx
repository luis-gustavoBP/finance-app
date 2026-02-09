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
        <div className="flex items-center gap-2 glass-panel bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="w-10 h-10 sm:w-8 sm:h-8 p-0 rounded-lg hover:bg-white/10 min-h-[40px]"
                aria-label="Mês anterior"
            >
                ←
            </Button>

            <div className="min-w-[120px] sm:min-w-[140px] text-center font-semibold text-white text-sm sm:text-base select-none">
                {displayDate}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="w-10 h-10 sm:w-8 sm:h-8 p-0 rounded-lg hover:bg-white/10 min-h-[40px]"
                aria-label="Próximo mês"
            >
                →
            </Button>
        </div>
    );
}
