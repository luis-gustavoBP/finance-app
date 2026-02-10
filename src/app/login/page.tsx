'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

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
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4 mesh-bg">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/logo.png"
                        alt="ContApp Logo"
                        className="h-14 w-auto mb-4 rounded-2xl"
                    />
                    <h1 className="text-xl font-bold text-white">
                        {isLogin ? 'Entrar' : 'Criar Conta'}
                    </h1>
                    <p className="text-sm text-white/25 mt-1">
                        {isLogin ? 'Acesse sua conta ContApp' : 'Comece a controlar suas finanças'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-panel rounded-2xl p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-400/[0.06] border border-red-400/[0.1] text-red-400 rounded-xl text-[13px]">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-emerald-400/[0.06] border border-emerald-400/[0.1] text-emerald-400 rounded-xl text-[13px]">
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

                            <div className="flex flex-col items-center gap-3 mt-4 text-[13px]">
                                <Link
                                    href="/forgot-password"
                                    className="text-indigo-400/70 hover:text-indigo-400 transition-colors"
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
                                    className="text-white/25 hover:text-white/50 transition-colors"
                                >
                                    Não tem conta? <span className="text-white/50">Cadastre-se</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <Input
                                key="signup-name"
                                label="Nome (opcional)"
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

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Criando conta...' : 'Criar Conta'}
                            </Button>

                            <div className="flex justify-center mt-4 text-[13px]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(true);
                                        setError('');
                                        setSuccess('');
                                    }}
                                    className="text-white/25 hover:text-white/50 transition-colors"
                                >
                                    Já tem conta? <span className="text-white/50">Faça login</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
