'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { formatCents, cn, parseLocalDate } from '@/lib/utils';
import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type CardType = Database['public']['Tables']['cards']['Row'];
type Invoice = Database['public']['Tables']['invoices']['Row'];

interface UpcomingInvoicesWidgetProps {
    transactions: Transaction[];
    cards: CardType[];
    invoices: Invoice[];
}

export function UpcomingInvoicesWidget({ transactions, cards, invoices }: UpcomingInvoicesWidgetProps) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    const getTargetInvoiceData = (cardId: string) => {
        // Find invoice for current month
        const currentInvoice = invoices.find(inv =>
            inv.card_id === cardId &&
            inv.month === currentMonth &&
            inv.year === currentYear
        );

        let targetMonth = currentMonth;
        let targetYear = currentYear;
        let isNextMonth = false;

        // If current month is PAID, look at next month
        if (currentInvoice?.status === 'PAID') {
            isNextMonth = true;
            if (currentMonth === 12) {
                targetMonth = 1;
                targetYear = currentYear + 1;
            } else {
                targetMonth = currentMonth + 1;
            }
        }

        // Calculate amount for this target month by summing transactions
        const upcomingAmount = transactions
            .filter(tx => {
                if (tx.card_id !== cardId) return false;
                const txDate = parseLocalDate(tx.posted_at);
                // Adjust txDate month to 1-12 range for comparison
                const txMonth = txDate.getMonth() + 1;
                const txYear = txDate.getFullYear();

                return txMonth === targetMonth && txYear === targetYear;
            })
            .reduce((sum, tx) => sum + tx.amount_cents, 0);

        // Determine status to display: if we moved to next month, it's implicitly OPEN (unless a record exists)
        // If we are in current month, use its status (default OPEN)
        let displayStatus = 'OPEN';
        if (isNextMonth) {
            const nextInvoice = invoices.find(inv =>
                inv.card_id === cardId &&
                inv.month === targetMonth &&
                inv.year === targetYear
            );
            displayStatus = nextInvoice?.status || 'OPEN';
        } else {
            displayStatus = currentInvoice?.status || 'OPEN';
        }

        return {
            amount: upcomingAmount,
            month: targetMonth,
            year: targetYear,
            status: displayStatus
        };
    };

    // Calculate details for each card
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
        <Card className="glass-panel text-white p-0">
            <CardHeader className="pb-0 pt-6 px-6 mb-6">
                <div className="flex items-center justify-between">
                    <span className="px-4 py-2 bg-orange-500 border border-orange-400 text-white rounded-xl uppercase tracking-[0.15em] text-[10px] font-black shadow-md shadow-orange-200/50">
                        Próximas Faturas
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
                <div className="mb-2">
                    <p className="text-4xl font-black text-white tracking-tight">
                        {formatCents(totalUpcoming)}
                    </p>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-6 text-slate-300/60">Total Estimado</p>

                {/* Cards Horizontal Container */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar">
                    {cardData.map(card => {
                        const { amount, month, year, status } = card.upcomingData;
                        const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'short' });
                        const cleanMonth = monthName.replace('.', '');

                        const isPaid = status === 'PAID';
                        const isClosed = status === 'CLOSED';

                        return (
                            <div
                                key={card.id}
                                className="flex-shrink-0 w-[240px] snap-start bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-sm font-bold text-white line-clamp-1">{card.name}</span>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter",
                                            isPaid ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                                                isClosed ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                                                    "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        )}>
                                            {cleanMonth}
                                        </span>
                                    </div>

                                    <div className="mt-auto">
                                        <span className="text-xl font-black text-white block">
                                            {formatCents(amount)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {isPaid ? '✓ Fatura Paga' : (isClosed ? '⚠ Fatura Fechada' : '⚙ Fatura Aberta')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {cardData.length === 0 && (
                        <div className="w-full text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                            <p className="text-sm text-slate-400">Sem faturas futuras</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
