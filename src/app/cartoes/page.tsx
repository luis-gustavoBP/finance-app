'use client';

import { useState } from 'react';
import { useCards } from '@/hooks/useCards';
import { useTransactions } from '@/hooks/useTransactions';
import { useInvoices } from '@/hooks/useInvoices';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { Button } from '@/components/ui/Button';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatCents, parseLocalDate, cn } from '@/lib/utils';
import { CreditCard, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function CartoesPage() {
    const { cards, deleteCard, isLoading } = useCards();
    const { showToast } = useToast();
    const { transactions } = useTransactions();
    const { invoices, updateInvoiceStatus } = useInvoices();
    const { selectedDate } = useMonthFilter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const getMonthlySpentByCard = (cardId: string) => {
        return transactions
            .filter(tx => {
                const txDate = parseLocalDate(tx.posted_at);
                return tx.card_id === cardId &&
                    txDate.getMonth() === currentMonth &&
                    txDate.getFullYear() === currentYear;
            })
            .reduce((sum, tx) => sum + tx.amount_cents, 0);
    };

    const getInvoiceStatus = (cardId: string) => {
        const invoice = invoices.find(inv =>
            inv.card_id === cardId &&
            inv.month === currentMonth + 1 &&
            inv.year === currentYear
        );
        return invoice?.status || 'OPEN';
    };

    const handleTogglePaid = async (cardId: string, currentStatus: string, amount: number) => {
        const newStatus = currentStatus === 'PAID' ? 'OPEN' : 'PAID';
        await updateInvoiceStatus(cardId, currentMonth + 1, currentYear, newStatus, amount);
    };

    const handleDeleteClick = (e: React.MouseEvent, cardId: string, cardName: string) => {
        e.preventDefault();
        e.stopPropagation();
        setCardToDelete({ id: cardId, name: cardName });
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!cardToDelete) return;

        setIsDeleting(true);
        try {
            await deleteCard(cardToDelete.id);
            setDeleteConfirmOpen(false);
            setCardToDelete(null);
        } catch (error: any) {
            console.error(error);
            showToast('Erro ao excluir transação.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const getClosingDay = (dueDay: number, closingDaysBefore: number): number => {
        let closingDay = dueDay - closingDaysBefore;
        if (closingDay <= 0) closingDay += 30;
        return closingDay;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                    <span className="text-sm text-white/30">Carregando cartões...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                            Cartões de Crédito
                        </h1>
                        <p className="text-sm text-white/30 mt-0.5">
                            Gerencie seus cartões e limites
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <MonthSelector />
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsAddModalOpen(true)}
                            className="shrink-0"
                        >
                            + Novo
                        </Button>
                    </div>
                </div>

                {/* Cards Grid */}
                {cards.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-10 text-center border border-white/[0.06]">
                        <div className="text-3xl mb-3 opacity-50">💳</div>
                        <p className="text-white/40 text-sm">Nenhum cartão cadastrado ainda.</p>
                        <p className="text-white/20 text-xs mt-1">
                            Clique em "Novo" para adicionar seu primeiro cartão.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cards.map(card => {
                            const monthlySpent = getMonthlySpentByCard(card.id);
                            const limitCents = card.limit_cents || 0;
                            const availableLimit = limitCents - monthlySpent;
                            const usagePercentage = limitCents > 0
                                ? Math.min((monthlySpent / limitCents) * 100, 100)
                                : 0;

                            const invoiceStatus = getInvoiceStatus(card.id);
                            const isPaid = invoiceStatus === 'PAID';
                            const isClosed = invoiceStatus === 'CLOSED';

                            let progressColor = 'bg-indigo-400';
                            if (usagePercentage > 90) progressColor = 'bg-red-400';
                            else if (usagePercentage > 70) progressColor = 'bg-amber-400';

                            return (
                                <div
                                    key={card.id}
                                    className="glass-panel rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all"
                                >
                                    {/* Card Header */}
                                    <div
                                        className="p-4 sm:p-5 text-white relative"
                                        style={{ backgroundColor: `${card.color || '#6366f1'}20` }}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${card.color || '#6366f1'}30` }}
                                            >
                                                <CreditCard className="w-5 h-5" style={{ color: card.color || '#6366f1' }} />
                                            </div>
                                            <div className="flex gap-1.5">
                                                {isPaid ? (
                                                    <span className="flex items-center gap-1 text-[10px] bg-emerald-400/15 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                                                        <CheckCircle className="w-3 h-3" /> Paga
                                                    </span>
                                                ) : (
                                                    <span className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded-md font-bold",
                                                        isClosed
                                                            ? "bg-amber-400/10 text-amber-400"
                                                            : "bg-white/[0.06] text-white/40"
                                                    )}>
                                                        {isClosed ? 'Fechada' : 'Aberta'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
                                            Cartão
                                        </p>
                                        <h3 className="text-lg font-bold text-white/90 mb-1.5">
                                            {card.name}
                                        </h3>

                                        <p className="font-mono text-sm tracking-widest text-white/25">
                                            •••• •••• •••• {card.last_four || '****'}
                                        </p>
                                    </div>

                                    {/* Card Details */}
                                    <div className="p-4 sm:p-5 space-y-4">
                                        {/* Monthly Spending */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[12px] text-white/30">Fatura do mês</span>
                                                <span className="text-base font-bold text-white/80">
                                                    {formatCents(monthlySpent)}
                                                </span>
                                            </div>

                                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                                                <div
                                                    className={`h-full transition-all duration-700 ${progressColor} rounded-full`}
                                                    style={{ width: `${usagePercentage}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center text-[11px]">
                                                <span className="text-white/20">
                                                    {usagePercentage.toFixed(0)}% usado
                                                </span>
                                                <span className="text-white/20">
                                                    Limite: {formatCents(limitCents)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Invoice Actions */}
                                        <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    isPaid ? "bg-emerald-400" : "bg-amber-400"
                                                )} />
                                                <span className="text-[12px] font-medium text-white/40">
                                                    {isPaid ? 'Fatura Paga' : 'Aguardando'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleTogglePaid(card.id, invoiceStatus, monthlySpent)}
                                                className={cn(
                                                    "text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all",
                                                    isPaid
                                                        ? "bg-white/[0.04] text-white/30 hover:bg-white/[0.08]"
                                                        : "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/15"
                                                )}
                                            >
                                                {isPaid ? 'Reabrir' : 'Marcar Paga'}
                                            </button>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2 border-t border-white/[0.04]">
                                            <button
                                                className="flex items-center gap-1.5 text-[12px] text-white/25 hover:text-indigo-400 font-medium transition-colors"
                                                onClick={() => window.location.href = '/configuracoes'}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Editar
                                            </button>
                                            <button
                                                className="flex items-center gap-1.5 text-[12px] text-white/25 hover:text-red-400 font-medium transition-colors"
                                                onClick={(e) => handleDeleteClick(e, card.id, card.name)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AddCardModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Cartão"
                message={`Tem certeza que deseja excluir o cartão "${cardToDelete?.name}"? As transações associadas não serão excluídas, mas ficarão sem cartão.`}
                confirmLabel="Excluir"
                isLoading={isDeleting}
            />
        </div>
    );
}
