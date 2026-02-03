'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AccessPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Check if already authenticated
        if (sessionStorage.getItem('app_access') === 'granted') {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const correctPassword = process.env.NEXT_PUBLIC_APP_PASSWORD || 'contapp123';

        if (password === correctPassword) {
            sessionStorage.setItem('app_access', 'granted');
            router.push('/login');
        } else {
            setError('Senha incorreta');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        🔐 Acesso ao ContApp
                    </CardTitle>
                    <p className="text-center text-sm text-slate-600 mt-2">
                        Digite a senha de acesso
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            type="password"
                            label="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite a senha"
                            autoFocus
                            required
                            autoComplete="current-password"
                            spellCheck={false}
                        />

                        <Button type="submit" className="w-full">
                            Entrar
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
