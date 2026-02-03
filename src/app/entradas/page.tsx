'use client';

import { useState } from 'react';
import { useIncome } from '@/hooks/useIncome';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCents, incomeTypes, formatDate } from '@/lib/utils';
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

    // Confirm delete state
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
        return <div className="p-8 text-center animate-pulse">Carregando entradas...</div>;
    }

    const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount_cents, 0);

    // Calculate statistics by type
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 -m-8 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 ">
                            💵 Entradas de Dinheiro
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Registre dinheiro extra recebido (não regular)
                        </p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                        + Nova Entrada
                    </Button>
                </div>

                {/* Summary Card */}
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">💵</span>
                            <span className="text-green-100 text-sm font-medium">Entradas no Mês</span>
                        </div>
                        <h2 className="text-5xl font-bold mb-2">{formatCents(totalIncome)}</h2>
                        <p className="text-sm text-green-100 opacity-90">
                            {incomeEntries.length} registro{incomeEntries.length !== 1 ? 's' : ''} registrado{incomeEntries.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                {/* Statistics by Type */}
                {Object.keys(statsByType).length > 0 && (
                    <Card className="bg-white">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-slate-700 mb-4">📊 Por Tipo de Entrada</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(statsByType).map(([type, stats]) => (
                                    <div
                                        key={type}
                                        className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-700">
                                                {INCOME_TYPE_LABELS[type] || '📦 Outros'}
                                            </span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                                {stats.count}x
                                            </span>
                                        </div>
                                        <div className="text-xl font-bold text-green-600">
                                            {formatCents(stats.total)}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {((stats.total / totalIncome) * 100).toFixed(1)}% do total
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Income List */}
                <Card className="bg-white">
                    <CardContent className="p-0">
                        {incomeEntries.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="text-4xl mb-4">💵</div>
                                <p>Nenhuma entrada registrada ainda.</p>
                                <p className="text-sm mt-2">
                                    Clique em "Nova Entrada" para registrar dinheiro recebido.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 ">
                                {incomeEntries.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-4 hover:bg-green-50/50 transition-colors border-l-4 border-transparent hover:border-green-500"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl shadow-sm">
                                                {INCOME_TYPE_LABELS[entry.type]?.split(' ')[0] || '💵'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-800 ">
                                                    {entry.description}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        📅 {formatDate(entry.received_at)}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                        {INCOME_TYPE_LABELS[entry.type]}
                                                    </span>
                                                </div>
                                                {entry.notes && (
                                                    <div className="text-xs text-slate-400 mt-1 italic">
                                                        📝 {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div className="font-bold text-xl text-green-600 ">
                                                +{formatCents(entry.amount_cents)}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50 "
                                                onClick={(e) => handleDeleteClick(e, entry.id, entry.description)}
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
