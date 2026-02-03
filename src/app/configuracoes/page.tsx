'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { parseCurrencyInput, formatCurrencyInputValue, formatCents } from '@/lib/utils';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { CardConfig } from '@/components/settings/CardConfig';
import { WeeklyGoal } from '@/components/settings/WeeklyGoal';

export default function SettingsPage() {
    const { settings, updateSettings, isLoading } = useSettings();
    const { user, signOut } = useAuth();
    const [globalLimit, setGlobalLimit] = useState('');

    useEffect(() => {
        if (settings) {
            setGlobalLimit(formatCurrencyInputValue(settings.global_monthly_limit_cents));
        }
    }, [settings]);

    const handleSave = async () => {
        const limitInCents = parseCurrencyInput(globalLimit);
        if (isNaN(limitInCents)) return;
        await updateSettings({ global_monthly_limit_cents: limitInCents });
        alert('Configurações salvas!');
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse">Carregando ajustes...</div>;

    const monthlyLimit = settings?.global_monthly_limit_cents || 0;
    const weeklyGoal = settings?.weekly_goal_cents || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 -m-8 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        ⚙️ Configurações e Metas
                    </h1>
                    <p className="text-slate-500 mt-1">Defina suas metas financeiras mensais e semanais</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monthly Budget - Purple */}
                    <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">💵</span>
                                <span className="text-purple-100 text-lg font-medium">Orçamento Mensal</span>
                            </div>
                            <p className="text-5xl font-bold mb-2">
                                {formatCents(monthlyLimit)}
                            </p>
                            <p className="text-sm text-purple-100 opacity-90">Meta de gastos do mês</p>
                        </CardContent>
                    </Card>

                    {/* Weekly Goal - Blue */}
                    <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-none shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">📈</span>
                                <span className="text-blue-100 text-lg font-medium">Meta Semanal</span>
                            </div>
                            <p className="text-5xl font-bold mb-2">
                                {formatCents(weeklyGoal)}
                            </p>
                            <p className="text-sm text-blue-100 opacity-90">Objetivo de gastos por semana</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Adjust Goals Section */}
                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle>🎯 Ajustar Metas Financeiras</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="💰 Orçamento Mensal (R$)"
                                    value={globalLimit}
                                    onChange={(e) => {
                                        const cents = parseCurrencyInput(e.target.value);
                                        setGlobalLimit(formatCurrencyInputValue(cents));
                                    }}
                                    placeholder="0,00"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Limite total de gastos para o mês
                                </p>
                            </div>
                        </div>

                        <Button onClick={handleSave} variant="primary">
                            Salvar Metas
                        </Button>
                    </CardContent>
                </Card>

                {/* Tips Card */}
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Dica:</strong> Estabeleça uma meta de gastos por semana
                        para acompanhar seu progresso e manter o controle financeiro no dia a dia.
                    </p>
                </div>

                {/* Weekly Goal Component */}
                <WeeklyGoal />

                {/* Category Management */}
                <CategoryManager />

                {/* Card Configuration */}
                <CardConfig />

                {/* Account Settings */}
                <Card className="bg-white border-red-100 dark:border-red-900/30">
                    <CardHeader>
                        <CardTitle className="text-red-600">👤 Conta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500">Logado como: {user?.email}</p>
                        <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={signOut}>
                            Sair da Conta
                        </Button>
                    </CardContent>
                </Card>

                {!settings && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
                        ⚠️ Nota: Se as configurações não forem salvas, verifique se executou as migrações SQL (V4, V5, V6) no Supabase.
                    </div>
                )}
            </div>
        </div>
    );
}
