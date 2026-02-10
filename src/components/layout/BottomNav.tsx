'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
    {
        href: '/',
        label: 'Início',
        icon: (
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        href: '/gastos',
        label: 'Gastos',
        icon: (
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        href: '/entradas',
        label: 'Entradas',
        icon: (
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        href: '/cartoes',
        label: 'Cartões',
        icon: (
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
    },
    {
        href: '/configuracoes',
        label: 'Ajustes',
        icon: (
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 10) {
            setIsVisible(true);
            setLastScrollY(currentScrollY);
            return;
        }

        if (currentScrollY > lastScrollY && currentScrollY > 60) {
            setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
            setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
    }, [lastScrollY]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    if (!user) return null;

    return (
        <nav
            className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 z-40",
                "bg-[#0a0f1e]/90 backdrop-blur-2xl border-t border-white/[0.06]",
                "pb-safe transition-transform duration-300 ease-out transform-gpu",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
            style={{ willChange: 'transform' }}
        >
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center min-w-[52px] min-h-[48px] px-2 py-1.5 rounded-2xl transition-all duration-200',
                                isActive
                                    ? 'text-indigo-400'
                                    : 'text-white/30 active:text-white/50'
                            )}
                        >
                            <span className={cn(
                                'transition-all duration-200',
                                isActive && 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                            )}>
                                {item.icon}
                            </span>
                            <span className={cn(
                                'text-[10px] mt-0.5 truncate max-w-full',
                                isActive ? 'font-semibold' : 'font-normal'
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
