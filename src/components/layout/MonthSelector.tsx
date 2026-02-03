'use client';

import { useExpenses } from '@/contexts/ExpenseContext';
import { formatMonthDisplay, getMonthString, getBillingPeriodDescription } from '@/lib/calculations';

export function MonthSelector() {
    const { currentMonth, setCurrentMonth, settings } = useExpenses();

    const goToPreviousMonth = () => {
        const [year, month] = currentMonth.split('-').map(Number);
        const date = new Date(year, month - 2, 1); // month - 2 because months are 0-indexed
        setCurrentMonth(getMonthString(date));
    };

    const goToNextMonth = () => {
        const [year, month] = currentMonth.split('-').map(Number);
        const date = new Date(year, month, 1); // month because we want next month
        setCurrentMonth(getMonthString(date));
    };

    const goToCurrentMonth = () => {
        setCurrentMonth(getMonthString(new Date()));
    };

    const isCurrentMonth = currentMonth === getMonthString(new Date());
    const billingPeriod = getBillingPeriodDescription(currentMonth, settings.daysBeforeClose, settings.dueDay);

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Fatura anterior"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>

            <div className="text-center min-w-[200px]">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Fatura de {formatMonthDisplay(currentMonth)}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {billingPeriod}
                </p>
                {!isCurrentMonth && (
                    <button
                        onClick={goToCurrentMonth}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                    >
                        Voltar para fatura atual
                    </button>
                )}
            </div>

            <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Próxima fatura"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    );
}
