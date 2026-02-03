'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Category } from '@/types';
import { formatCents } from '@/lib/utils';

interface CategoryPieChartProps {
    transactions: Transaction[];
    categories: Category[];
}

export function CategoryPieChart({ transactions, categories }: CategoryPieChartProps) {
    // Preparar dados por categoria
    const prepareData = () => {
        const categoryTotals = new Map<string, { name: string; value: number; color: string; icon: string }>();

        transactions.forEach(t => {
            const category = categories.find(c => c.id === t.category_id);
            if (!category) return;

            const current = categoryTotals.get(category.id) || {
                name: category.name,
                value: 0,
                color: category.color,
                icon: category.icon,
            };

            current.value += t.amount_cents;
            categoryTotals.set(category.id, current);
        });

        return Array.from(categoryTotals.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6 categorias
    };

    const data = prepareData();

    if (data.length === 0) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <h3 className="mb-4 font-semibold text-slate-700">
                    🍕 Gastos por Categoria
                </h3>
                <p className="text-center text-slate-500 py-8">
                    Nenhuma transação ainda
                </p>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <h3 className="mb-4 font-semibold text-slate-700">
                🍕 Gastos por Categoria
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number | undefined) => value !== undefined ? formatCents(value) : ''}
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Legenda customizada */}
            <div className="mt-4 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span>
                                {item.icon} {item.name}
                            </span>
                        </div>
                        <span className="font-semibold">{formatCents(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
