'use client';

import { useState, useMemo } from 'react';
import { useIncome } from '@/hooks/useIncome';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCents, formatDate, cn, parseLocalDate } from '@/lib/utils';
import { AddIncomeModal } from '@/components/income/AddIncomeModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';

const INCOME_TYPE_LABELS: Record<string, string> = {
    'extra': '💰 Extra',
    'reembolso': '↩️ Reembolso',
    'presente': '🎁 Presente',
    'freelance': '💼 Freelance',
    'bonus': '🎯 Bônus',
    'outros': '📦 Outros',
};

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];


export default function EntradasPage() {
    const { incomeEntries, isLoading, deleteIncome } = useIncome();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [incomeToEdit, setIncomeToEdit] = useState<any>(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [incomeToDelete, setIncomeToDelete] = useState<{ id: string, description: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditClick = (e: React.MouseEvent, income: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIncomeToEdit(income);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIncomeToEdit(null);
    };

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
            showToast('Erro ao excluir entrada', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // Group entries by month/year
    const groupedByMonth = useMemo(() => {
        const groups: Record<string, { label: string; total: number; entries: typeof incomeEntries }> = {};

        for (const entry of incomeEntries) {
            const date = parseLocalDate(entry.received_at);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${String(month).padStart(2, '0')}`;

            if (!groups[key]) {
                groups[key] = {
                    label: `${MONTH_NAMES[month]} ${year}`,
                    total: 0,
                    entries: [],
                };
            }
            groups[key].total += entry.amount_cents;
            groups[key].entries.push(entry);
        }

        // Sort keys descending (most recent first)
        return Object.entries(groups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, group]) => ({ key, ...group }));
    }, [incomeEntries]);

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
                            <span className="text-[11px] font-semibold text-emerald-400/60 uppercase tracking-wider">Total Geral</span>
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

                {/* Income List - Grouped by Month */}
                {incomeEntries.length === 0 ? (
                    <Card className="!p-0 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-10 text-center">
                                <div className="text-3xl mb-3 opacity-50">💵</div>
                                <p className="text-white/40 text-sm">Nenhuma entrada registrada ainda.</p>
                                <p className="text-white/20 text-xs mt-1">
                                    Clique em "Nova Entrada" para registrar dinheiro recebido.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {groupedByMonth.map(group => (
                            <Card key={group.key} className="!p-0 overflow-hidden">
                                <CardContent className="p-0">
                                    {/* Month Header */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                                        <span className="text-[13px] font-semibold text-white/70">
                                            📅 {group.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-white/30 font-medium">
                                                {group.entries.length} entrada{group.entries.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className="text-sm font-bold text-emerald-400">
                                                +{formatCents(group.total)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Entries */}
                                    <div className="divide-y divide-white/[0.04]">
                                        {group.entries.map(entry => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.12] flex items-center justify-center text-lg shrink-0">
                                                        {INCOME_TYPE_LABELS[entry.type]?.split(' ')[0] || '💵'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-white/80 text-sm truncate">
                                                            {entry.description}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] text-white/25 mt-0.5">
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
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/15 hover:text-white hover:bg-white/10 transition-all"
                                                            onClick={(e) => handleEditClick(e, entry)}
                                                            title="Editar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/15 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
                                                            onClick={(e) => handleDeleteClick(e, entry.id, entry.description)}
                                                            title="Excluir"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <AddIncomeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    incomeToEdit={incomeToEdit} // Pass the income to edit
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
