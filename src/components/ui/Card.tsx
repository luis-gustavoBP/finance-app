import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'highlighted';
    highlightColor?: 'green' | 'yellow' | 'red' | 'indigo';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', highlightColor, children, ...props }, ref) => {
        const highlightColors = {
            green: 'border-l-4 border-l-green-500',
            yellow: 'border-l-4 border-l-amber-500',
            red: 'border-l-4 border-l-red-500',
            indigo: 'border-l-4 border-l-indigo-500',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all duration-200 hover:shadow-md',
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
        <div ref={ref} className={cn('mb-4', className)} {...props} />
    )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { }

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-lg font-semibold text-slate-800', className)}
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
