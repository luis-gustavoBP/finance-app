'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { formatCents, cn, parseLocalDate } from '@/lib/utils';
import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type CardType = Database['public']['Tables']['cards']['Row'];
type Invoice = Database['public']['Tables']['invoices']['Row'];

import { useMonthFilter } from '@/contexts/MonthFilterContext';

interface UpcomingInvoicesWidgetProps {
    transactions: Transaction[];
    cards: CardType[];
    invoices: Invoice[];
}

export function UpcomingInvoicesWidget({ transactions, cards, invoices }: UpcomingInvoicesWidgetProps) {
    const { selectedDate } = useMonthFilter();
    const currentMonth = selectedDate.getMonth() + 1;
    const currentYear = selectedDate.getFullYear();

    const getTargetInvoiceData = (cardId: string) => {
        const currentInvoice = invoices.find(inv =>
            inv.card_id === cardId &&
            inv.month === currentMonth &&
            inv.year === currentYear
        );

        const targetMonth = currentMonth;
        const targetYear = currentYear;

        const upcomingAmount = transactions
            .filter(tx => {
                if (tx.card_id !== cardId) return false;
                const txDate = parseLocalDate(tx.posted_at);
                const txMonth = txDate.getMonth() + 1;
                const txYear = txDate.getFullYear();

                return txMonth === targetMonth && txYear === targetYear;
            })
            .reduce((sum, tx) => sum + tx.amount_cents, 0);

        const displayStatus = currentInvoice?.status || 'OPEN';

        return {
            amount: upcomingAmount,
            month: targetMonth,
            year: targetYear,
            status: displayStatus
        };
    };

    const cardData = cards.map(card => {
        const data = getTargetInvoiceData(card.id);
        return {
            ...card,
            upcomingData: data
        };
    })
        .sort((a, b) => b.upcomingData.amount - a.upcomingData.amount);

    const totalUpcoming = cardData.reduce((sum, item) => sum + item.upcomingData.amount, 0);

    return (
        <Card className="overflow-hidden">
            <div className="px-4 sm:px-5 py-4 sm:py-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        Próximas Faturas
                    </span>
                </div>

                {/* Total */}
                <div className="mb-1">
                    <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {formatCents(totalUpcoming)}
                    </p>
                </div>
                <p className="text-[11px] text-white/25 font-medium mb-5">Total estimado</p>

                {/* Cards */}
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar -mx-1 px-1">
                    {cardData.map(card => {
                        const { amount, month, year, status } = card.upcomingData;
                        const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'short' });
                        const cleanMonth = monthName.replace('.', '');

                        const isPaid = status === 'PAID';
                        const isClosed = status === 'CLOSED';

                        return (
                            <div
                                key={card.id}
                                className="flex-shrink-0 w-[170px] sm:w-[200px] snap-start bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="flex flex-col h-full gap-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[13px] font-medium text-white/70 line-clamp-1">{card.name}</span>
                                        <span className={cn(
                                            "text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase",
                                            isPaid ? "bg-emerald-400/10 text-emerald-400" :
                                                isClosed ? "bg-red-400/10 text-red-400" :
                                                    "bg-blue-400/10 text-blue-400"
                                        )}>
                                            {cleanMonth}
                                        </span>
                                    </div>

                                    <div className="mt-auto">
                                        <span className="text-lg font-bold text-white block">
                                            {formatCents(amount)}
                                        </span>
                                        <span className="text-[10px] text-white/20 font-medium">
                                            {isPaid ? '✓ Paga' : (isClosed ? '⚠ Fechada' : '⚙ Aberta')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {cardData.length === 0 && (
                        <div className="w-full text-center py-6 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.06]">
                            <p className="text-[13px] text-white/20">Sem faturas futuras</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
