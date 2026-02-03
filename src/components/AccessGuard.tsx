'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AccessGuard({ children }: { children: React.ReactNode }) {
    const [hasAccess, setHasAccess] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Allow access page itself
        if (pathname === '/access') {
            setHasAccess(true);
            return;
        }

        // Check if user has granted access
        const access = sessionStorage.getItem('app_access');

        if (access === 'granted') {
            setHasAccess(true);
        } else {
            router.push('/access');
        }
    }, [pathname, router]);

    if (!hasAccess && pathname !== '/access') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Verificando acesso...</div>
            </div>
        );
    }

    return <>{children}</>;
}
