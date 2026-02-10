'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCents, parseLocalDate, getWeeksInMonth, cn } from '@/lib/utils';
import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type IncomeEntry = Database['public']['Tables']['income_entries']['Row'];

interface WeeklyProgressProps {
    transactions: Transaction[];
    monthlyLimit: number;
    weeklyGoal?: number;
    selectedMonth: Date;
}

export function WeeklyProgress({ transactions, monthlyLimit, weeklyGoal, selectedMonth }: WeeklyProgressProps) {
    const weeks = useMemo(() => {
        return getWeeksInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth());
    }, [selectedMonth]);

    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

    useEffect(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        if (selectedMonth.getMonth() === currentMonth && selectedMonth.getFullYear() === currentYear) {
            const currentWeekIdx = weeks.findIndex(w => now >= w.start && now <= w.end);
            setSelectedWeekIndex(currentWeekIdx !== -1 ? currentWeekIdx : 0);
        } else {
            setSelectedWeekIndex(0);
        }
    }, [weeks, selectedMonth]);

    const selectedWeek = weeks[selectedWeekIndex] || weeks[0];
    const weeklyLimit = (weeklyGoal && weeklyGoal > 0) ? weeklyGoal : monthlyLimit / 4;

    const spentUntilSelectedWeekEnd = transactions
        .filter(tx => {
            const date = parseLocalDate(tx.posted_at);
            return date >= weeks[0].start && date <= selectedWeek.end && (tx as any).include_in_weekly_plan !== false;
        })
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    const spentInSelectedWeek = transactions
        .filter(tx => {
            const date = parseLocalDate(tx.posted_at);
            return date >= selectedWeek.start && date <= selectedWeek.end && (tx as any).include_in_weekly_plan !== false;
        })
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    const remainingBalance = (weeklyLimit * (selectedWeekIndex + 1)) - spentUntilSelectedWeekEnd;

    const spentBeforeSelectedWeek = spentUntilSelectedWeekEnd - spentInSelectedWeek;
    const adjustedWeeklyGoal = (weeklyLimit * (selectedWeekIndex + 1)) - spentBeforeSelectedWeek;

    const progress = adjustedWeeklyGoal > 0 ? Math.min((spentInSelectedWeek / adjustedWeeklyGoal) * 100, 100) : 0;

    const isOverLimit = remainingBalance < 0;
    const progressColor = isOverLimit
        ? 'bg-red-400'
        : progress > 80
            ? 'bg-amber-400'
            : 'bg-emerald-400';

    return (
        <Card className="overflow-hidden !border-white/[0.08]">
            <div className="px-4 sm:px-5 py-4 sm:py-5">
                {/* Header */}
                <div className="flex justify-between items-center gap-2 mb-4">
                    <span className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-[10px] font-bold text-white/50 uppercase tracking-widest">
                        Saldo Semanal
                    </span>
                    <div className="flex gap-1">
                        {weeks.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedWeekIndex(idx)}
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center text-[10px] rounded-lg transition-all duration-200 font-medium",
                                    selectedWeekIndex === idx
                                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.15)]"
                                        : "bg-white/[0.04] text-white/25 hover:bg-white/[0.07] border border-transparent"
                                )}
                                title={`Semana ${idx + 1}`}
                            >
                                S{idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Value */}
                <div className="flex flex-col gap-0.5 mb-5">
                    <div className="flex items-baseline gap-2">
                        <span className={cn(
                            "text-2xl sm:text-3xl font-bold tracking-tight transition-colors",
                            isOverLimit ? "text-red-400" : "text-white"
                        )}>
                            {formatCents(remainingBalance)}
                        </span>
                        {isOverLimit && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 uppercase">
                                Excedido
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] text-white/30 font-medium">
                        Disponível nesta semana
                    </span>
                </div>

                {/* Progress Section */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-white/30 font-medium">
                        <div className="flex flex-col">
                            <span className="uppercase tracking-wider">Gasto</span>
                            <span className="text-white/60 text-xs mt-0.5">{formatCents(spentInSelectedWeek)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1 uppercase tracking-wider">
                                Meta {adjustedWeeklyGoal !== weeklyLimit && (
                                    <span className="text-[8px] px-1.5 rounded bg-indigo-500/15 text-indigo-400">Ajust.</span>
                                )}
                            </span>
                            <span className="text-white/60 text-xs mt-0.5">{formatCents(adjustedWeeklyGoal)}</span>
                        </div>
                    </div>

                    <div className="relative h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${progressColor} rounded-full`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-between items-center">
                    <p className="text-[10px] text-white/20 font-mono">
                        {selectedWeek.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} — {selectedWeek.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </p>
                    <div className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-lg",
                        progress > 100 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                        {progress.toFixed(0)}%
                    </div>
                </div>
            </div>
        </Card>
    );
}
