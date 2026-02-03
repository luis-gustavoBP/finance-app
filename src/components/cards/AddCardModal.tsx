'use client';

import { useState } from 'react';
import { useCards } from '@/hooks/useCards';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CARD_COLORS = [
    { name: 'Roxo', value: '#8b5cf6' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Verde', value: '#10b981' },
    { name: 'Laranja', value: '#f97316' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Preto', value: '#000000' },
];

export function AddCardModal({ isOpen, onClose }: AddCardModalProps) {
    const { addCard } = useCards();

    const [name, setName] = useState('');
    const [lastFour, setLastFour] = useState('');
    const [color, setColor] = useState('#8b5cf6');
    const [limitCents, setLimitCents] = useState('');
    const [dueDay, setDueDay] = useState('10');
    const [closingDaysBefore, setClosingDaysBefore] = useState('10');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('Preencha o nome do cartão');
            return;
        }

        if (lastFour && lastFour.length !== 4) {
            alert('Últimos 4 dígitos devem ter exatamente 4 números');
            return;
        }

        const dueDayNum = parseInt(dueDay);
        const closingDaysNum = parseInt(closingDaysBefore);

        if (dueDayNum < 1 || dueDayNum > 31) {
            alert('Dia de vencimento deve estar entre 1 e 31');
            return;
        }

        if (closingDaysNum < 1 || closingDaysNum > 30) {
            alert('Dias antes do vencimento deve estar entre 1 e 30');
            return;
        }

        try {
            setIsSubmitting(true);

            // Parse limit (convert from formatted string to cents)
            const limitValue = limitCents ?
                parseInt(limitCents.replace(/\D/g, '')) : 0;

            await addCard({
                name: name.trim(),
                last_four: lastFour || null,
                color,
                limit_cents: limitValue,
                due_day: dueDayNum,
                closing_days_before: closingDaysNum,
                is_active: true,
            });

            // Reset form
            setName('');
            setLastFour('');
            setColor('#8b5cf6');
            setLimitCents('');
            setDueDay('10');
            setClosingDaysBefore('10');

            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao adicionar cartão');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (!numbers) return '';
        const cents = parseInt(numbers);
        return (cents / 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="💳 Novo Cartão">
            <div className="space-y-4 pt-4">
                {/* Nome do Cartão */}
                <Input
                    label="Nome do Cartão *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nubank, Inter, C6"
                    maxLength={50}
                />

                {/* Últimos 4 Dígitos */}
                <Input
                    label="Últimos 4 Dígitos (opcional)"
                    value={lastFour}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setLastFour(val);
                    }}
                    placeholder="1234"
                    maxLength={4}
                />

                {/* Limite do Cartão */}
                <Input
                    label="Limite do Cartão (R$)"
                    value={limitCents}
                    onChange={(e) => {
                        const formatted = formatCurrency(e.target.value);
                        setLimitCents(formatted);
                    }}
                    placeholder="0,00"
                />

                {/* Dia de Vencimento */}
                <Input
                    label="Dia de Vencimento *"
                    type="number"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    min={1}
                    max={31}
                    placeholder="10"
                />

                {/* Dias antes do vencimento para fechamento */}
                <Input
                    label="Dias Antes do Vencimento (Fechamento) *"
                    type="number"
                    value={closingDaysBefore}
                    onChange={(e) => setClosingDaysBefore(e.target.value)}
                    min={1}
                    max={30}
                    placeholder="10"
                />

                <div className="text-xs text-slate-500">
                    Exemplo: Se vence dia {dueDay} e fecha {closingDaysBefore} dias antes,
                    o fechamento será dia {Math.max(1, parseInt(dueDay || '10') - parseInt(closingDaysBefore || '10'))}
                </div>

                {/* Cor do Cartão */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 ">
                        Cor do Cartão
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                        {CARD_COLORS.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setColor(c.value)}
                                className={`w-10 h-10 rounded-lg transition-transform hover:scale-110 ${color === c.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                                    }`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Botões */}
                <div className="flex gap-2 pt-4">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : 'Adicionar Cartão'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
