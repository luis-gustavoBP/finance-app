'use client';

import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { formatCents } from '@/lib/utils';

interface WidgetCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: 'trending' | 'dollar' | 'calendar';
    iconColor?: string;
    iconBg?: string;
    children?: React.ReactNode;
}

export function WidgetCard({
    title,
    value,
    subtitle,
    icon,
    iconColor = 'text-indigo-600',
    iconBg = 'bg-indigo-100',
    children,
}: WidgetCardProps) {
    const Icon = icon === 'trending' ? TrendingUp : icon === 'dollar' ? DollarSign : Calendar;

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            {/* Cabeçalho com ícone */}
            <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <h3 className="font-semibold text-slate-700">{title}</h3>
            </div>

            {/* Valor principal */}
            <div className="mb-2">
                <p className="text-3xl font-bold text-slate-900">
                    {typeof value === 'number' ? formatCents(value) : value}
                </p>
            </div>

            {/* Subtítulo ou conteúdo customizado */}
            {subtitle && (
                <p className="text-sm text-slate-500">{subtitle}</p>
            )}

            {children}
        </div>
    );
}
