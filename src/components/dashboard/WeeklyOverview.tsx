'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useExpenses } from '@/contexts/ExpenseContext';
import { getWeeklyStatus } from '@/lib/calculations';
import { CURRENCY_FORMATTER } from '@/lib/constants';

export function WeeklyOverview() {
    const { expenses, settings } = useExpenses();
    const weekly = getWeeklyStatus(expenses, settings.weeklyBudget);

    return (
        <Card
            highlightColor={
                weekly.status === 'danger'
                    ? 'red'
                    : weekly.status === 'warning'
                        ? 'yellow'
                        : 'green'
            }
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        📅 Controle Semanal
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Semana {weekly.weekNumber} • {weekly.weekStart} a {weekly.weekEnd}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Meta semanal
                    </p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {CURRENCY_FORMATTER.format(weekly.budget)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gasto esta semana</p>
                    <p className={`text-xl font-bold ${weekly.status === 'danger'
                            ? 'text-red-600 dark:text-red-400'
                            : weekly.status === 'warning'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-800 dark:text-slate-100'
                        }`}>
                        {CURRENCY_FORMATTER.format(weekly.spent)}
                    </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Disponível</p>
                    <p className={`text-xl font-bold ${weekly.available >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                        {CURRENCY_FORMATTER.format(Math.max(0, weekly.available))}
                    </p>
                </div>
            </div>

            <ProgressBar
                value={weekly.spent}
                max={weekly.budget}
                size="md"
            />

            {weekly.status !== 'safe' && (
                <div className={`mt-3 p-2 rounded-lg text-sm ${weekly.status === 'danger'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                    }`}>
                    {weekly.status === 'danger'
                        ? '🚨 Meta semanal ultrapassada!'
                        : '⚠️ Atenção: já usou mais de 80% da meta semanal'}
                </div>
            )}
        </Card>
    );
}
