'use client';

import { CheckCircle2 } from 'lucide-react';
import { formatCents } from '@/lib/utils';

interface BalanceCardProps {
    available: number;
    budget: number;
    spent: number;
}

export function BalanceCard({ available, budget, spent }: BalanceCardProps) {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;

    // Determinar cor da barra de progresso
    let progressColor = 'bg-green-400';
    if (percentage > 90) progressColor = 'bg-red-400';
    else if (percentage > 70) progressColor = 'bg-yellow-400';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-xl">
            {/* Ícone de check no canto */}
            <div className="absolute top-4 right-4">
                <div className="rounded-full bg-white/20 p-2">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
            </div>

            {/* Título */}
            <div className="mb-2">
                <p className="text-sm font-medium opacity-90">Saldo Disponível do Mês</p>
            </div>

            {/* Valor principal */}
            <div className="mb-4">
                <p className="text-5xl font-bold tracking-tight">
                    {formatCents(available)}
                </p>
            </div>

            {/* Informações de orçamento e gastos */}
            <div className="mb-3 flex items-center justify-between text-sm">
                <span>Orçamento: {formatCents(budget)}</span>
                <span>Gastos: {formatCents(spent)}</span>
            </div>

            {/* Barra de progresso */}
            <div className="mb-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                        className={`h-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Percentual utilizado */}
            <div className="flex items-center justify-between text-xs">
                <span className="opacity-80">{percentage.toFixed(1)}% utilizado</span>
                <span className="opacity-80">
                    {percentage > 100 ? '⚠️ ' : ''}
                    {percentage > 90
                        ? 'Atenção!'
                        : percentage > 70
                            ? 'Fique atento'
                            : 'Sob controle'}
                </span>
            </div>
        </div>
    );
}
