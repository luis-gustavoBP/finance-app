'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Database } from '@/types/database.types';
import { parseLocalDate } from '@/lib/utils';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface FutureCommitmentsProps {
    transactions: Transaction[];
}

export function FutureCommitments({ transactions }: FutureCommitmentsProps) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar apenas transações futuras
    const futureTx = transactions.filter(tx => {
        const d = parseLocalDate(tx.posted_at);
        // Se o ano for maior, é futuro. Se o ano for igual, mês deve ser maior.
        return d.getFullYear() > currentYear || (d.getFullYear() === currentYear && d.getMonth() > currentMonth);
    });

    if (futureTx.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Compromissos Futuros</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-slate-400">
                    Sem parcelas futuras agendadas
                </CardContent>
            </Card>
        );
    }

    // Agrupar por Mês/Ano (ex: "Mar/26")
    const dataMap = futureTx.reduce((acc, tx) => {
        const d = parseLocalDate(tx.posted_at);
        // Formato curto "Mês"
        const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[sortKey]) {
            acc[sortKey] = {
                name: monthName,
                value: 0,
                fullDate: sortKey
            };
        }
        acc[sortKey].value += tx.amount_cents;
        return acc;
    }, {} as Record<string, { name: string, value: number, fullDate: string }>);

    // Transformar em array e ordenar (limitar aos próximos 6 meses)
    const data = Object.values(dataMap)
        .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
        .slice(0, 6)
        .map(item => ({
            name: item.name,
            total: item.value / 100 // Para exibir em reais
        }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Compromissos Futuros</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                formatter={(value: number | undefined) => [value ? `R$ ${value.toFixed(2)}` : 'R$ 0.00', 'Total Comprometido']}
                            />
                            <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-slate-400 mt-2">Próximos 6 meses</p>
            </CardContent>
        </Card>
    );
}
