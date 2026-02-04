'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database } from '@/types/database.types';
import { formatCents, parseLocalDate } from '@/lib/utils';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface EvolutionChartProps {
    transactions: Transaction[];
    minimal?: boolean;
}

export function EvolutionChart({ transactions, minimal = false }: EvolutionChartProps) {
    // Preparar dados dos últimos 30 dias
    const prepareChartData = () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        // Filtrar transações dos últimos 30 dias
        const recentTransactions = transactions
            .filter(t => parseLocalDate(t.posted_at) >= thirtyDaysAgo)
            .sort((a, b) => parseLocalDate(a.posted_at).getTime() - parseLocalDate(b.posted_at).getTime());

        // Agrupar por dia e calcular cumulativo
        const dayMap = new Map<string, number>();
        let cumulative = 0;

        recentTransactions.forEach(t => {
            const date = t.posted_at; // Já está no formato YYYY-MM-DD
            cumulative += t.amount_cents;
            dayMap.set(date, cumulative);
        });

        // Criar array com todos os dias (incluindo dias sem transações)
        const chartData = [];
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const day = date.getDate();

            // Encontrar valor cumulativo até esse dia
            let value = 0;
            for (const [d, v] of dayMap.entries()) {
                if (d <= dateStr) {
                    value = v;
                }
            }

            chartData.push({
                day: day.toString(),
                value: value / 100, // Converter para reais
            });
        }

        return chartData;
    };

    const data = prepareChartData();

    const chartContent = (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={12}
                />
                <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip
                    formatter={(value: number | undefined) => [`R$ ${value?.toFixed(2) || '0.00'}`, 'Gasto acumulado']}
                    labelFormatter={(label) => `Dia ${label}`}
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 3 }}
                    activeDot={{ r: 5 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );

    if (minimal) {
        return <div className="p-4">{chartContent}</div>;
    }

    return (
        <div className="glass-panel text-white p-6">
            <h3 className="mb-4 font-semibold text-white/90">
                Evolução de Gastos (30 dias)
            </h3>
            {chartContent}
        </div>
    );
}
