'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useIncome } from '@/hooks/useIncome';
import { useInvoices } from '@/hooks/useInvoices';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { formatCents, parseLocalDate, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';

export function FinancialStabilityWidget() {
    const { transactions } = useTransactions();
    const { incomeEntries } = useIncome();
    const { invoices } = useInvoices();
    const { subscriptions } = useSubscriptions();
    const { selectedDate } = useMonthFilter();

    const currentMonth = selectedDate.getMonth() + 1;
    const currentYear = selectedDate.getFullYear();

    const totalIncomeBudget = incomeEntries
        .filter(inc => inc.destination === 'budget')
        .reduce((sum, inc) => sum + inc.amount_cents, 0);

    const totalSpentDebit = transactions
        .filter(tx => tx.payment_method !== 'credit')
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    const currentBalance = totalIncomeBudget - totalSpentDebit;

    // Determine next month/year
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    // Check which cards have their current month invoice paid
    const paidCardIds = new Set(
        invoices
            .filter(inv => inv.month === currentMonth && inv.year === currentYear && inv.status === 'PAID')
            .map(inv => inv.card_id)
    );

    const openInvoicesSum = transactions
        .filter(tx => {
            if (tx.payment_method !== 'credit') return false;
            const txDate = parseLocalDate(tx.posted_at);
            const txMonth = txDate.getMonth() + 1;
            const txYear = txDate.getFullYear();

            // Current month transactions with unpaid invoices
            if (txMonth === currentMonth && txYear === currentYear) {
                return !paidCardIds.has(tx.card_id || '');
            }

            // Next month transactions — only for cards whose current month invoice is NOT paid
            if (txMonth === nextMonth && txYear === nextYear) {
                return !paidCardIds.has(tx.card_id || '');
            }

            return false;
        })
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    const activeSubscriptionsSum = subscriptions
        .filter(sub => sub.active)
        .reduce((sum, sub) => sum + sub.amount_cents, 0);

    const netBalance = currentBalance - openInvoicesSum - activeSubscriptionsSum;

    return (
        <Card className="!bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-emerald-500/[0.05] text-white relative overflow-hidden !border-white/[0.08]">
            {/* Subtle glow elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/[0.06] rounded-full -mr-24 -mt-24 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/[0.04] rounded-full -ml-24 -mb-24 blur-3xl" />

            <div className="relative px-4 sm:px-6 py-5 sm:py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <span className="px-3 py-1.5 bg-white/[0.06] rounded-lg border border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-white/50">
                        Situação Financeira
                    </span>
                    <span className="text-[10px] text-white/25 font-mono uppercase tracking-wider">
                        {selectedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {/* Liquid Balance */}
                    <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">Saldo em Conta</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {formatCents(currentBalance)}
                            </span>
                            {currentBalance > 0 && (
                                <span className="text-[9px] bg-emerald-400/15 text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase">Ativo</span>
                            )}
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="space-y-2 border-white/[0.06] pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6">
                        <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">Comprometido</span>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] text-white/50">Faturas</span>
                                <span className="text-sm font-semibold text-white/80">{formatCents(openInvoicesSum)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] text-white/50">Assinaturas</span>
                                <span className="text-sm font-semibold text-white/80">{formatCents(activeSubscriptionsSum)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Net Balance */}
                    <div className="bg-white/[0.04] p-4 rounded-xl border border-white/[0.06] md:text-right">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Saldo Líquido</span>
                        <div className="flex items-baseline md:justify-end gap-2 mt-1">
                            <span className={cn(
                                "text-2xl sm:text-3xl font-bold tracking-tight",
                                netBalance < 0 ? "text-amber-400" : "text-white"
                            )}>
                                {formatCents(netBalance)}
                            </span>
                        </div>
                        <p className="text-[10px] text-white/25 mt-1 font-medium">Após quitar faturas do mês</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
