'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setEmailSent(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar email');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">📧</span>
                        </div>
                        <CardTitle className="text-2xl text-slate-800">Email Enviado!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-slate-600">
                            Enviamos um link de recuperação para <strong>{email}</strong>.
                            <br />
                            Clique nele para redefinir sua senha.
                        </p>
                        <Link href="/login">
                            <Button className="w-full">Voltar para Login</Button>
                        </Link>
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
                        Esqueceu sua senha?
                    </CardTitle>
                    <p className="text-center text-sm text-slate-500 mt-2">
                        Digite seu email para receber um link de redefinição
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
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Enviando...' : 'Enviar Link'}
                        </Button>

                        <div className="text-center mt-4">
                            <Link
                                href="/login"
                                className="text-sm text-slate-500 hover:text-indigo-600 hover:underline"
                            >
                                Voltar para Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
