import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, type = 'text', inputMode, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-[13px] font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    inputMode={inputMode}
                    ref={ref}
                    className={cn(
                        'w-full h-12 px-4 bg-white/[0.05] border rounded-xl text-white text-base placeholder-white/25 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/40 focus:bg-white/[0.07]',
                        error
                            ? 'border-red-400/50 focus:ring-red-400/30'
                            : 'border-white/[0.08]',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-[13px] text-red-400">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1.5 text-[13px] text-white/30">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
