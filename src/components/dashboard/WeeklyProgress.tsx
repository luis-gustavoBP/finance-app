'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCents, parseLocalDate, getWeeksInMonth, cn } from '@/lib/utils';
import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

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

    // Find current week or default to first week when component mounts or month changes
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

    // O saldo restante é a meta acumulada até o final da semana selecionada menos tudo o que foi gasto até lá
    const remainingBalance = (weeklyLimit * (selectedWeekIndex + 1)) - spentUntilSelectedWeekEnd;

    // A meta "real" da semana selecionada (meta base + o que sobrou das anteriores)
    const spentBeforeSelectedWeek = spentUntilSelectedWeekEnd - spentInSelectedWeek;
    const adjustedWeeklyGoal = (weeklyLimit * (selectedWeekIndex + 1)) - spentBeforeSelectedWeek;

    const progress = adjustedWeeklyGoal > 0 ? Math.min((spentInSelectedWeek / adjustedWeeklyGoal) * 100, 100) : 0;

    // Cores baseadas no progresso
    const isOverLimit = remainingBalance < 0;
    const progressColor = isOverLimit ? 'bg-red-500' : progress > 80 ? 'bg-amber-500' : 'bg-emerald-400';

    return (
        <Card className="glass-panel overflow-hidden border-0 shadow-xl bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xs font-bold text-white/60 uppercase tracking-widest">Saldo Semanal</CardTitle>
                    <div className="flex gap-1.5">
                        {weeks.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedWeekIndex(idx)}
                                className={cn(
                                    "w-7 h-7 flex items-center justify-center text-[10px] rounded-full transition-all duration-300",
                                    selectedWeekIndex === idx
                                        ? "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] font-bold scale-110"
                                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                                )}
                                title={`Visualizar Semana ${idx + 1}`}
                            >
                                S{idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col gap-1 mb-6">
                    <div className="flex items-baseline gap-2">
                        <span className={cn(
                            "text-4xl font-black tracking-tight transition-colors duration-500",
                            isOverLimit ? "text-red-400" : "text-white"
                        )}>
                            {formatCents(remainingBalance)}
                        </span>
                        {isOverLimit && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">
                                Excedido
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-white/40 font-medium">
                        Ainda pode gastar nesta semana
                    </span>
                </div>

                <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] text-white/30 uppercase font-black tracking-tighter">
                        <div className="flex flex-col">
                            <span>Gasto Real</span>
                            <span className="text-white/70 text-xs">{formatCents(spentInSelectedWeek)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1">
                                Meta {adjustedWeeklyGoal !== weeklyLimit && (
                                    <span className="text-[8px] px-1 rounded bg-indigo-500/20 text-indigo-300">Ajustada</span>
                                )}
                            </span>
                            <span className="text-white/70 text-xs">{formatCents(adjustedWeeklyGoal)}</span>
                        </div>
                    </div>

                    <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${progressColor} rounded-full`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                    <p className="text-[10px] text-white/30 font-medium font-mono uppercase">
                        {selectedWeek.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} — {selectedWeek.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </p>
                    <div className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        progress > 100 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                        {progress.toFixed(0)}% Utilizado
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
