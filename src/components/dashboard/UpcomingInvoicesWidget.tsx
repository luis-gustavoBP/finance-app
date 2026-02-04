'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar } from 'lucide-react';
import { cn, formatCents, parseLocalDate } from '@/lib/utils';
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
        .filter(c => c.upcomingData.amount > 0 || c.upcomingData.status !== 'PAID') // Optional: Hide paid 0 balance? Keep for now to show status.
        .sort((a, b) => b.upcomingData.amount - a.upcomingData.amount);

    const totalUpcoming = cardData.reduce((sum, item) => sum + item.upcomingData.amount, 0);

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg p-2 bg-orange-100">
                    <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Próximas Faturas</h3>
            </div>

            <div className="mb-4">
                <p className="text-3xl font-bold text-slate-900">
                    {formatCents(totalUpcoming)}
                </p>
                <p className="text-sm text-slate-500">total estimado</p>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[160px] pr-2 -mr-2">
                {cardData.map(card => {
                    const { amount, month, year, status } = card.upcomingData;
                    const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'short' });
                    // Remove dot from abbreviated month if present (e.g. "fev." -> "fev")
                    const cleanMonth = monthName.replace('.', '');

                    const isPaid = status === 'PAID';
                    const isClosed = status === 'CLOSED';

                    return (
                        <div key={card.id} className="flex items-center justify-between border-b last:border-0 border-slate-50 pb-2 last:pb-0">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700">{card.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider",
                                        isPaid ? "bg-green-100 text-green-700" :
                                            isClosed ? "bg-red-100 text-red-700" :
                                                "bg-blue-100 text-blue-700"
                                    )}>
                                        {cleanMonth}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {isPaid ? 'Pago' : (isClosed ? 'Fechada' : 'Aberta')}
                                    </span>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">
                                {formatCents(amount)}
                            </span>
                        </div>
                    );
                })}
                {cardData.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-2">Sem faturas futuras</p>
                )}
            </div>
        </div>
    );
}
