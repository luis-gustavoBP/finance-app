'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { Database } from '@/types/database.types';
import { parseLocalDate } from '@/lib/utils';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface MonthlyPaceProps {
    transactions: Transaction[];
    monthlyLimit: number;
    minimal?: boolean;
}

export function MonthlyPace({ transactions, monthlyLimit, minimal = false }: MonthlyPaceProps) {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const today = now.getDate();

    // Filtrar apenas transações deste mês até hoje
    const currentMonthTx = transactions.filter(tx => {
        const d = parseLocalDate(tx.posted_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // Construir dados dia a dia
    const data = [];
    let cumulative = 0;

    // Ritmo ideal: orçamento dividido pelos dias do mês
    const idealPerDay = monthlyLimit / daysInMonth;

    for (let day = 1; day <= today; day++) {
        // Somar gastos do dia
        const daySpending = currentMonthTx
            .filter(tx => parseLocalDate(tx.posted_at).getDate() === day)
            .reduce((sum, tx) => sum + tx.amount_cents, 0);

        cumulative += daySpending;

        data.push({
            day,
            actual: cumulative / 100,
            ideal: (idealPerDay * day) / 100,
        });
    }

    // Projetar o resto do mês (apenas a linha ideal)
    for (let day = today + 1; day <= daysInMonth; day++) {
        data.push({
            day,
            ideal: (idealPerDay * day) / 100,
        });
    }

    const content = (
        <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="day"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        stroke="#94a3b8"
                        interval={2}
                        dy={10}
                    />
                    <YAxis
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        stroke="#94a3b8"
                        tickFormatter={(value) => `R$${value}`}
                        hide={minimal}
                    />
                    <Tooltip
                        cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                        formatter={(value: any, name: any) => [
                            value ? `R$ ${Number(value).toFixed(2)}` : 'R$ 0.00',
                            name === 'actual' ? 'Gasto Real' : 'Ritmo Ideal'
                        ]}
                        labelFormatter={(label) => `Dia ${label}`}
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                        }}
                        itemStyle={{ fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
                    />
                    {/* Ritmo Ideal (Linha Pontilhada) */}
                    <Area
                        type="monotone"
                        dataKey="ideal"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="transparent"
                        name="ideal"
                        animationDuration={1000}
                    />
                    {/* Gasto Real (Área preenchida) */}
                    <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#6366f1"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorActual)"
                        name="actual"
                        animationDuration={1500}
                    />
                    <ReferenceLine
                        x={today}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        label={{ value: 'Hoje', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    if (minimal) return <div className="p-0">{content}</div>;

    return (
        <Card className="glass-panel text-white">
            <CardHeader className="pb-0 pt-6 px-6">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">
                    Ritmo de Gasto Mensal
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {content}
            </CardContent>
        </Card>
    );
}
