import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-200 dark:border-slate-600',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
