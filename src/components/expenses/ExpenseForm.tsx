'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useExpenses } from '@/contexts/ExpenseContext';
import { CATEGORIES, CURRENCY_FORMATTER } from '@/lib/constants';
import { Category } from '@/types';
import { calculateInstallmentValue } from '@/lib/calculations';

interface ExpenseFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ExpenseForm({ onSuccess, onCancel }: ExpenseFormProps) {
    const { addExpense } = useExpenses();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        item: '',
        category: 'outros' as Category,
        totalValue: '',
        installments: '1',
        purchaseDate: new Date().toISOString().split('T')[0],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const categoryOptions = CATEGORIES.map((cat) => ({
        value: cat.id,
        label: `${cat.icon} ${cat.label}`,
    }));

    const installmentOptions = Array.from({ length: 24 }, (_, i) => ({
        value: String(i + 1),
        label: i === 0 ? 'À vista' : `${i + 1}x`,
    }));

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.item.trim()) {
            newErrors.item = 'Nome do item é obrigatório';
        }

        const value = parseFloat(formData.totalValue.replace(',', '.'));
        if (isNaN(value) || value <= 0) {
            newErrors.totalValue = 'Valor deve ser maior que zero';
        }

        if (!formData.purchaseDate) {
            newErrors.purchaseDate = 'Data é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        try {
            const totalValue = parseFloat(formData.totalValue.replace(',', '.'));
            const installments = parseInt(formData.installments);

            addExpense({
                item: formData.item.trim(),
                category: formData.category,
                totalValue,
                installments,
                purchaseDate: formData.purchaseDate,
            });

            // Reset form
            setFormData({
                item: '',
                category: 'outros',
                totalValue: '',
                installments: '1',
                purchaseDate: new Date().toISOString().split('T')[0],
            });

            onSuccess?.();
        } catch (error) {
            console.error('Error adding expense:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const installmentValue =
        formData.totalValue && parseInt(formData.installments) > 1
            ? calculateInstallmentValue(
                parseFloat(formData.totalValue.replace(',', '.')),
                parseInt(formData.installments)
            )
            : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Nome do Item"
                placeholder="Ex: Tênis Nike"
                value={formData.item}
                onChange={(e) => setFormData((prev) => ({ ...prev, item: e.target.value }))}
                error={errors.item}
            />

            <Select
                label="Categoria"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value as Category }))
                }
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Valor Total"
                    placeholder="0,00"
                    type="text"
                    inputMode="decimal"
                    value={formData.totalValue}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,.-]/g, '');
                        setFormData((prev) => ({ ...prev, totalValue: value }));
                    }}
                    error={errors.totalValue}
                />

                <Select
                    label="Parcelas"
                    options={installmentOptions}
                    value={formData.installments}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, installments: e.target.value }))
                    }
                />
            </div>

            {installmentValue !== null && !isNaN(installmentValue) && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        💳 Valor de cada parcela:{' '}
                        <span className="font-semibold">
                            {CURRENCY_FORMATTER.format(installmentValue)}
                        </span>
                    </p>
                </div>
            )}

            <Input
                label="Data da Compra"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                    setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))
                }
                error={errors.purchaseDate}
            />

            <div className="flex gap-3 pt-4">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                        Cancelar
                    </Button>
                )}
                <Button type="submit" isLoading={isLoading} className="flex-1">
                    Adicionar Gasto
                </Button>
            </div>
        </form>
    );
}
