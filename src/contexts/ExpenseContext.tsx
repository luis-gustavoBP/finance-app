'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Expense, Settings, BudgetStatus, Category } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
    generateId,
    calculateInstallmentValue,
    calculateBudgetStatus,
    getMonthString,
    getExpensesForMonth,
    groupExpensesByCategory,
} from '@/lib/calculations';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface ExpenseContextType {
    expenses: Expense[];
    settings: Settings;
    currentMonth: string;
    setCurrentMonth: (month: string) => void;
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'installmentValue'>) => void;
    updateExpense: (id: string, expense: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    updateSettings: (settings: Partial<Settings>) => void;
    getBudgetStatus: () => BudgetStatus;
    getMonthlyExpenses: () => (Expense & { installmentInfo?: { current: number; total: number } })[];
    getCategoryTotals: () => Record<Category, number>;
    isHydrated: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useLocalStorage<Expense[]>('contapp-expenses', []);
    const [settings, setSettings] = useLocalStorage<Settings>('contapp-settings', DEFAULT_SETTINGS);
    const [currentMonth, setCurrentMonth] = useState<string>('');
    const [isHydrated, setIsHydrated] = useState(false);

    // Set the current month only on client side to avoid hydration mismatch
    useEffect(() => {
        setCurrentMonth(getMonthString(new Date()));
        setIsHydrated(true);
    }, []);

    const addExpense = (
        expenseData: Omit<Expense, 'id' | 'createdAt' | 'installmentValue'>
    ) => {
        const installmentValue = calculateInstallmentValue(
            expenseData.totalValue,
            expenseData.installments
        );

        const newExpense: Expense = {
            ...expenseData,
            id: generateId(),
            installmentValue,
            createdAt: new Date().toISOString(),
        };

        setExpenses((prev) => [...prev, newExpense]);
    };

    const updateExpense = (id: string, updates: Partial<Expense>) => {
        setExpenses((prev) =>
            prev.map((expense) => {
                if (expense.id !== id) return expense;

                const updated = { ...expense, ...updates };

                // Recalculate installment value if total or installments changed
                if (updates.totalValue !== undefined || updates.installments !== undefined) {
                    updated.installmentValue = calculateInstallmentValue(
                        updated.totalValue,
                        updated.installments
                    );
                }

                return updated;
            })
        );
    };

    const deleteExpense = (id: string) => {
        setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    };

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    const getBudgetStatus = (): BudgetStatus => {
        return calculateBudgetStatus(expenses, settings.monthlyBudget, currentMonth, settings.daysBeforeClose, settings.dueDay);
    };

    const getMonthlyExpenses = () => {
        return getExpensesForMonth(expenses, currentMonth, settings.daysBeforeClose, settings.dueDay);
    };

    const getCategoryTotals = (): Record<Category, number> => {
        return groupExpensesByCategory(expenses, currentMonth, settings.daysBeforeClose, settings.dueDay);
    };

    return (
        <ExpenseContext.Provider
            value={{
                expenses,
                settings,
                currentMonth,
                setCurrentMonth,
                addExpense,
                updateExpense,
                deleteExpense,
                updateSettings,
                getBudgetStatus,
                getMonthlyExpenses,
                getCategoryTotals,
                isHydrated,
            }}
        >
            {children}
        </ExpenseContext.Provider>
    );
}

export function useExpenses() {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
}
