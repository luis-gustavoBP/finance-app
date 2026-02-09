'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/gastos', label: 'Gastos', icon: '💸' },
    { href: '/entradas', label: 'Entradas', icon: '💰' },
    { href: '/cartoes', label: 'Cartões', icon: '💳' },
    { href: '/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const closeMenu = useCallback(() => setIsOpen(false), []);

    // Close on ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeMenu();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, closeMenu]);

    // Close menu on route change
    useEffect(() => {
        closeMenu();
    }, [pathname, closeMenu]);

    if (!user) return null;

    return (
        <div className="md:hidden">
            {/* Header with Hamburger */}
            <header className="fixed top-0 left-0 right-0 z-50 h-auto min-h-[56px] bg-[#001861]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 pt-safe">
                <div className="h-14 flex items-center justify-between w-full">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt="ContApp Logo"
                            className="h-8 w-auto rounded-lg"
                        />
                    </Link>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                        aria-label="Abrir menu"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={closeMenu}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                className={cn(
                    'fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#001861] border-r border-white/10 shadow-2xl',
                    'transform transition-transform duration-300 ease-out',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Drawer Header */}
                    <div className="h-auto min-h-[56px] pt-safe flex flex-col justify-center border-b border-white/10">
                        <div className="h-14 flex items-center justify-between px-4">
                            <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                                <img
                                    src="/logo.png"
                                    alt="ContApp Logo"
                                    className="h-8 w-auto rounded-lg"
                                />
                                <span className="text-white font-semibold">ContApp</span>
                            </Link>
                            <button
                                onClick={closeMenu}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
                                aria-label="Fechar menu"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMenu}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all min-h-[48px]',
                                    pathname === item.href
                                        ? 'bg-white/10 text-white shadow-lg border border-white/10'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={() => {
                                signOut();
                                closeMenu();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
