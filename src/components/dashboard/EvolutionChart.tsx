'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database } from '@/types/database.types';
import { formatCents, parseLocalDate } from '@/lib/utils';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface EvolutionChartProps {
    transactions: Transaction[];
    minimal?: boolean;
    selectedMonth?: Date;
}

export function EvolutionChart({ transactions, minimal = false, selectedMonth }: EvolutionChartProps) {
    // Preparar dados do mês selecionado
    const prepareChartData = () => {
        const now = new Date();
        const target = selectedMonth || now;
        const targetMonth = target.getMonth();
        const targetYear = target.getFullYear();
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

        // Determine last day to show data for
        const isCurrentMonth = now.getMonth() === targetMonth && now.getFullYear() === targetYear;
        const isPastMonth = targetYear < now.getFullYear() || (targetYear === now.getFullYear() && targetMonth < now.getMonth());
        const lastDay = isCurrentMonth ? now.getDate() : isPastMonth ? daysInMonth : 0;

        // Filtrar transações do mês selecionado
        const monthTransactions = transactions
            .filter(t => {
                const d = parseLocalDate(t.posted_at);
                return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
            })
            .sort((a, b) => parseLocalDate(a.posted_at).getTime() - parseLocalDate(b.posted_at).getTime());

        // Agrupar por dia e calcular cumulativo
        const dayMap = new Map<number, number>();
        let cumulative = 0;

        monthTransactions.forEach(t => {
            const day = parseLocalDate(t.posted_at).getDate();
            cumulative += t.amount_cents;
            dayMap.set(day, cumulative);
        });

        // Criar array com todos os dias do mês
        const chartData = [];
        let runningValue = 0;
        for (let day = 1; day <= lastDay; day++) {
            if (dayMap.has(day)) {
                runningValue = dayMap.get(day)!;
            }

            const date = new Date(targetYear, targetMonth, day);
            chartData.push({
                day: day.toString(),
                value: runningValue / 100,
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
