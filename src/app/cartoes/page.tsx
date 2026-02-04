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
import { formatCents, parseLocalDate } from '@/lib/utils';
import { CreditCard, Calendar, Pencil, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function CartoesPage() {
    const { cards, deleteCard, isLoading } = useCards();
    const { transactions } = useTransactions();
    const { invoices, updateInvoiceStatus } = useInvoices();
    const { selectedDate } = useMonthFilter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Calculate monthly spending per card based on selected date
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
            inv.month === currentMonth + 1 && // Invoice table uses 1-12
            inv.year === currentYear
        );
        return invoice?.status || 'OPEN';
    };

    const handleTogglePaid = async (cardId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'PAID' ? 'OPEN' : 'PAID';
        await updateInvoiceStatus(cardId, currentMonth + 1, currentYear, newStatus);
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
            alert(error.message || 'Erro ao excluir cartão');
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
        return <div className="p-8 text-center animate-pulse">Carregando cartões...</div>;
    }

    return (
        <div className="min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Cartões de Crédito
                        </h1>
                        <p className="text-slate-200 mt-1">
                            Gerencie seus cartões e limites
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <MonthSelector />
                        <Button
                            variant="primary"
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            + Novo Cartão
                        </Button>
                    </div>
                </div>

                {/* Cards Grid */}
                {cards.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center border border-white/10">
                        <div className="text-5xl mb-4">💳</div>
                        <p className="text-slate-200 text-lg">Nenhum cartão cadastrado ainda.</p>
                        <p className="text-slate-400 text-sm mt-2">
                            Clique em "Novo Cartão" para adicionar seu primeiro cartão.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map(card => {
                            const monthlySpent = getMonthlySpentByCard(card.id);
                            const limitCents = card.limit_cents || 0;
                            const availableLimit = limitCents - monthlySpent;
                            const usagePercentage = limitCents > 0
                                ? Math.min((monthlySpent / limitCents) * 100, 100)
                                : 0;
                            const closingDay = getClosingDay(card.due_day || 10, card.closing_days_before || 10);

                            const invoiceStatus = getInvoiceStatus(card.id);
                            const isPaid = invoiceStatus === 'PAID';
                            const isClosed = invoiceStatus === 'CLOSED';

                            // Progress bar color based on usage
                            let progressColor = 'bg-blue-500';
                            if (usagePercentage > 90) progressColor = 'bg-red-500';
                            else if (usagePercentage > 70) progressColor = 'bg-orange-500';

                            return (
                                <div
                                    key={card.id}
                                    className="glass-panel rounded-2xl overflow-hidden hover:bg-white/5 transition-all"
                                >
                                    {/* Card Header with Color */}
                                    <div
                                        className="p-5 text-white relative"
                                        style={{ backgroundColor: card.color || '#8b5cf6' }}
                                    >
                                        {/* Card Icon and Status Badge */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <div className="flex gap-2">
                                                {isPaid ? (
                                                    <span className="flex items-center gap-1 text-xs bg-green-500/90 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                                                        <CheckCircle className="w-3 h-3" /> Paga
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
                                                        {isClosed ? 'Fechada' : 'Em Aberto'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Name */}
                                        <p className="text-white/80 text-xs uppercase tracking-wider mb-1">
                                            Nome do Cartão
                                        </p>
                                        <h3 className="text-2xl font-bold mb-3">
                                            {card.name}
                                        </h3>

                                        {/* Card Number */}
                                        <p className="font-mono text-lg tracking-widest opacity-90">
                                            •••• •••• •••• {card.last_four || '****'}
                                        </p>
                                    </div>

                                    {/* Card Details */}
                                    <div className="p-5 space-y-4">
                                        {/* Monthly Spending */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-slate-200">Fatura de {selectedDate.toLocaleString('default', { month: 'long' })}</span>
                                                <span className="text-xl font-bold text-white">
                                                    {formatCents(monthlySpent)}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className={`h-full transition-all duration-500 ${progressColor}`}
                                                    style={{ width: `${usagePercentage}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400">
                                                    {usagePercentage.toFixed(1)}% utilizado
                                                </span>
                                                <span className="text-slate-400">
                                                    Limite: {formatCents(limitCents)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Invoice Actions */}
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                <span className="text-sm font-medium text-slate-200">
                                                    {isPaid ? 'Fatura Paga' : 'Aguardando Pagamento'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleTogglePaid(card.id, invoiceStatus)}
                                                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${isPaid
                                                    ? 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30'
                                                    }`}
                                            >
                                                {isPaid ? 'Reabrir' : 'Marcar Paga'}
                                            </button>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-4 pt-2 border-t border-white/10">
                                            <button
                                                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                                onClick={() => window.location.href = '/configuracoes'}
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Editar
                                            </button>
                                            <button
                                                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                                                onClick={(e) => handleDeleteClick(e, card.id, card.name)}
                                            >
                                                <Trash2 className="w-4 h-4" />
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
