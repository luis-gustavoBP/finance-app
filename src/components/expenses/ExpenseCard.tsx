'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { useExpenses } from '@/contexts/ExpenseContext';
import { getCategoryInfo, CURRENCY_FORMATTER } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

interface ExpenseCardProps {
    expense: Expense & { installmentInfo?: { current: number; total: number } };
    showActions?: boolean;
}

export function ExpenseCard({ expense, showActions = true }: ExpenseCardProps) {
    const { deleteExpense } = useExpenses();
    const [showConfirm, setShowConfirm] = useState(false);
    const category = getCategoryInfo(expense.category);

    const handleDelete = () => {
        deleteExpense(expense.id);
        setShowConfirm(false);
    };

    const displayValue = expense.installmentInfo
        ? expense.installmentValue
        : expense.totalValue;

    const formattedDate = new Date(expense.purchaseDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });

    return (
        <div className="group relative bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 transition-all hover:bg-slate-100 dark:hover:bg-slate-700">
            <div className="flex items-start gap-3">
                {/* Category Icon */}
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                >
                    {category.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                {expense.item}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        backgroundColor: `${category.color}20`,
                                        color: category.color,
                                    }}
                                >
                                    {category.label}
                                </span>
                                <span className="text-xs text-slate-400">{formattedDate}</span>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                                {CURRENCY_FORMATTER.format(displayValue)}
                            </p>
                            {expense.installmentInfo && (
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                    Parcela {expense.installmentInfo.current}/{expense.installmentInfo.total}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!showConfirm ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Excluir"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1">
                            <Button size="sm" variant="danger" onClick={handleDelete}>
                                Excluir
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowConfirm(false)}>
                                Cancelar
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
