'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCents, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useMonthFilter } from '@/contexts/MonthFilterContext';
import { parseLocalDate } from '@/lib/utils';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { useInvoices } from '@/hooks/useInvoices';
import { getBillingMonth } from '@/lib/calculations';

export default function GastosPage() {
    const { transactions, isLoading: isTxLoading, deleteTransaction } = useTransactions();
    const { selectedDate } = useMonthFilter();
    const { cards } = useCards();
    const { invoices } = useInvoices();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [txToDelete, setTxToDelete] = useState<{ id: string, description: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, id: string, description: string) => {
        e.preventDefault();
        e.stopPropagation();
        setTxToDelete({ id, description });
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!txToDelete) return;

        setIsDeleting(true);
        try {
            await deleteTransaction(txToDelete.id);
            setDeleteConfirmOpen(false);
            setTxToDelete(null);
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir transação.');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const txDate = parseLocalDate(tx.posted_at);
        return txDate.getMonth() === selectedDate.getMonth() &&
            txDate.getFullYear() === selectedDate.getFullYear();
    });

    if (isTxLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <span className="text-sm text-white/30">Carregando transações...</span>
                </div>
            </div>
        );
    }

    const isTransactionPaid = (tx: any) => {
        if (!tx.card_id) return false;

        const date = parseLocalDate(tx.posted_at);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const invoice = invoices.find(inv =>
            inv.card_id === tx.card_id &&
            inv.month === month &&
            inv.year === year
        );

        return invoice?.status === 'PAID';
    };

    return (
        <div className="min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Transações</h1>
                        <MonthSelector />
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto shrink-0"
                    >
                        + Nova Transação
                    </Button>
                </div>

                <Card className="!p-0 overflow-hidden">
                    <CardContent className="p-0">
                        {filteredTransactions.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="text-3xl mb-3 opacity-50">📦</div>
                                <p className="text-white/40 text-sm">Nenhum gasto registrado neste mês.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {filteredTransactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-lg shrink-0">
                                                {tx.category?.icon || '📦'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-white/80 text-sm truncate">{tx.description}</div>
                                                <div className="flex items-center gap-2 text-[11px] text-white/25 mt-0.5">
                                                    <span>{formatDate(tx.posted_at)}</span>
                                                    <span className="text-white/10">·</span>
                                                    <span>{tx.card?.name || 'Dinheiro'}</span>
                                                    {isTransactionPaid(tx) && (
                                                        <span className="bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                            PAGO
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="text-right">
                                                <div className="font-semibold text-white/80 text-sm">{formatCents(tx.amount_cents)}</div>
                                                {tx.installments > 1 && (
                                                    <div className="text-[10px] text-indigo-400/60 font-medium">
                                                        {tx.installment_number}/{tx.installments}x
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/15 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
                                                onClick={(e) => handleDeleteClick(e, tx.id, tx.description)}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <AddTransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />

                <ConfirmModal
                    isOpen={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Transação"
                    message={`Tem certeza que deseja excluir a transação "${txToDelete?.description}"?`}
                    confirmLabel="Excluir"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
}
