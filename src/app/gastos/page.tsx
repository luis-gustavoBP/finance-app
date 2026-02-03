'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { useExpenses } from '@/contexts/ExpenseContext';
import { CATEGORIES, CURRENCY_FORMATTER } from '@/lib/constants';
import { Category } from '@/types';

export default function GastosPage() {
    const { getMonthlyExpenses, getBudgetStatus, isHydrated } = useExpenses();
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Show loading skeleton during hydration to avoid mismatch
    if (!isHydrated) {
        return (
            <div className="space-y-6 animate-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gastos</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Carregando...</p>
                    </div>
                </div>
                <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </div>
                <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
        );
    }

    const expenses = getMonthlyExpenses();
    const status = getBudgetStatus();

    const filteredExpenses =
        categoryFilter === 'all'
            ? expenses
            : expenses.filter((exp) => exp.category === categoryFilter);

    const categoryOptions = [
        { value: 'all', label: '🏷️ Todas as categorias' },
        ...CATEGORIES.map((cat) => ({
            value: cat.id,
            label: `${cat.icon} ${cat.label}`,
        })),
    ];

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Gastos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie todos os seus gastos e parcelas
                    </p>
                </div>

                <Button onClick={() => setShowAddExpense(true)}>
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Novo Gasto
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <MonthSelector />
                    </div>
                    <div className="sm:ml-auto w-full sm:w-64">
                        <Select
                            options={categoryOptions}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card highlightColor="indigo">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Total de Gastos
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                        {filteredExpenses.length}
                    </p>
                </Card>

                <Card
                    highlightColor={
                        status.status === 'danger'
                            ? 'red'
                            : status.status === 'warning'
                                ? 'yellow'
                                : 'green'
                    }
                >
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Valor do Mês
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                        {CURRENCY_FORMATTER.format(status.totalSpent)}
                    </p>
                </Card>

                <Card highlightColor={status.available >= 0 ? 'green' : 'red'}>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Saldo Restante
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                        {CURRENCY_FORMATTER.format(Math.max(0, status.available))}
                    </p>
                </Card>
            </div>

            {/* Expense List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {categoryFilter === 'all'
                            ? 'Todos os Gastos'
                            : `Gastos: ${CATEGORIES.find((c) => c.id === categoryFilter)?.label}`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredExpenses.length === 0 ? (
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
                                Nenhum gasto encontrado.
                                <br />
                                {categoryFilter !== 'all' && (
                                    <button
                                        onClick={() => setCategoryFilter('all')}
                                        className="text-indigo-500 hover:underline mt-2"
                                    >
                                        Limpar filtro
                                    </button>
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredExpenses.map((expense) => (
                                <ExpenseCard
                                    key={`${expense.id}-${expense.installmentInfo?.current || 0}`}
                                    expense={expense}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Expense Modal */}
            <Modal
                isOpen={showAddExpense}
                onClose={() => setShowAddExpense(false)}
                title="Adicionar Novo Gasto"
            >
                <ExpenseForm onSuccess={() => setShowAddExpense(false)} />
            </Modal>
        </div>
    );
}
