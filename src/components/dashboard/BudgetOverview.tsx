'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useExpenses } from '@/contexts/ExpenseContext';
import { CURRENCY_FORMATTER } from '@/lib/constants';

export function BudgetOverview() {
    const { getBudgetStatus, settings } = useExpenses();
    const status = getBudgetStatus();

    const cards = [
        {
            title: 'Orçamento do Mês',
            value: CURRENCY_FORMATTER.format(status.budget),
            icon: '💰',
            color: 'indigo' as const,
            description: 'Limite definido',
        },
        {
            title: 'Total Gasto',
            value: CURRENCY_FORMATTER.format(status.totalSpent),
            icon: '💳',
            color: status.status === 'danger' ? 'red' : status.status === 'warning' ? 'yellow' : 'green',
            description: `${status.percentage.toFixed(0)}% do orçamento`,
        },
        {
            title: 'Parcelas Futuras',
            value: CURRENCY_FORMATTER.format(status.futureCommitments),
            icon: '⚠️',
            color: 'yellow' as const,
            description: 'Comprometido nos próximos meses',
        },
        {
            title: 'Saldo Disponível',
            value: CURRENCY_FORMATTER.format(Math.max(0, status.available)),
            icon: status.available >= 0 ? '🟢' : '🔴',
            color: status.available >= 0 ? 'green' : 'red',
            description: status.available >= 0 ? 'Ainda disponível' : 'Orçamento excedido',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <Card
                        key={card.title}
                        highlightColor={card.color as 'green' | 'yellow' | 'red' | 'indigo'}
                        className="relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {card.title}
                                </p>
                                <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    {card.value}
                                </p>
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    {card.description}
                                </p>
                            </div>
                            <span className="text-3xl">{card.icon}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Progress Bar */}
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Uso do Orçamento
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {CURRENCY_FORMATTER.format(status.totalSpent)} de{' '}
                        {CURRENCY_FORMATTER.format(status.budget)}
                    </span>
                </div>
                <ProgressBar value={status.totalSpent} max={status.budget} size="lg" />
            </Card>
        </div>
    );
}
