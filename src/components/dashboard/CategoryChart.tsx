'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCents } from '@/lib/utils';

import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row'] | null;
};

interface CategoryChartProps {
    transactions: Transaction[];
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

export function CategoryChart({ transactions }: CategoryChartProps) {
    // Agrupar por categoria
    const dataMap = transactions.reduce((acc, tx) => {
        const catName = tx.category?.name || 'Outros';
        if (!acc[catName]) acc[catName] = 0;
        acc[catName] += tx.amount_cents;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(dataMap)
        .map(([name, value]) => ({ name, value }))
        // Using explicit typing for sort parameters to avoid 'unknown' error
        .sort((a, b) => (b.value as number) - (a.value as number));

    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gastos por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-slate-400">
                    Sem dados suficientes
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [formatCents(value || 0), 'Valor']}
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    color: '#1e293b'
                                }}
                                itemStyle={{ color: '#1e293b' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {data.slice(0, 6).map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="truncate">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
