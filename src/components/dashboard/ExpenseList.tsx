'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { useExpenses } from '@/contexts/ExpenseContext';

export function ExpenseList() {
    const { getMonthlyExpenses } = useExpenses();
    const expenses = getMonthlyExpenses();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Gastos do Mês</CardTitle>
            </CardHeader>
            <CardContent>
                {expenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                        <svg
                            className="w-16 h-16 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                        <p className="text-center">
                            Nenhum gasto registrado.
                            <br />
                            Clique no botão + para adicionar.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {expenses.map((expense) => (
                            <ExpenseCard
                                key={`${expense.id}-${expense.installmentInfo?.current || 0}`}
                                expense={expense}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
