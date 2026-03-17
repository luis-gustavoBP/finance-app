'use client';

import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';
import { useCategories } from '@/hooks/useCategories';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { parseCurrencyInput, formatCurrencyInputValue } from '@/lib/utils';
import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionToEdit?: Transaction | null;
}

export function AddTransactionModal({ isOpen, onClose, transactionToEdit }: AddTransactionModalProps) {
    const { addTransactionWithInstallments, updateTransaction } = useTransactions();
    const { showToast } = useToast();
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

    useEffect(() => {
        if (transactionToEdit && isOpen) {
            setDescription(transactionToEdit.description);
            setAmount(formatCurrencyInputValue(transactionToEdit.amount_cents));
            setInstallments(String(transactionToEdit.installments));
            setCardId(transactionToEdit.card_id || '');
            setDate(transactionToEdit.posted_at.split('T')[0]);
            setCategoryId(transactionToEdit.category_id || '');
            setIncludeInWeeklyPlan(transactionToEdit.include_in_weekly_plan);
            setPaymentMethod(transactionToEdit.payment_method as any);
        } else if (isOpen) {
            setDescription('');
            setAmount('');
            setInstallments('1');
            setPaymentMethod('credit');
            setDate(new Date().toISOString().split('T')[0]);
            setIncludeInWeeklyPlan(true);
            if (categories.length > 0) setCategoryId(categories[0].id);
        }
    }, [transactionToEdit, isOpen, categories]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const amountCents = parseCurrencyInput(amount);
            if (amountCents <= 0) {
                showToast('O valor deve ser maior que zero.', 'error');
                return;
            }

            if (!description.trim()) {
                showToast('Informe uma descrição.', 'error');
                return;
            }

            if (!categoryId) {
                showToast('Selecione uma categoria.', 'error');
                return;
            }

            const txData = {
                description: description.trim(),
                amount_cents: amountCents,
                category_id: categoryId,
                card_id: paymentMethod === 'credit' ? cardId : null,
                posted_at: date,
                include_in_weekly_plan: includeInWeeklyPlan,
                payment_method: paymentMethod,
            };

            if (transactionToEdit) {
                await updateTransaction(transactionToEdit.id, txData);
                showToast('Transação atualizada com sucesso!', 'success');
            } else {
                await addTransactionWithInstallments({
                    ...txData,
                    installments: paymentMethod === 'credit' ? (parseInt(installments) || 1) : 1,
                } as any);
                showToast('Transação salva com sucesso!', 'success');
            }

            onClose();
        } catch (error: any) {
            console.error('Submit error:', error);
            showToast('Erro ao salvar transação: ' + (error.message || 'Erro desconhecido'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? "Editar Transação" : "Nova Transação"}>
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

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300 ">Data</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-white/20 bg-[#0f172a] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300 ">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['credit', 'debit', 'pix', 'cash'].map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method as any)}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${paymentMethod === method
                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                    : 'bg-[#0f172a] border-white/10 text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                {method === 'credit' ? '💳 Crédito' : method === 'debit' ? '💸 Débito' : method === 'pix' ? '💠 PIX' : '💵 Dinheiro'}
                            </button>
                        ))}
                    </div>
                </div>

                {paymentMethod === 'credit' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300 ">Cartão</label>
                            <select
                                value={cardId}
                                onChange={(e) => setCardId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-white/20 bg-[#0f172a] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <option value="" className="bg-[#001242] text-white">Selecione...</option>
                                {cards.map(card => (
                                    <option key={card.id} value={card.id} className="bg-[#001242] text-white">{card.name}</option>
                                ))}
                            </select>
                        </div>
                        {!transactionToEdit && (
                            <Input
                                label="Parcelas"
                                type="number"
                                min={1}
                                max={24}
                                value={installments}
                                onChange={(e) => setInstallments(e.target.value)}
                            />
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300 ">Categoria</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={isCategoriesLoading}
                        className="flex h-10 w-full rounded-md border border-white/20 bg-[#0f172a] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-[#001242] text-white">{cat.icon} {cat.name}</option>
                        ))}
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
