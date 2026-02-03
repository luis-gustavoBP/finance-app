'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Database } from '@/types/database.types';
import { parseLocalDate } from '@/lib/utils';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface MonthlyPaceProps {
    transactions: Transaction[];
    monthlyLimit: number;
}

export function MonthlyPace({ transactions, monthlyLimit }: MonthlyPaceProps) {
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
            actual: cumulative / 100, // Recharts values in reais easier for ticks
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ritmo de Gasto</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="day"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#64748b"
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#64748b"
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                formatter={(value: number | undefined) => [value ? `R$ ${value.toFixed(2)}` : 'R$ 0.00', '']}
                                labelFormatter={(label) => `Dia ${label}`}
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    color: '#1e293b'
                                }}
                                itemStyle={{ color: '#1e293b' }}
                            />
                            {/* Linha Ideal (Pontilhada Cinza) */}
                            <Line
                                type="monotone"
                                dataKey="ideal"
                                stroke="#94a3b8"
                                strokeDasharray="5 5"
                                dot={false}
                                strokeWidth={2}
                                name="Ritmo Ideal"
                            />
                            {/* Linha Real (Roxa Sólida) */}
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ r: 3, fill: '#6366f1' }}
                                activeDot={{ r: 6 }}
                                name="Gasto Real"
                            />
                            <ReferenceLine x={today} stroke="orange" strokeDasharray="3 3" label="Hoje" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
