'use client';

import { useIncome } from '@/hooks/useIncome';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCents, parseLocalDate } from '@/lib/utils';

export function MonthlyIncome() {
    const { incomeEntries, isLoading } = useIncome();
    const { selectedDate } = useMonthFilter();

    // Calculate current month's income based on filter
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const monthlyIncome = incomeEntries
        .filter(entry => {
            const entryDate = parseLocalDate(entry.received_at);
            const isBudget = !entry.destination || entry.destination === 'budget';
            return entryDate.getMonth() === currentMonth &&
                entryDate.getFullYear() === currentYear &&
                isBudget;
        })
        .reduce((sum, entry) => sum + entry.amount_cents, 0);

    const hasIncome = monthlyIncome > 0;

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse h-20" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={hasIncome ? 'border-green-200' : ''}>
            <CardHeader>
                <CardTitle className="text-green-600 ">💵 Entradas no Mês</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="text-3xl font-bold text-green-600 ">
                        {formatCents(monthlyIncome)}
                    </div>

                    {hasIncome ? (
                        <div className="text-sm text-green-700 ">
                            ✨ Você recebeu <strong>{formatCents(monthlyIncome)}</strong> extras este mês
                        </div>
                    ) : (
                        <div className="text-sm text-slate-500">
                            Nenhuma entrada extra registrada este mês
                        </div>
                    )}

                    {incomeEntries.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 ">
                            <div className="text-xs text-slate-500 uppercase font-semibold mb-2">
                                Últimas entradas
                            </div>
                            <div className="space-y-2">
                                {incomeEntries.slice(0, 3).map(entry => (
                                    <div key={entry.id} className="flex items-center justify-between text-sm">
                                        <div className="text-slate-700 ">
                                            {entry.description}
                                        </div>
                                        <div className="font-semibold text-green-600 ">
                                            +{formatCents(entry.amount_cents)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
