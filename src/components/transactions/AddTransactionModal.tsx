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

    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash'>('credit');

    // Set default category and reset payment method when opening/closing
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

            if (paymentMethod === 'credit' && !cardId) {
                alert('Selecione um cartão de crédito.');
                return;
            }

            await addTransactionWithInstallments({
                description,
                amount_cents: amountCents,
                category_id: categoryId,
                card_id: paymentMethod === 'credit' ? cardId : null,
                installments: paymentMethod === 'credit' ? (parseInt(installments) || 1) : 1,
                posted_at: date,
                include_in_weekly_plan: includeInWeeklyPlan,
                payment_method: paymentMethod,
            } as any);

            onClose();
            // Reset form
            setDescription('');
            setAmount('');
            setInstallments('1');
            setPaymentMethod('credit');
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

                {/* Date Picker */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300 ">Data</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-white/20 bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300 ">
                        Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('credit')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${paymentMethod === 'credit'
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                : 'bg-[#0f172a] border-white/10 text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            💳 Crédito
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('debit')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${paymentMethod === 'debit'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-[#0f172a] border-white/10 text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            💸 Débito
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('pix')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${paymentMethod === 'pix'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-[#0f172a] border-white/10 text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            💠 PIX
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${paymentMethod === 'cash'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-[#0f172a] border-white/10 text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            💵 Dinheiro
                        </button>
                    </div>
                </div>

                {paymentMethod === 'credit' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300 ">Cartão</label>
                            <select
                                value={cardId}
                                onChange={(e) => setCardId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-white/20 bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                            >
                                <option value="" className="bg-[#001242] text-white">Selecione...</option>
                                {cards.map(card => (
                                    <option key={card.id} value={card.id} className="bg-[#001242] text-white">{card.name}</option>
                                ))}
                            </select>
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
                )}

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300 ">Categoria</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={isCategoriesLoading}
                        className="flex h-10 w-full rounded-md border border-white/20 bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                    >
                        {isCategoriesLoading ? (
                            <option className="bg-[#001242] text-white">Carregando...</option>
                        ) : (
                            categories.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-[#001242] text-white">{cat.icon} {cat.name}</option>
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
                    <label htmlFor="includeInWeeklyPlan" className="text-sm font-medium text-slate-300 cursor-pointer">
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
