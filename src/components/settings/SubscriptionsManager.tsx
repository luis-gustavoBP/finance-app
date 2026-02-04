'use client';

import { useState } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useCategories } from '@/hooks/useCategories';
import { useCards } from '@/hooks/useCards';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCents, parseCurrencyInput, formatCurrencyInputValue } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

export function SubscriptionsManager() {
    const { subscriptions, addSubscription, deleteSubscription, toggleActive, isLoading } = useSubscriptions();
    const { categories } = useCategories();
    const { cards } = useCards();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDay, setDueDay] = useState('10');
    const [categoryId, setCategoryId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash'>('credit');
    const [cardId, setCardId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalMonthly = subscriptions
        .filter(s => s.active)
        .reduce((sum, s) => sum + s.amount_cents, 0);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const amountCents = parseCurrencyInput(amount);

            if (!description || amountCents <= 0 || !categoryId) {
                alert('Preencha todos os campos obrigatórios.');
                return;
            }

            await addSubscription({
                description,
                amount_cents: amountCents,
                category_id: categoryId,
                due_day: parseInt(dueDay),
                active: true,
                payment_method: paymentMethod,
                card_id: paymentMethod === 'credit' ? cardId : null
            });

            setIsModalOpen(false);
            setDescription('');
            setAmount('');
            setDueDay('10');
            setCategoryId('');
        } catch (error) {
            console.error(error);
            alert('Erro ao adicionar assinatura.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="text-center p-4">Carregando assinaturas...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">Assinaturas e Contas Fixas</CardTitle>
                    <p className="text-sm text-slate-300 mt-1">
                        Total mensal: <span className="font-bold text-white">{formatCents(totalMonthly)}</span>
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} size="sm" variant="primary">
                    + Adicionar
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {subscriptions.length === 0 ? (
                        <div className="text-center py-8 text-slate-300 bg-white/5 rounded-lg">
                            Nenhuma assinatura cadastrada.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {subscriptions.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between py-3 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">
                                            {sub.category?.icon || '📅'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{sub.description}</div>
                                            <div className="text-xs text-slate-300 capitalize">
                                                Dia {sub.due_day} • {sub.category?.name || 'Geral'} • {sub.payment_method === 'credit' ? `💳 ${cards.find(c => c.id === sub.card_id)?.name || 'Cartão'}` : sub.payment_method === 'pix' ? '💠 PIX' : sub.payment_method === 'debit' ? '💸 Débito' : '💵 Dinheiro'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold ${sub.active ? 'text-white' : 'text-slate-500 line-through'}`}>
                                            {formatCents(sub.amount_cents)}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={sub.active ? "text-green-400" : "text-slate-400"}
                                                onClick={() => toggleActive(sub.id, sub.active)}
                                                title={sub.active ? "Pausar" : "Ativar"}
                                            >
                                                {sub.active ? '✅' : '⏸️'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => {
                                                    if (confirm('Excluir esta assinatura?')) deleteSubscription(sub.id);
                                                }}
                                            >
                                                🗑️
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Assinatura">
                    <div className="space-y-4 pt-4">
                        <Input
                            label="Descrição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Netflix, Internet..."
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300">Forma de Pagamento</label>
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
                            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                                <label className="text-sm font-medium text-slate-300">Cartão de Crédito</label>
                                <select
                                    className="flex h-10 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
                                    value={cardId}
                                    onChange={(e) => setCardId(e.target.value)}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.25rem'
                                    }}
                                >
                                    <option value="" className="bg-[#001242] text-white">Selecione um cartão...</option>
                                    {cards.map(card => (
                                        <option key={card.id} value={card.id} className="bg-[#001242] text-white">{card.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Valor (R$)"
                                value={amount}
                                onChange={(e) => {
                                    const cents = parseCurrencyInput(e.target.value);
                                    setAmount(formatCurrencyInputValue(cents));
                                }}
                                placeholder="0,00"
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-300">Dia Vencimento</label>
                                <select
                                    className="flex h-10 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
                                    value={dueDay}
                                    onChange={(e) => setDueDay(e.target.value)}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.25rem'
                                    }}
                                >
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day} className="bg-[#001242] text-white">{day}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300">Categoria</label>
                            <select
                                className="flex h-10 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1.25rem'
                                }}
                            >
                                <option value="" className="bg-[#001242] text-white">Selecione...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-[#001242] text-white">{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </CardContent>
        </Card>
    );
}
