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
import { ExportButton } from '@/components/export/ExportButton';
import { SubscriptionsManager } from '@/components/settings/SubscriptionsManager';

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
        <div className="min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Configurações e Metas
                    </h1>
                    <p className="text-slate-200 mt-1">Defina suas metas financeiras mensais e semanais</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monthly Budget - Purple */}
                    <Card className="glass-panel bg-purple-600/20 border-purple-500/30 text-white shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">💵</span>
                                <span className="text-purple-200 text-lg font-medium">Orçamento Mensal</span>
                            </div>
                            <p className="text-5xl font-bold mb-2">
                                {formatCents(monthlyLimit)}
                            </p>
                            <p className="text-sm text-purple-200 opacity-90">Meta de gastos do mês</p>
                        </CardContent>
                    </Card>

                    {/* Weekly Goal - Blue */}
                    <Card className="glass-panel bg-blue-600/20 border-blue-500/30 text-white shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">📈</span>
                                <span className="text-blue-200 text-lg font-medium">Meta Semanal</span>
                            </div>
                            <p className="text-5xl font-bold mb-2">
                                {formatCents(weeklyGoal)}
                            </p>
                            <p className="text-sm text-blue-200 opacity-90">Objetivo de gastos por semana</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Adjust Goals Section */}
                <Card className="glass-panel text-white">
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
                                <p className="text-xs text-slate-400 mt-1">
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
                <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-lg p-4">
                    <p className="text-sm text-blue-200">
                        💡 <strong>Dica:</strong> Estabeleça uma meta de gastos por semana
                        para acompanhar seu progresso e manter o controle financeiro no dia a dia.
                    </p>
                </div>

                {/* Weekly Goal Component */}
                <WeeklyGoal />

                {/* Subscriptions Manager */}
                <SubscriptionsManager />

                {/* Category Management */}
                <CategoryManager />

                {/* Card Configuration */}
                <CardConfig />

                {/* Data Management */}
                <Card className="glass-panel text-white">
                    <CardHeader>
                        <CardTitle>📊 Dados e Backup</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-white">Exportar Dados</h3>
                                <p className="text-sm text-slate-400">Baixe suas transações em formato CSV.</p>
                            </div>
                            <ExportButton />
                        </div>
                    </CardContent>
                </Card>

                {/* Account Settings */}
                <Card className="glass-panel text-white border-red-500/30">
                    <CardHeader>
                        <CardTitle className="text-red-400">👤 Conta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-400">Logado como: {user?.email}</p>
                        <Button
                            variant="ghost"
                            className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 min-h-[48px] justify-center"
                            onClick={signOut}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair da Conta
                        </Button>
                    </CardContent>
                </Card>

                {!settings && (
                    <div className="p-4 bg-amber-50 text-amber-700 rounded-lg text-sm">
                        ⚠️ Nota: Se as configurações não forem salvas, verifique se executou as migrações SQL (V4, V5, V6) no Supabase.
                    </div>
                )}
            </div>
        </div>
    );
}
