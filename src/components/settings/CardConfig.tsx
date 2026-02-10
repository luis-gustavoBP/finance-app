'use client';

import { useState } from 'react';
import { useCards } from '@/hooks/useCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { calculateClosingDate } from '@/lib/invoiceLogic';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatCents, parseCurrencyInput, formatCurrencyInputValue } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

export function CardConfig() {
    const { cards, updateCardConfig, deleteCard, isLoading } = useCards();
    const { showToast } = useToast();
    const [editingCard, setEditingCard] = useState<string | null>(null);
    const [dueDay, setDueDay] = useState<number>(10);
    const [closingDaysBefore, setClosingDaysBefore] = useState<number>(10);
    const [limit, setLimit] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Confirm delete state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (cardId: string, currentDueDay: number, currentClosingDays: number, currentLimit: number) => {
        setEditingCard(cardId);
        setDueDay(currentDueDay || 10);
        setClosingDaysBefore(currentClosingDays || 10);
        setLimit(formatCurrencyInputValue(currentLimit || 0));
    };

    const handleSave = async (cardId: string) => {
        try {
            const limitCents = parseCurrencyInput(limit);
            await updateCardConfig(cardId, {
                due_day: dueDay,
                closing_days_before: closingDaysBefore,
                limit_cents: limitCents
            });
            setEditingCard(null);
            showToast('Configuração do cartão salva!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar configuração', 'error');
        }
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
            showToast('Cartão excluído!', 'success');
            setDeleteConfirmOpen(false);
            setCardToDelete(null);
        } catch (error: any) {
            console.error(error);
            showToast(error.message || 'Erro ao excluir cartão', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const getClosingDayDisplay = (dueDay: number, closingDaysBefore: number): string => {
        const closingDate = calculateClosingDate(dueDay, closingDaysBefore);
        return closingDate.getDate().toString();
    };

    if (isLoading) {
        return <div className="animate-pulse">Carregando cartões...</div>;
    }

    return (
        <>
            <Card className="bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>💳 Configuração dos Cartões</CardTitle>
                        <Button
                            size="sm"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            + Adicionar Cartão
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300">
                        Configure a data de vencimento, fechamento e o limite de crédito de cada cartão.
                    </p>

                    {cards.length === 0 ? (
                        <div className="text-center py-8 text-slate-300">
                            <p>Nenhum cartão cadastrado ainda.</p>
                            <p className="text-sm mt-2">Clique em "Adicionar Cartão" para começar.</p>
                        </div>
                    ) : (
                        cards.map(card => {
                            const isEditing = editingCard === card.id;
                            const currentDueDay = isEditing ? dueDay : (card.due_day || 10);
                            const currentClosingDays = isEditing ? closingDaysBefore : (card.closing_days_before || 10);
                            const currentLimitCents = isEditing ? parseCurrencyInput(limit) : (card.limit_cents || 0);
                            const closingDay = getClosingDayDisplay(currentDueDay, currentClosingDays);

                            return (
                                <div
                                    key={card.id}
                                    className="p-4 border border-white/10 rounded-lg space-y-3 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {card.name}
                                            </h3>
                                            <p className="text-xs text-slate-300">
                                                Final {card.last_four} • Limite: {formatCents(card.limit_cents || 0)}
                                            </p>
                                        </div>
                                        {!isEditing && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(card.id, card.due_day || 10, card.closing_days_before || 10, card.limit_cents || 0)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400 hover:bg-red-500/10 px-2"
                                                    onClick={(e) => handleDeleteClick(e, card.id, card.name)}
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <Input
                                                    label="Limite do Cartão (R$)"
                                                    value={limit}
                                                    onChange={(e) => {
                                                        const cents = parseCurrencyInput(e.target.value);
                                                        setLimit(formatCurrencyInputValue(cents));
                                                    }}
                                                    placeholder="0,00"
                                                />
                                                <Input
                                                    label="Dia do Vencimento"
                                                    type="number"
                                                    min={1}
                                                    max={31}
                                                    value={dueDay}
                                                    onChange={(e) => setDueDay(parseInt(e.target.value) || 10)}
                                                />
                                                <Input
                                                    label="Fecha (dias antes)"
                                                    type="number"
                                                    min={1}
                                                    max={30}
                                                    value={closingDaysBefore}
                                                    onChange={(e) => setClosingDaysBefore(parseInt(e.target.value) || 10)}
                                                />
                                            </div>

                                            <div className="bg-indigo-500/20 border border-indigo-500/20 p-3 rounded-md text-sm">
                                                <p className="text-indigo-300">
                                                    📅 <strong>Resumo:</strong> Fecha dia <strong>{closingDay}</strong>, vence dia <strong>{dueDay}</strong>
                                                </p>
                                                <p className="text-xs text-indigo-400 mt-1">
                                                    Compras a partir do dia {closingDay} vão para a próxima fatura.
                                                </p>
                                            </div>

                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingCard(null)}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleSave(card.id)}
                                                >
                                                    Salvar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-300 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <p>Vencimento: Dia <strong>{currentDueDay}</strong></p>
                                            <p>Fechamento: Dia <strong>{closingDay}</strong> (com {currentClosingDays} dias de antecedência)</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

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
        </>
    );
}
