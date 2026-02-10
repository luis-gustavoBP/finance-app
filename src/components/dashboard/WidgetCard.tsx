'use client';

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
    const accentColors = {
        white: 'from-white/[0.08] to-transparent',
        blue: 'from-blue-500/10 to-transparent',
        green: 'from-emerald-500/10 to-transparent',
        orange: 'from-amber-500/10 to-transparent',
    };

    const badgeColors = {
        white: 'text-white/50 border-white/[0.08]',
        blue: 'text-blue-400 border-blue-500/20 bg-blue-500/[0.06]',
        green: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06]',
        orange: 'text-amber-400 border-amber-500/20 bg-amber-500/[0.06]',
    };

    return (
        <div className={cn(
            "glass-panel rounded-2xl p-4 sm:p-5 transition-all relative overflow-hidden",
            "bg-gradient-to-br",
            accentColors[variant]
        )}>
            {/* Title badge */}
            <div className="mb-4">
                <span className={cn(
                    "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest",
                    badgeColors[variant]
                )}>
                    {title}
                </span>
            </div>

            {/* Main Value */}
            <div className="mb-1">
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {typeof value === 'number' ? formatCents(value) : value}
                </p>
            </div>

            {/* Subtitle */}
            {subtitle && (
                <p className="text-[11px] font-medium text-white/30 mb-3">
                    {subtitle}
                </p>
            )}

            {children}
        </div>
    );
}
