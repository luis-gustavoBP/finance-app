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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCents, parseLocalDate, cn, formatFirstName, parseCurrencyInput, formatCurrencyInputValue, getWeekStart, getWeekEnd } from '@/lib/utils';
import { WidgetCard } from '@/components/dashboard/WidgetCard';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';

import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { useAuth } from '@/contexts/AuthContext';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FinancialStabilityWidget } from '@/components/dashboard/FinancialStabilityWidget';
import { SpendingAnalysisWidget } from '@/components/dashboard/SpendingAnalysisWidget';
import { UpcomingInvoicesWidget } from '@/components/dashboard/UpcomingInvoicesWidget';

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
    return <div className="p-8 text-center animate-pulse">Carregando...</div>;
  }

  if (isTxError || isCardsError || isSettingsError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-200 ">
        <h2 className="text-xl font-bold text-red-700 mb-2">Ops! Algo deu errado.</h2>
        <p className="text-red-600 mb-4">
          É provável que você precise aplicar a migração SQL V4 no Supabase.
        </p>
        <code className="block p-4 bg-slate-100 text-slate-800 rounded text-xs overflow-auto mb-4">
          Execute o arquivo: supabase_schema_v4_limits.sql
        </code>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  // Filter transactions for selected month
  const monthlyTransactions = transactions.filter(tx => {
    const txDate = parseLocalDate(tx.posted_at);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const totalSpentMonthly = monthlyTransactions.reduce((sum, tx) => sum + tx.amount_cents, 0);
  const globalLimit = settings?.global_monthly_limit_cents || 0;

  // Calculate specific card limits logic implies total cards limit if manual budget is not preferred, 
  // but we use user setting global_monthly_limit_cents as "Planned Budget".
  // For "Real Card Limit Available", we sum actual card limits.
  const totalCardLimits = cards.reduce((sum, card) => sum + (card.limit_cents || 0), 0);

  // Filter income for selected month
  const monthlyIncome = incomeEntries
    .filter(entry => {
      const entryDate = parseLocalDate(entry.received_at);
      // Filter by selected month AND only include 'budget' destination (default or explicit)
      const isBudget = !entry.destination || entry.destination === 'budget';
      return entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear &&
        isBudget;
    })
    .reduce((sum, entry) => sum + entry.amount_cents, 0);

  // Available balance = Budget + Income - Expenses - Active Subscriptions
  const totalSubscriptions = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + s.amount_cents, 0);

  const availableBalance = globalLimit + monthlyIncome - totalSpentMonthly - totalSubscriptions;

  // Calculate weekly spending
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  const weeklySpent = transactions
    .filter(t => {
      const txDate = parseLocalDate(t.posted_at);
      return txDate >= weekStart && txDate <= weekEnd && (t as any).include_in_weekly_plan !== false;
    })
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const weeklyGoal = settings?.weekly_goal_cents || 0;

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Olá, {formatFirstName(user?.user_metadata?.full_name || user?.email?.split('@')[0])}
            </h1>
            <p className="text-slate-200 mt-1">
              Visão geral dos seus gastos e limites
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MonthSelector />
          </div>
        </div>

        {/* Global Credit Limit Progress (New Requirement) */}
        {totalCardLimits > 0 && (
          <Card className="glass-panel text-white/90">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-white/90">Limite do Cartão Disponível</span>
                  <span className="text-slate-200">{formatCents(totalCardLimits - totalSpentMonthly)} de {formatCents(totalCardLimits)}</span>
                </div>
                <ProgressBar value={totalSpentMonthly} max={totalCardLimits} showLabel={false} size="sm" className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Balance Card com gradiente roxo/rosa (Original) - May move/remove in favor of new Stability Widget? 
            For now keeping it but FinancialStabilityWidget is strictly "Bank Account" view requested. */}
        {/* <BalanceCard available={availableBalance} budget={globalLimit} spent={totalSpentMonthly} /> */}

        {/* Financial Stability - Full Width at Top */}
        <FinancialStabilityWidget />

        {/* Widgets Grid - Restructured */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Spending Analysis & Weekly */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WidgetCard
                title="Progresso Semanal"
                value={weeklySpent}
                subtitle={`${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} • Meta: ${formatCents(weeklyGoal)}`}
                icon="trending"
                variant="blue"
              >
                {weeklyGoal > 0 && (
                  <div className="mt-3">
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        style={{ width: `${Math.min((weeklySpent / weeklyGoal) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/60 font-bold mt-2 uppercase tracking-tight">
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
                variant="green"
              />
            </div>

            <SpendingAnalysisWidget transactions={transactions} monthlyLimit={globalLimit} />

            <CategoryPieChart transactions={monthlyTransactions as any} categories={categories} />
          </div>

          {/* Right Column: Invoices & Quick Stats */}
          <div className="space-y-6">
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
    </div >
  );
}
