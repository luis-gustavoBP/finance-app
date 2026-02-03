'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCents, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { ExportButton } from '@/components/export/ExportButton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function GastosPage() {
    const { transactions, isLoading: isTxLoading, deleteTransaction } = useTransactions();
    const { cards } = useCards();
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

    if (isTxLoading) {
        return <div className="p-8 text-center animate-pulse">Carregando transações...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Minhas Transações</h1>
                <div className="flex items-center gap-2">
                    <ExportButton />
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>+ Nova Transação</Button>
                </div>
            </div>

            <Card className="bg-white">
                <CardContent className="p-0">
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">Nenhum gasto registrado ainda.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                                            {tx.category?.icon || '📦'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800 dark:text-white">{tx.description}</div>
                                            <div className="text-xs text-slate-500">
                                                {formatDate(tx.posted_at)} • {tx.card?.name || 'Dinheiro'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold text-slate-800 dark:text-white">{formatCents(tx.amount_cents)}</div>
                                            {tx.installments > 1 && (
                                                <div className="text-[10px] text-indigo-500 font-semibold">
                                                    {tx.installment_number}/{tx.installments}x
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2"
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
    );
}
