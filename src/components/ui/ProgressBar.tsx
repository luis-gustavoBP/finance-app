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

    // Determine color based on percentage
    const getColor = () => {
        if (actualPercentage >= 100) return 'bg-gradient-to-r from-red-500 to-rose-500';
        if (actualPercentage >= 80) return 'bg-gradient-to-r from-amber-400 to-orange-500';
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
    };

    const getTextColor = () => {
        if (actualPercentage >= 100) return 'text-red-600 dark:text-red-400';
        if (actualPercentage >= 80) return 'text-amber-600 dark:text-amber-400';
        return 'text-green-600 dark:text-green-400';
    };

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    return (
        <div className={cn('w-full', className)}>
            <div
                className={cn(
                    'w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden',
                    sizes[size]
                )}
            >
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        getColor()
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className={cn('mt-1.5 text-sm font-medium', getTextColor())}>
                    {actualPercentage.toFixed(0)}% usado
                </div>
            )}
        </div>
    );
}
