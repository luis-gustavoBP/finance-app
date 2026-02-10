'use client';

import { useState } from 'react';
import { useIncome } from '@/hooks/useIncome';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { parseCurrencyInput, formatCurrencyInputValue, cn } from '@/lib/utils';

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
    const { showToast } = useToast();
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
                showToast('O valor deve ser maior que zero.', 'error');
                return;
            }

            if (!description.trim()) {
                showToast('Informe uma descrição.', 'error');
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
            showToast('Entrada salva com sucesso!', 'success');
            onClose();
        } catch (error: any) {
            console.error(error);
            const message = error?.message || 'Erro desconhecido';
            showToast(`Erro ao salvar entrada: ${message}`, 'error');

            if (message.includes('destination') || message.includes('column')) {
                showToast('Dica: Verifique se a migração V6 foi aplicada no Supabase.', 'info');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Entrada de Dinheiro">
            <div className="space-y-5">
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
                    <label className="text-[13px] font-medium text-white/50 uppercase tracking-wide">
                        Data de Recebimento
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/40 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-medium text-white/50 uppercase tracking-wide">
                        Tipo de Entrada
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {INCOME_TYPES.map((incomeType) => (
                            <button
                                key={incomeType.value}
                                type="button"
                                onClick={() => setType(incomeType.value)}
                                className={cn(
                                    'p-3 rounded-xl border transition-all text-left',
                                    type === incomeType.value
                                        ? 'border-emerald-400/40 bg-emerald-500/[0.08]'
                                        : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                                )}
                            >
                                <div className="font-medium text-[13px] text-white/80">{incomeType.label}</div>
                                <div className="text-[11px] text-white/30">{incomeType.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-white/50 uppercase tracking-wide">
                        Observações (opcional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Informações adicionais..."
                        rows={2}
                        className="flex w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/40 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-medium text-white/50 uppercase tracking-wide">
                        Destino
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setDestination('budget')}
                            className={cn(
                                'p-3 rounded-xl border transition-all text-left',
                                destination === 'budget'
                                    ? 'border-indigo-400/40 bg-indigo-500/[0.08]'
                                    : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                            )}
                        >
                            <div className="font-medium text-[13px] text-white/80">Orçamento do Mês</div>
                            <div className="text-[11px] text-white/30">Soma ao saldo disponível</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDestination('savings')}
                            className={cn(
                                'p-3 rounded-xl border transition-all text-left',
                                destination === 'savings'
                                    ? 'border-amber-400/40 bg-amber-500/[0.08]'
                                    : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                            )}
                        >
                            <div className="font-medium text-[13px] text-white/80">Cofrinho / Reserva</div>
                            <div className="text-[11px] text-white/30">Separado do orçamento</div>
                        </button>
                    </div>
                </div>

                <div className="bg-white/[0.03] p-3 rounded-xl text-[13px] text-white/40 border border-white/[0.04]">
                    {destination === 'budget'
                        ? '💡 Esta entrada aumentará seu poder de compra neste mês.'
                        : '🐷 Esta entrada será guardada e não afetará seu limite de gastos mensal.'
                    }
                </div>

                <div className="flex gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? 'Salvando...' : 'Salvar Entrada'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
