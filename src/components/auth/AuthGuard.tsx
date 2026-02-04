'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/confirm', '/access'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        if (!loading && !user && !isPublicRoute) {
            router.push('/login');
        }
    }, [user, loading, isPublicRoute, router]);

    // Show loading while checking auth, EXCEPT for public routes
    if (loading && !isPublicRoute) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // If not loading and no user, and trying to access protected route, show nothing while redirecting
    if (!loading && !user && !isPublicRoute) {
        return null;
    }

    return <>{children}</>;
}
