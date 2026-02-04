'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCents, parseLocalDate, getWeekStart, getWeekEnd } from '@/lib/utils';
import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface WeeklyProgressProps {
    transactions: Transaction[];
    monthlyLimit: number;
    weeklyGoal?: number;
}

export function WeeklyProgress({ transactions, monthlyLimit, weeklyGoal }: WeeklyProgressProps) {
    const weeklyLimit = (weeklyGoal && weeklyGoal > 0) ? weeklyGoal : monthlyLimit / 4;

    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    const spentThisWeek = transactions
        .filter(tx => {
            const date = parseLocalDate(tx.posted_at);
            return date >= weekStart && date <= weekEnd && (tx as any).include_in_weekly_plan !== false;
        })
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    const progress = weeklyLimit > 0 ? Math.min((spentThisWeek / weeklyLimit) * 100, 100) : 0;

    // Cores baseadas no progresso
    const progressColor = progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Gasto da Semana</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold text-slate-800 ">
                        {formatCents(spentThisWeek)}
                    </span>
                    <span className="text-xs text-slate-500 mb-1">
                        Meta: {formatCents(weeklyLimit)}
                    </span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="text-xs text-slate-400 mt-2">
                    {progress.toFixed(0)}% do limite semanal sugerido
                </p>
            </CardContent>
        </Card>
    );
}
