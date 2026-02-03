'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            // Login successful (Supabase usually auto-logs in if email confirm off, or requires confirm)
            // Assuming email confirm is OFF for smooth dev, or handle check email
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        🚀 Criar Conta
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Nome Completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />

                        <Input
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            label="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required
                            autoComplete="new-password"
                            spellCheck={false}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </Button>

                        <p className="text-center text-sm text-slate-500 mt-4">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="text-indigo-600 hover:underline">
                                Faça login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
