'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useIncome } from '@/hooks/useIncome';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useSettings } from '@/hooks/useSettings';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { formatCents, parseLocalDate, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export function FinancialStabilityWidget() {
    const { transactions } = useTransactions();
    const { incomeEntries } = useIncome();
    const { subscriptions } = useSubscriptions();
    const { settings } = useSettings();
    const { selectedDate } = useMonthFilter();

    const currentMonth = selectedDate.getMonth() + 1;
    const currentYear = selectedDate.getFullYear();

    const monthlyBudget = settings?.global_monthly_limit_cents || 0;

    // Helper: check if a date string is exactly in the selected month
    const isInSelectedMonth = (dateStr: string | null) => {
        if (!dateStr) return false;
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const d = parseLocalDate(datePart);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    };

    // --- COMPONENTES DO CÁLCULO ---
    // 1. Entradas extras do mês
    const monthlyExtraIncome = incomeEntries
        .filter(inc => isInSelectedMonth(inc.received_at) && (!inc.destination || inc.destination === 'budget'))
        .reduce((sum, inc) => sum + inc.amount_cents, 0);

    // 2. Todos os gastos do mês (crédito + débito + pix...)
    const monthlyTotalSpent = transactions
        .filter(tx => isInSelectedMonth(tx.posted_at))
        .reduce((sum, tx) => sum + tx.amount_cents, 0);

    // 3. Contas fixas (assinaturas)
    const fixedBillsSum = subscriptions
        .filter(sub => sub.active)
        .reduce((sum, sub) => sum + sub.amount_cents, 0);

    // 4. Saldo Disponível: Orçamento + Entradas - Gastos - Contas Fixas
    const availableTotal = monthlyBudget + monthlyExtraIncome - monthlyTotalSpent - fixedBillsSum;

    return (
        <Card className="!bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-emerald-500/[0.05] text-white relative overflow-hidden !border-white/[0.08]">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.05] rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/[0.03] rounded-full -ml-32 -mb-32 blur-3xl" />

            <div className="relative px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Main Balance Display */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-3 py-1 bg-white/[0.06] rounded-lg border border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-white/50">
                                Saldo Disponível
                            </span>
                            <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
                                {selectedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <h2 className={cn(
                            "text-4xl sm:text-5xl font-bold tracking-tight",
                            availableTotal < 0 ? "text-amber-400" : "text-white"
                        )}>
                            {formatCents(availableTotal)}
                        </h2>
                        <p className="text-[12px] text-white/30 font-medium ml-1">
                            Restante no orçamento mensal
                        </p>
                    </div>

                    {/* Breakdown Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-6 md:pt-0 border-t md:border-t-0 border-white/[0.06] w-full md:w-auto">
                        <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider block">Orçamento</span>
                            <span className="text-sm font-bold text-white/80">{formatCents(monthlyBudget)}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider block">Entradas</span>
                            <span className="text-sm font-bold text-emerald-400">+{formatCents(monthlyExtraIncome)}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider block">Gastos</span>
                            <span className="text-sm font-bold text-white/80">{formatCents(monthlyTotalSpent)}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider block">Contas Fixas</span>
                            <span className="text-sm font-bold text-white/80">{formatCents(fixedBillsSum)}</span>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-8 h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div 
                        className={cn(
                            "h-full transition-all duration-1000",
                            availableTotal < (monthlyBudget * 0.1) ? "bg-amber-400" : "bg-indigo-400"
                        )}
                        style={{ width: `${Math.max(0, Math.min(100, (availableTotal / (monthlyBudget + monthlyExtraIncome)) * 100))}%` }}
                    />
                </div>
            </div>
        </Card>
    );
}
