import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'highlighted';
    highlightColor?: 'green' | 'yellow' | 'red' | 'indigo';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', highlightColor, children, ...props }, ref) => {
        const highlightColors = {
            green: 'border-l-[3px] border-l-emerald-400/60',
            yellow: 'border-l-[3px] border-l-amber-400/60',
            red: 'border-l-[3px] border-l-red-400/60',
            indigo: 'border-l-[3px] border-l-indigo-400/60',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'glass-panel rounded-2xl p-4 sm:p-5 transition-all duration-300',
                    'hover:bg-white/[0.06] hover:border-white/[0.12]',
                    highlightColor && highlightColors[highlightColor],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('mb-3', className)} {...props} />
    )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { }

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-sm font-semibold text-white/70 uppercase tracking-wide', className)}
            {...props}
        />
    )
);

CardTitle.displayName = 'CardTitle';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('', className)} {...props} />
    )
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
