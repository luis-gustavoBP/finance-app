'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
    content: string;
    children?: React.ReactNode;
    className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className={cn("relative inline-flex items-center group", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || (
                <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/40 hover:text-white/80 hover:border-white/40 transition-colors cursor-help bg-white/5">
                    i
                </div>
            )}

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-[#0d1225] border border-white/10 rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200">
                    <p className="text-[11px] leading-relaxed text-white/60 font-medium">
                        {content}
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0d1225]" />
                </div>
            )}
        </div>
    );
}
