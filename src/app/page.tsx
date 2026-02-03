'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';
import { useSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { useIncome } from '@/hooks/useIncome';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCents, cn, parseCurrencyInput, formatCurrencyInputValue, getWeekStart, parseLocalDate } from '@/lib/utils';
import { WeeklyProgress } from '@/components/dashboard/WeeklyProgress';
import { MonthlyPace } from '@/components/dashboard/MonthlyPace';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { FutureCommitments } from '@/components/dashboard/FutureCommitments';
import { MonthlyIncome } from '@/components/dashboard/MonthlyIncome';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { WidgetCard } from '@/components/dashboard/WidgetCard';
import { EvolutionChart } from '@/components/dashboard/EvolutionChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';

export default function DashboardPage() {
  const { transactions, isLoading: isTxLoading, error: isTxError } = useTransactions();
  const { cards, isLoading: isCardsLoading, error: isCardsError } = useCards();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { settings, updateSettings, isLoading: isSettingsLoading, error: isSettingsError } = useSettings();
  const { incomeEntries, isLoading: isIncomeLoading } = useIncome();

  const [isConfiguringBudget, setIsConfiguringBudget] = useState(false);
  const [newGlobalLimit, setNewGlobalLimit] = useState('');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const handleSaveBudget = async () => {
    const limitInCents = parseCurrencyInput(newGlobalLimit);
    if (isNaN(limitInCents)) return;

    await updateSettings({ global_monthly_limit_cents: limitInCents });
    setIsConfiguringBudget(false);
  };

  if (isTxLoading || isCardsLoading || isSettingsLoading || isCategoriesLoading) {
    return <div className="p-8 text-center animate-pulse">Carregando...</div>;
  }

  if (isTxError || isCardsError || isSettingsError) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Ops! Algo deu errado.</h2>
        <p className="text-red-600 dark:text-red-500 mb-4">
          É provável que você precise aplicar a migração SQL V4 no Supabase.
        </p>
        <code className="block p-4 bg-slate-900 text-slate-100 rounded text-xs overflow-auto mb-4">
          Execute o arquivo: supabase_schema_v4_limits.sql
        </code>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  // Filter transactions for current month
  const monthlyTransactions = transactions.filter(tx => {
    const txDate = parseLocalDate(tx.posted_at);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const totalSpentMonthly = monthlyTransactions.reduce((sum, tx) => sum + tx.amount_cents, 0);

  const globalLimit = settings?.global_monthly_limit_cents || 0;

  // Calculate current month's income
  const monthlyIncome = incomeEntries
    .filter(entry => {
      const entryDate = parseLocalDate(entry.received_at);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    })
    .reduce((sum, entry) => sum + entry.amount_cents, 0);

  // Available balance = Budget + Income - Expenses
  const availableBalance = globalLimit + monthlyIncome - totalSpentMonthly;

  // Calculate weekly spending
  const weekStart = getWeekStart();
  const weeklySpent = transactions
    .filter(t => parseLocalDate(t.posted_at) >= weekStart && (t as any).include_in_weekly_plan !== false)
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const weeklyGoal = settings?.weekly_goal_cents || 0;

  // Calculate spending per card for the current month
  const getSpentByCard = (cardId: string) => {
    return monthlyTransactions
      .filter(tx => tx.card_id === cardId)
      .reduce((sum, tx) => sum + tx.amount_cents, 0);
  };

  const recentTransactions = transactions.slice(0, 5);

  const calculateProgress = (spent: number, limit: number) => {
    if (!limit || limit === 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const globalProgress = calculateProgress(totalSpentMonthly, globalLimit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 -m-8 p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Visão geral dos seus gastos e limites
            </p>
          </div>
        </div>

        {/* Balance Card com gradiente roxo/rosa */}
        <BalanceCard
          available={availableBalance}
          budget={globalLimit}
          spent={totalSpentMonthly}
        />

        {/* Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <WidgetCard
            title="Progresso Semanal"
            value={weeklySpent}
            subtitle={`de ${formatCents(weeklyGoal)}`}
            icon="trending"
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          >
            {weeklyGoal > 0 && (
              <div className="mt-3">
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${Math.min((weeklySpent / weeklyGoal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {((weeklySpent / weeklyGoal) * 100).toFixed(1)}% da meta semanal
                </p>
              </div>
            )}
          </WidgetCard>

          <WidgetCard
            title="Entradas no Mês"
            value={monthlyIncome}
            subtitle={`${incomeEntries.filter(e => {
              const d = parseLocalDate(e.received_at);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length} entrada(s)`}
            icon="dollar"
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />

          <WidgetCard
            title="Próximas Parcelas"
            value={transactions.filter(t =>
              t.installment_number &&
              t.installment_number < (t.installments || 1)
            ).length.toString()}
            subtitle="parcelas pendentes"
            icon="calendar"
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvolutionChart transactions={transactions as any} />
          <CategoryPieChart transactions={monthlyTransactions as any} categories={categories} />
        </div>

        {/* Original Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Progress & Pace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeeklyProgress
                transactions={transactions as any}
                monthlyLimit={globalLimit}
                weeklyGoal={settings?.weekly_goal_cents}
              />
              <FutureCommitments transactions={transactions as any} />
            </div>
            {/* Monthly Evolution */}
            <MonthlyPace transactions={transactions} monthlyLimit={globalLimit} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Income Widget */}
            <MonthlyIncome />

            {/* Category & Stats */}
            <CategoryChart transactions={monthlyTransactions} />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Resumo Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Cartões Ativos</span>
                  <span className="font-bold">{cards.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Transações (Mês)</span>
                  <span className="font-bold">{monthlyTransactions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Budget Configuration Modal */}
        <Modal
          isOpen={isConfiguringBudget}
          onClose={() => setIsConfiguringBudget(false)}
          title="Configurar Orçamento Global"
        >
          <div className="space-y-4 pt-4">
            <Input
              label="Limite Mensal (R$)"
              value={newGlobalLimit}
              onChange={(e) => {
                const cents = parseCurrencyInput(e.target.value);
                setNewGlobalLimit(formatCurrencyInputValue(cents));
              }}
              placeholder="Ex: 5000,00"
              type="text"
            />
            <p className="text-xs text-slate-500">
              Este limite será usado para o resumo geral de todos os seus cartões.
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setIsConfiguringBudget(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveBudget}>
                Salvar Orçamento
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
