import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles =
            'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0f1e] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]';

        const variants = {
            primary:
                'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 focus:ring-indigo-400/50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 rounded-xl',
            secondary:
                'bg-white/[0.06] text-white/90 hover:bg-white/[0.1] focus:ring-white/20 border border-white/[0.08] rounded-xl',
            danger:
                'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-400 hover:to-rose-400 focus:ring-red-400/50 shadow-lg shadow-red-500/20 rounded-xl',
            ghost:
                'bg-transparent hover:bg-white/[0.06] text-white/60 hover:text-white/90 rounded-xl',
        };

        const sizes = {
            sm: 'px-3.5 py-2 text-[13px] min-h-[36px]',
            md: 'px-5 py-2.5 text-sm min-h-[44px]',
            lg: 'px-7 py-3.5 text-base min-h-[48px]',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
