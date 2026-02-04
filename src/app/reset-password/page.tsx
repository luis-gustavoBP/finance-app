'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        // Verify active session (from email link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setHasSession(!!session);
            setCheckingSession(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha');
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse text-slate-500">Verificando link...</div>
            </div>
        );
    }

    if (!hasSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <CardTitle className="text-2xl text-slate-800">Link Inválido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-slate-600">
                            Este link expirou ou já foi usado. Por favor, solicite um novo link de recuperação.
                        </p>
                        <Link href="/forgot-password">
                            <Button className="w-full">Solicitar Novo Link</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <CardTitle className="text-2xl text-slate-800">Senha Alterada!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-6">
                            Sua senha foi redefinida com sucesso.
                            <br />
                            Redirecionando para o login...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl text-slate-800">
                        Redefinir Senha
                    </CardTitle>
                    <p className="text-center text-sm text-slate-500 mt-2">
                        Digite sua nova senha abaixo
                    </p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="password"
                            label="Nova Senha"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                        />

                        <Input
                            type="password"
                            label="Confirmar Senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Repita a senha"
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
