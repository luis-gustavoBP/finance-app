'use client';

import { useState } from 'react';
import { useIncome } from '@/hooks/useIncome';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { parseCurrencyInput, formatCurrencyInputValue } from '@/lib/utils';

interface AddIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const INCOME_TYPES = [
    { value: 'extra', label: '💰 Extra', description: 'Dinheiro inesperado' },
    { value: 'reembolso', label: '↩️ Reembolso', description: 'Devolução de gasto' },
    { value: 'presente', label: '🎁 Presente', description: 'Presente em dinheiro' },
    { value: 'freelance', label: '💼 Freelance', description: 'Trabalho extra' },
    { value: 'bonus', label: '🎯 Bônus', description: 'Bonificação' },
    { value: 'outros', label: '📦 Outros', description: 'Outro tipo' },
] as const;

export function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
    const { addIncome } = useIncome();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<typeof INCOME_TYPES[number]['value']>('extra');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [destination, setDestination] = useState<'budget' | 'savings'>('budget');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            await addIncome({
                description,
                amount_cents: amountCents,
                type,
                destination,
                received_at: date,
                notes: notes.trim() || null,
            });

            // Reset form
            setDescription('');
            setAmount('');
            setType('extra');
            setDestination('budget');
            setDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            onClose();
        } catch (error: any) {
            console.error(error);
            const message = error?.message || 'Erro desconhecido';
            alert(`Erro ao salvar entrada: ${message}`);

            // Check for common schema errors
            if (message.includes('destination') || message.includes('column')) {
                alert('Dica: Verifique se a migração V6 (schema enhancements) foi aplicada no Supabase.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="💵 Nova Entrada de Dinheiro">
            <div className="space-y-4 pt-4">
                <Input
                    label="Valor Recebido (R$)"
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
                    placeholder="Ex: Venda do teclado, Pix recebido..."
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300 ">
                        Data de Recebimento
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-white/20 bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ">
                        Tipo de Entrada
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {INCOME_TYPES.map((incomeType) => (
                            <button
                                key={incomeType.value}
                                type="button"
                                onClick={() => setType(incomeType.value)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${type === incomeType.value
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-white/10 hover:border-white/30 text-slate-300'
                                    } `}
                            >
                                <div className="font-medium text-sm text-white">{incomeType.label}</div>
                                <div className="text-xs text-slate-400 ">
                                    {incomeType.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300 ">
                        Observações (opcional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Informações adicionais..."
                        rows={2}
                        className="flex w-full rounded-md border border-white/20 bg-[#0f172a] px-3 py-2 text-sm text-white ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        Destino
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setDestination('budget')}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${destination === 'budget'
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-white/10 hover:border-white/30 text-slate-300'
                                }`}
                        >
                            <div className="font-medium text-sm text-white">Orçamento do Mês</div>
                            <div className="text-xs text-slate-400">Soma ao saldo disponível</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDestination('savings')}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${destination === 'savings'
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-white/10 hover:border-white/30 text-slate-300'
                                }`}
                        >
                            <div className="font-medium text-sm text-white">Cofrinho / Reserva</div>
                            <div className="text-xs text-slate-400">Separado do orçamento</div>
                        </button>
                    </div>
                </div>

                <div className="bg-white/5 p-3 rounded-md text-sm text-slate-300 border border-white/10">
                    {destination === 'budget'
                        ? '💡 Esta entrada aumentará seu poder de compra neste mês.'
                        : '🐷 Esta entrada será guardada e não afetará seu limite de gastos mensal.'
                    }
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Entrada'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
