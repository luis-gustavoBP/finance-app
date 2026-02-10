import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number;
    max?: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ProgressBar({
    value,
    max = 100,
    showLabel = true,
    size = 'md',
    className,
}: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const actualPercentage = (value / max) * 100;

    const getColor = () => {
        if (actualPercentage >= 100) return 'bg-gradient-to-r from-red-400 to-rose-400';
        if (actualPercentage >= 80) return 'bg-gradient-to-r from-amber-400 to-orange-400';
        return 'bg-gradient-to-r from-emerald-400 to-teal-400';
    };

    const getTextColor = () => {
        if (actualPercentage >= 100) return 'text-red-400';
        if (actualPercentage >= 80) return 'text-amber-400';
        return 'text-emerald-400';
    };

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={cn('w-full', className)}>
            <div
                className={cn(
                    'w-full bg-white/[0.06] rounded-full overflow-hidden',
                    sizes[size]
                )}
            >
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        getColor()
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className={cn('mt-1.5 text-[12px] font-medium', getTextColor())}>
                    {actualPercentage.toFixed(0)}% usado
                </div>
            )}
        </div>
    );
}
