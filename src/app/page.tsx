'use client';

import { useState } from 'react';
import { BudgetOverview } from '@/components/dashboard/BudgetOverview';
import { MonthlyChart } from '@/components/dashboard/MonthlyChart';
import { BudgetAlerts } from '@/components/dashboard/BudgetAlerts';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { WeeklyOverview } from '@/components/dashboard/WeeklyOverview';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/contexts/ExpenseContext';

export default function DashboardPage() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const { isHydrated } = useExpenses();

  // Show loading skeleton during hydration to avoid mismatch
  if (!isHydrated) {
    return (
      <div className="space-y-6 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Visão geral das suas finanças
            </p>
          </div>
        </div>
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Visão geral das suas finanças
          </p>
        </div>

        <div className="flex items-center gap-4">
          <MonthSelector />
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
      </div>

      {/* Budget Alerts */}
      <BudgetAlerts />

      {/* Weekly Overview */}
      <WeeklyOverview />

      {/* Budget Overview */}
      <BudgetOverview />

      {/* Charts and Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart />
        <ExpenseList />
      </div>

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
