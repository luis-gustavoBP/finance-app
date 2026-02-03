'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useExpenses } from '@/contexts/ExpenseContext';
import { CATEGORIES, CURRENCY_FORMATTER } from '@/lib/constants';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend,
} from 'recharts';

export function MonthlyChart() {
    const { getCategoryTotals } = useExpenses();
    const categoryTotals = getCategoryTotals();

    const data = CATEGORIES.map((cat) => ({
        name: cat.label,
        value: categoryTotals[cat.id] || 0,
        color: cat.color,
        icon: cat.icon,
    })).filter((item) => item.value > 0);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Gastos por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                        <svg
                            className="w-16 h-16 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <p className="text-center">
                            Nenhum gasto registrado este mês.
                            <br />
                            Adicione gastos para ver o gráfico.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                        {payload[0].payload.icon} {payload[0].payload.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {CURRENCY_FORMATTER.format(payload[0].value)}
                    </p>
                    <p className="text-xs text-slate-400">
                        {((payload[0].value / total) * 100).toFixed(1)}% do total
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={100}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {data.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"
                        >
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span>{item.name}</span>
                            <span className="font-medium">{CURRENCY_FORMATTER.format(item.value)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
