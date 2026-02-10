'use client';

import { useState } from 'react';
import { useIncome } from '@/hooks/useIncome';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCents, incomeTypes, formatDate, cn } from '@/lib/utils';
import { AddIncomeModal } from '@/components/income/AddIncomeModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const INCOME_TYPE_LABELS: Record<string, string> = {
    'extra': '💰 Extra',
    'reembolso': '↩️ Reembolso',
    'presente': '🎁 Presente',
    'freelance': '💼 Freelance',
    'bonus': '🎯 Bônus',
    'outros': '📦 Outros',
};

export default function EntradasPage() {
    const { incomeEntries, isLoading, deleteIncome } = useIncome();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [incomeToDelete, setIncomeToDelete] = useState<{ id: string, description: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, id: string, description: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIncomeToDelete({ id, description });
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!incomeToDelete) return;

        setIsDeleting(true);
        try {
            await deleteIncome(incomeToDelete.id);
            setDeleteConfirmOpen(false);
            setIncomeToDelete(null);
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir entrada');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    <span className="text-sm text-white/30">Carregando entradas...</span>
                </div>
            </div>
        );
    }

    const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount_cents, 0);

    const statsByType = incomeEntries.reduce((acc, entry) => {
        const type = entry.type || 'outros';
        if (!acc[type]) {
            acc[type] = { count: 0, total: 0 };
        }
        acc[type].count++;
        acc[type].total += entry.amount_cents;
        return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return (
        <div className="min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                            Entradas de Dinheiro
                        </h1>
                        <p className="text-sm text-white/30 mt-0.5">
                            Registre dinheiro extra recebido
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto shrink-0"
                    >
                        + Nova Entrada
                    </Button>
                </div>

                {/* Summary Card */}
                <Card className="!bg-gradient-to-br from-emerald-500/[0.08] to-transparent !border-emerald-500/[0.12]">
                    <CardContent className="pt-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">💵</span>
                            <span className="text-[11px] font-semibold text-emerald-400/60 uppercase tracking-wider">Entradas no Mês</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">{formatCents(totalIncome)}</h2>
                        <p className="text-[12px] text-white/25">
                            {incomeEntries.length} registro{incomeEntries.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                {/* Statistics by Type */}
                {Object.keys(statsByType).length > 0 && (
                    <Card>
                        <CardContent>
                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Por Tipo de Entrada</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(statsByType).map(([type, stats]) => (
                                    <div
                                        key={type}
                                        className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.08]"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[13px] font-medium text-white/60">
                                                {INCOME_TYPE_LABELS[type] || '📦 Outros'}
                                            </span>
                                            <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                                                {stats.count}x
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-emerald-400">
                                            {formatCents(stats.total)}
                                        </div>
                                        <div className="text-[11px] text-white/20 mt-0.5">
                                            {((stats.total / totalIncome) * 100).toFixed(1)}% do total
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Income List */}
                <Card className="!p-0 overflow-hidden">
                    <CardContent className="p-0">
                        {incomeEntries.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="text-3xl mb-3 opacity-50">💵</div>
                                <p className="text-white/40 text-sm">Nenhuma entrada registrada ainda.</p>
                                <p className="text-white/20 text-xs mt-1">
                                    Clique em "Nova Entrada" para registrar dinheiro recebido.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {incomeEntries.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.12] flex items-center justify-center text-lg shrink-0">
                                                {INCOME_TYPE_LABELS[entry.type]?.split(' ')[0] || '💵'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-white/80 text-sm truncate">
                                                    {entry.description}
                                                </div>
                                                <div className="text-[11px] text-white/25 flex items-center gap-2 mt-0.5">
                                                    <span>{formatDate(entry.received_at)}</span>
                                                    <span className="text-white/10">·</span>
                                                    <span className="text-emerald-400/50">{INCOME_TYPE_LABELS[entry.type]}</span>
                                                </div>
                                                {entry.notes && (
                                                    <div className="text-[11px] text-white/20 mt-0.5 italic truncate">
                                                        {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-2 shrink-0">
                                            <div className="font-semibold text-base text-emerald-400">
                                                +{formatCents(entry.amount_cents)}
                                            </div>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/15 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
                                                onClick={(e) => handleDeleteClick(e, entry.id, entry.description)}
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

                <AddIncomeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />

                <ConfirmModal
                    isOpen={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Entrada"
                    message={`Tem certeza que deseja excluir a entrada "${incomeToDelete?.description}"?`}
                    confirmLabel="Excluir"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
}
