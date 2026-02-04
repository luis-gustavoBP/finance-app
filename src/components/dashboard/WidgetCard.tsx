'use client';

import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { formatCents, cn } from '@/lib/utils';

interface WidgetCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: 'trending' | 'dollar' | 'calendar';
    variant?: 'blue' | 'green' | 'orange' | 'white';
    children?: React.ReactNode;
}

export function WidgetCard({
    title,
    value,
    subtitle,
    icon,
    variant = 'white',
    children,
}: WidgetCardProps) {
    const variants = {
        white: 'glass-panel text-white',
        blue: 'glass-panel text-white',
        green: 'glass-panel text-white',
        orange: 'glass-panel text-white',
    };

    const titleBadges = {
        white: 'bg-slate-50 border-slate-100 text-slate-500',
        blue: 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-200/50',
        green: 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-200/50',
        orange: 'bg-orange-500 border-orange-400 text-white shadow-md shadow-orange-200/50',
    };

    return (
        <div className={cn(
            "rounded-xl p-6 shadow-sm border transition-all relative overflow-hidden",
            variants[variant]
        )}>
            {/* Title with badges */}
            <div className="mb-6 flex items-center justify-between">
                <span className={cn(
                    "px-4 py-2 rounded-xl border uppercase tracking-[0.15em] text-[10px] font-black",
                    titleBadges[variant]
                )}>
                    {title}
                </span>
            </div>

            {/* Main Value */}
            <div className="mb-2">
                <p className="text-4xl font-black tracking-tight text-white">
                    {typeof value === 'number' ? formatCents(value) : value}
                </p>
            </div>

            {/* Subtitle */}
            {subtitle && (
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4 text-slate-300/60">
                    {subtitle}
                </p>
            )}

            {children}
        </div>
    );
}
