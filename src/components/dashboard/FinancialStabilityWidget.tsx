'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useIncome } from '@/hooks/useIncome';
import { useInvoices } from '@/hooks/useInvoices';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { formatCents, parseLocalDate, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function FinancialStabilityWidget() {
    const { transactions } = useTransactions();
    const { incomeEntries } = useIncome();
    const { invoices } = useInvoices();
    const { selectedDate } = useMonthFilter();

    const currentMonth = selectedDate.getMonth() + 1;
    const currentYear = selectedDate.getFullYear();

    // 1. Calculate "Na conta agora" (Liquid Balance)
    // This is always global current state
    const totalIncomeBudget = incomeEntries
        .filter(inc => inc.destination === 'budget')
        .reduce((sum, inc) => sum + inc.amount_cents, 0);

    const totalSpentDebit = transactions
        .filter(tx => tx.payment_method !== 'credit')
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    const currentBalance = totalIncomeBudget - totalSpentDebit;

    // 2. Faturas do Mês Selecionado (Invoices for filtered month)
    const openInvoicesSum = transactions
        .filter(tx => {
            if (tx.payment_method !== 'credit') return false;
            const txDate = parseLocalDate(tx.posted_at);
            const txMonth = txDate.getMonth() + 1;
            const txYear = txDate.getFullYear();

            // Filter by dashboard month
            if (txMonth !== currentMonth || txYear !== currentYear) return false;

            // Check if there is a PAID invoice record
            const isPaid = invoices.some(inv =>
                inv.card_id === tx.card_id &&
                inv.month === txMonth &&
                inv.year === txYear &&
                inv.status === 'PAID'
            );

            return !isPaid;
        })
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    const netBalance = currentBalance - openInvoicesSum;

    return (
        <Card className="glass-panel bg-gradient-to-br from-indigo-600/30 via-navy-900/20 to-teal-500/30 text-white shadow-2xl relative overflow-hidden border-white/20">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />

            <CardHeader className="pb-0 pt-8 px-8 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-white/90">
                    <span className="px-5 py-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-black shadow-lg">
                        Situação Financeira Geral
                    </span>
                </CardTitle>
                <div className="hidden sm:block text-[10px] text-white/40 font-mono uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
                    Status: {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Liquid Balance */}
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Saldo em Conta</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tighter">
                                {formatCents(currentBalance)}
                            </span>
                            {currentBalance > 0 && (
                                <span className="text-[9px] bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-md font-black uppercase">Ativo</span>
                            )}
                        </div>
                    </div>

                    {/* Pending Invoices for current month */}
                    <div className="space-y-1 border-white/10 md:border-l md:pl-8">
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Faturas de {selectedDate.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white/90 tracking-tight">
                                - {formatCents(openInvoicesSum)}
                            </span>
                        </div>
                    </div>

                    {/* Final Projection */}
                    <div className="md:text-right space-y-1 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ring-1 ring-white/20">
                        <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Saldo Líquido Estimado</span>
                        <div className="flex items-baseline md:justify-end gap-2">
                            <span className={cn(
                                "text-4xl font-black italic tracking-tighter drop-shadow-sm",
                                netBalance < 0 ? "text-yellow-300" : "text-white"
                            )}>
                                {formatCents(netBalance)}
                            </span>
                        </div>
                        <p className="text-[9px] text-white/50 mt-1 font-bold uppercase tracking-tight">Após quitar as faturas deste mês</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
