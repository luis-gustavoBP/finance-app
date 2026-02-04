'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
            const date = t.posted_at;
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
                value: value / 100,
                fullDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            });
        }

        return chartData;
    };

    const data = prepareChartData();

    const chartContent = (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={2}
                    dy={10}
                />
                <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                    hide={minimal}
                />
                <Tooltip
                    cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '5 5' }}
                    formatter={(value: any) => [`R$ ${Number(value || 0).toFixed(2)}`, 'Acumulado']}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || `Dia ${label}`}
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );

    if (minimal) {
        return <div className="p-0">{chartContent}</div>;
    }

    return (
        <div className="glass-panel text-white p-6">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-white/70">
                Evolução de Gastos (30 dias)
            </h3>
            {chartContent}
        </div>
    );
}
