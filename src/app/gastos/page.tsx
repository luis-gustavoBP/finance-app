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

    // Confirm delete state
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
        return <div className="p-8 text-center animate-pulse">Carregando transações...</div>;
    }

    const isTransactionPaid = (tx: any) => {
        if (!tx.card_id) return false;

        // Follows the logic: Jan Invoice Paid -> Jan Items Paid.
        // We look for an invoice that matches the transaction month/year directly.
        const date = parseLocalDate(tx.posted_at);
        const month = date.getMonth() + 1; // 0-indexed to 1-indexed
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">Minhas Transações</h1>
                        <MonthSelector />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>+ Nova Transação</Button>
                    </div>
                </div>

                <Card className="glass-panel text-white p-0">
                    <CardContent className="p-0">
                        {filteredTransactions.length === 0 ? (
                            <div className="p-12 text-center text-slate-200">Nenhum gasto registrado neste mês.</div>
                        ) : (
                            <div className="divide-y divide-white/10">
                                {filteredTransactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                                                {tx.category?.icon || '📦'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{tx.description}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-200">
                                                    <span>{formatDate(tx.posted_at)} • {tx.card?.name || 'Dinheiro'}</span>
                                                    {isTransactionPaid(tx) && (
                                                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-green-200">
                                                            PAGO
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-bold text-white">{formatCents(tx.amount_cents)}</div>
                                                {tx.installments > 1 && (
                                                    <div className="text-[10px] text-indigo-300 font-semibold">
                                                        {tx.installment_number}/{tx.installments}x
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:bg-red-500/10 px-2"
                                                onClick={(e) => handleDeleteClick(e, tx.id, tx.description)}
                                            >
                                                🗑️
                                            </Button>
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
