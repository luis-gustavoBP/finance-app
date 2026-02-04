'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup Form State
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
    const [signupName, setSignupName] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (error) throw error;

            // Verify if email was confirmed
            if (!data.user?.email_confirmed_at) {
                setError('Por favor, verifique seu email antes de fazer login.');
                setIsLoading(false);
                return;
            }

            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Email ou senha incorretos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (signupPassword !== signupPasswordConfirm) {
            setError('As senhas não coincidem');
            setIsLoading(false);
            return;
        }

        if (signupPassword.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email: signupEmail,
                password: signupPassword,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirm`,
                    data: {
                        full_name: signupName,
                    },
                },
            });

            if (error) throw error;

            setSuccess('Conta criada! Verifique seu email para confirmar.');
            setSignupEmail('');
            setSignupPassword('');
            setSignupPasswordConfirm('');
            setSignupName('');

            // Switch to login after delay
            setTimeout(() => {
                setIsLogin(true);
                setSuccess('');
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#001861] p-4">
            <Card className="w-full max-w-md glass-panel bg-[#001242] border-white/20">
                <CardHeader className="flex flex-col items-center pb-2">
                    <img
                        src="/logo.png"
                        alt="ContApp Logo"
                        className="h-12 w-auto mb-4 rounded-xl shadow-md"
                    />
                    <CardTitle className="text-center text-2xl text-white">
                        {isLogin ? 'Entrar no ContApp' : 'Criar Conta'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                key="login-email"
                                type="email"
                                label="Email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                placeholder="seu@email.com"
                            />

                            <Input
                                key="login-password"
                                type="password"
                                label="Senha"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </Button>

                            <div className="flex flex-col items-center gap-2 mt-4 text-sm">
                                <Link
                                    href="/forgot-password"
                                    className="text-indigo-400 hover:text-indigo-300 hover:underline"
                                >
                                    Esqueci minha senha
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(false);
                                        setError('');
                                        setSuccess('');
                                    }}
                                    className="text-slate-300 hover:text-white hover:underline"
                                >
                                    Não tem conta? Cadastre-se
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <Input
                                key="signup-name"
                                label="Nome Completo (opcional)"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                                placeholder="Seu nome"
                            />

                            <Input
                                key="signup-email"
                                type="email"
                                label="Email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                required
                                placeholder="seu@email.com"
                            />

                            <Input
                                key="signup-pass"
                                type="password"
                                label="Senha"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="Mínimo 6 caracteres"
                            />

                            <Input
                                key="signup-pass-confirm"
                                type="password"
                                label="Confirmar Senha"
                                value={signupPasswordConfirm}
                                onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                                required
                                minLength={6}
                                placeholder="Repita a senha"
                            />

                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                                {isLoading ? 'Criando conta...' : 'Criar Conta'}
                            </Button>

                            <div className="flex justify-center mt-4 text-sm">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(true);
                                        setError('');
                                        setSuccess('');
                                    }}
                                    className="text-slate-300 hover:text-white hover:underline"
                                >
                                    Já tem conta? Faça login
                                </button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
