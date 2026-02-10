'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Category } from '@/types';
import { formatCents } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface CategoryPieChartProps {
    transactions: Transaction[];
    categories: Category[];
}

export function CategoryPieChart({ transactions, categories }: CategoryPieChartProps) {
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
            .slice(0, 6);
    };

    const data = prepareData();

    if (data.length === 0) {
        return (
            <Card>
                <div className="px-4 sm:px-5 py-4 sm:py-5">
                    <span className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-[10px] font-bold text-white/50 uppercase tracking-widest">
                        Gastos por Categoria
                    </span>
                    <p className="text-center text-white/20 py-8 text-sm">
                        Nenhuma transação ainda
                    </p>
                </div>
            </Card>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card>
            <div className="px-4 sm:px-5 py-4 sm:py-5">
                <span className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    Gastos por Categoria
                </span>

                <div className="h-56 sm:h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={65}
                                innerRadius={30}
                                fill="#8884d8"
                                dataKey="value"
                                label={false}
                                strokeWidth={0}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => value !== undefined ? formatCents(value) : ''}
                                contentStyle={{
                                    backgroundColor: 'rgba(10, 15, 30, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    color: '#f0f2f8',
                                    backdropFilter: 'blur(16px)',
                                    fontSize: '12px',
                                    padding: '8px 12px',
                                }}
                                itemStyle={{ color: '#f0f2f8' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-[13px]">
                            <div className="flex items-center gap-2 min-w-0">
                                <div
                                    className="h-2 w-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="truncate text-white/50">
                                    {item.icon} {item.name}
                                </span>
                            </div>
                            <span className="font-medium text-white/70 ml-2 shrink-0">{formatCents(item.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
