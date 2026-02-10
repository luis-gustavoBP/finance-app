'use client';

import { useMonthFilter } from '@/contexts/MonthFilterContext';

export function MonthSelector() {
    const { selectedDate, nextMonth, prevMonth } = useMonthFilter();

    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
    }).format(selectedDate);

    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
            <button
                onClick={prevMonth}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all active:scale-95"
                aria-label="Mês anterior"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="min-w-[110px] sm:min-w-[130px] text-center font-medium text-white/70 text-[13px] select-none">
                {displayDate}
            </div>

            <button
                onClick={nextMonth}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all active:scale-95"
                aria-label="Próximo mês"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
