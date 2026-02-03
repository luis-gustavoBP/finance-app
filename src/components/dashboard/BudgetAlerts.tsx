'use client';

import { useExpenses } from '@/contexts/ExpenseContext';

export function BudgetAlerts() {
    const { getBudgetStatus } = useExpenses();
    const status = getBudgetStatus();

    if (status.status === 'safe') {
        return null;
    }

    return (
        <div
            className={`rounded-xl p-4 ${status.status === 'danger'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                }`}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl animate-pulse">
                    {status.status === 'danger' ? '🚨' : '⚠️'}
                </span>
                <div>
                    <h4
                        className={`font-semibold ${status.status === 'danger'
                                ? 'text-red-800 dark:text-red-200'
                                : 'text-amber-800 dark:text-amber-200'
                            }`}
                    >
                        {status.status === 'danger' ? 'Orçamento Excedido!' : 'Atenção com o Orçamento'}
                    </h4>
                    <p
                        className={`text-sm mt-1 ${status.status === 'danger'
                                ? 'text-red-600 dark:text-red-300'
                                : 'text-amber-600 dark:text-amber-300'
                            }`}
                    >
                        {status.status === 'danger'
                            ? `Você ultrapassou seu orçamento em ${(status.percentage - 100).toFixed(0)}%. Considere revisar seus gastos.`
                            : `Você já usou ${status.percentage.toFixed(0)}% do seu orçamento. Restam apenas ${(100 - status.percentage).toFixed(0)}%.`}
                    </p>
                </div>
            </div>
        </div>
    );
}
