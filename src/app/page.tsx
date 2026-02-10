'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';
import { useSettings } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { useIncome } from '@/hooks/useIncome';
import { useInvoices } from '@/hooks/useInvoices';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCents, parseLocalDate, cn, formatFirstName, parseCurrencyInput, formatCurrencyInputValue } from '@/lib/utils';
import { WidgetCard } from '@/components/dashboard/WidgetCard';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';

import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { useAuth } from '@/contexts/AuthContext';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FinancialStabilityWidget } from '@/components/dashboard/FinancialStabilityWidget';
import { SpendingAnalysisWidget } from '@/components/dashboard/SpendingAnalysisWidget';
import { UpcomingInvoicesWidget } from '@/components/dashboard/UpcomingInvoicesWidget';
import { WeeklyProgress } from '@/components/dashboard/WeeklyProgress';

export default function DashboardPage() {
  const { transactions, isLoading: isTxLoading, error: isTxError } = useTransactions();
  const { cards, isLoading: isCardsLoading, error: isCardsError } = useCards();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { settings, updateSettings, isLoading: isSettingsLoading, error: isSettingsError } = useSettings();
  const { incomeEntries, isLoading: isIncomeLoading } = useIncome();
  const { invoices, isLoading: isInvoicesLoading } = useInvoices();
  const { subscriptions, isLoading: isSubsLoading } = useSubscriptions();
  const { selectedDate } = useMonthFilter();
  const { user } = useAuth();

  const [isConfiguringBudget, setIsConfiguringBudget] = useState(false);
  const [newGlobalLimit, setNewGlobalLimit] = useState('');

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const handleSaveBudget = async () => {
    const limitInCents = parseCurrencyInput(newGlobalLimit);
    if (isNaN(limitInCents)) return;

    await updateSettings({ global_monthly_limit_cents: limitInCents });
    setIsConfiguringBudget(false);
  };

  if (isTxLoading || isCardsLoading || isSettingsLoading || isCategoriesLoading || isInvoicesLoading || isSubsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <span className="text-sm text-white/30">Carregando...</span>
        </div>
      </div>
    );
  }

  if (isTxError || isCardsError || isSettingsError) {
    return (
      <div className="p-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-sm text-white/50 mb-4">
              É provável que você precise aplicar a migração SQL V4 no Supabase.
            </p>
            <Button onClick={() => window.location.reload()} size="sm">Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthlyTransactions = transactions.filter(tx => {
    const txDate = parseLocalDate(tx.posted_at);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const totalSpentMonthly = monthlyTransactions.reduce((sum, tx) => sum + tx.amount_cents, 0);
  const globalLimit = settings?.global_monthly_limit_cents || 0;
  const totalCardLimits = cards.reduce((sum, card) => sum + (card.limit_cents || 0), 0);

  const monthlyIncome = incomeEntries
    .filter(entry => {
      const entryDate = parseLocalDate(entry.received_at);
      const isBudget = !entry.destination || entry.destination === 'budget';
      return entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear &&
        isBudget;
    })
    .reduce((sum, entry) => sum + entry.amount_cents, 0);

  const totalSubscriptions = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + s.amount_cents, 0);

  const availableBalance = globalLimit + monthlyIncome - totalSpentMonthly - totalSubscriptions;
  const weeklyGoal = settings?.weekly_goal_cents || 0;

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Olá, {formatFirstName(user?.user_metadata?.full_name || user?.email?.split('@')[0])}
            </h1>
            <p className="text-sm text-white/30 mt-0.5">
              Visão geral dos seus gastos
            </p>
          </div>
          <MonthSelector />
        </div>

        {/* Card Limit Bar */}
        {totalCardLimits > 0 && (
          <Card className="!p-3 sm:!p-4">
            <div className="flex-1">
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="font-medium text-white/40">Limite Disponível</span>
                <span className="text-white/50">{formatCents(totalCardLimits - totalSpentMonthly)} de {formatCents(totalCardLimits)}</span>
              </div>
              <ProgressBar value={totalSpentMonthly} max={totalCardLimits} showLabel={false} size="sm" className="h-1.5" />
            </div>
          </Card>
        )}

        {/* Financial Stability */}
        <FinancialStabilityWidget />

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <WeeklyProgress
                transactions={transactions}
                monthlyLimit={globalLimit}
                weeklyGoal={weeklyGoal}
                selectedMonth={selectedDate}
              />
              <WidgetCard
                title="Entradas no Mês"
                value={monthlyIncome}
                subtitle={`${incomeEntries.filter(e => {
                  const d = parseLocalDate(e.received_at);
                  return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                }).length} entrada(s)`}
                icon="dollar"
                variant="green"
              />
            </div>

            <SpendingAnalysisWidget transactions={transactions} monthlyLimit={globalLimit} />
            <CategoryPieChart transactions={monthlyTransactions as any} categories={categories} />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <UpcomingInvoicesWidget
              transactions={transactions}
              cards={cards}
              invoices={invoices}
            />
          </div>
        </div>

        {/* Budget Configuration Modal */}
        <Modal
          isOpen={isConfiguringBudget}
          onClose={() => setIsConfiguringBudget(false)}
          title="Configurar Orçamento"
        >
          <div className="space-y-4">
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
            <p className="text-xs text-white/25">
              Este limite será usado para o resumo geral de todos os seus cartões.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsConfiguringBudget(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveBudget}>
                Salvar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
