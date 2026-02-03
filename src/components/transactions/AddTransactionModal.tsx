'use client';

import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';
import { useCategories } from '@/hooks/useCategories';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { parseCurrencyInput, formatCurrencyInputValue } from '@/lib/utils';
import { Database } from '@/types/database.types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
    const { addTransactionWithInstallments } = useTransactions();
    const { cards } = useCards();
    const { categories, isLoading: isCategoriesLoading } = useCategories();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [installments, setInstallments] = useState('1');
    const [cardId, setCardId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [includeInWeeklyPlan, setIncludeInWeeklyPlan] = useState(true);

    // Set default category when categories load
    useEffect(() => {
        if (categories.length > 0 && !categoryId) {
            setCategoryId(categories[0].id);
        }
    }, [categories, categoryId]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const amountCents = parseCurrencyInput(amount);
            if (amountCents <= 0) {
                alert('O valor deve ser maior que zero.');
                return;
            }

            if (!description.trim()) {
                alert('Informe uma descrição.');
                return;
            }

            if (!categoryId) {
                alert('Selecione uma categoria. Se não houver, crie uma primeiro.');
                return;
            }

            await addTransactionWithInstallments({
                description,
                amount_cents: amountCents,
                category_id: categoryId,
                card_id: cardId || null,
                installments: parseInt(installments) || 1,
                posted_at: date,
                include_in_weekly_plan: includeInWeeklyPlan,
            } as any);

            onClose();
            // Reset form
            setDescription('');
            setAmount('');
            setInstallments('1');
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = error.message || error.error_description || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            alert('Erro ao salvar transação: ' + errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Transação">
            <div className="space-y-4 pt-4">
                <Input
                    label="Valor (R$)"
                    value={amount}
                    onChange={(e) => {
                        const cents = parseCurrencyInput(e.target.value);
                        setAmount(formatCurrencyInputValue(cents));
                    }}
                    placeholder="0,00"
                    className="text-lg font-bold"
                />

                <Input
                    label="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Almoço, Uber, Mercado..."
                />

                <div className="grid grid-cols-2 gap-4">
                    {/* Date Picker */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 ">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                        />
                    </div>

                    <Input
                        label="Parcelas"
                        type="number"
                        min={1}
                        max={24}
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 ">
                        Forma de Pagamento
                    </label>
                    <select
                        value={cardId}
                        onChange={(e) => setCardId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                    >
                        <option value="">💵 Dinheiro / Débito</option>
                        {cards.map(card => (
                            <option key={card.id} value={card.id}>{card.name} (Final {card.last_four})</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 ">Categoria</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={isCategoriesLoading}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                    >
                        {isCategoriesLoading ? (
                            <option>Carregando...</option>
                        ) : (
                            categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                            ))
                        )}
                    </select>
                </div>

                <div className="flex items-center gap-2 py-2">
                    <input
                        id="includeInWeeklyPlan"
                        type="checkbox"
                        checked={includeInWeeklyPlan}
                        onChange={(e) => setIncludeInWeeklyPlan(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="includeInWeeklyPlan" className="text-sm font-medium text-slate-700 cursor-pointer">
                        Incluir no plano de gastos semanal
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Transação'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
