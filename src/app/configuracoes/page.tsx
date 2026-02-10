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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <span className="text-sm text-white/30">Carregando ajustes...</span>
                </div>
            </div>
        );
    }

    const monthlyLimit = settings?.global_monthly_limit_cents || 0;
    const weeklyGoal = settings?.weekly_goal_cents || 0;

    return (
        <div className="min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-in">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                        Configurações
                    </h1>
                    <p className="text-sm text-white/30 mt-0.5">Metas financeiras e preferências</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Monthly Budget */}
                    <Card className="!bg-gradient-to-br from-violet-500/[0.08] to-transparent !border-violet-500/[0.12]">
                        <CardContent className="pt-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">💵</span>
                                <span className="text-[11px] font-semibold text-violet-400/60 uppercase tracking-wider">Orçamento Mensal</span>
                            </div>
                            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                                {formatCents(monthlyLimit)}
                            </p>
                            <p className="text-[12px] text-white/25">Meta de gastos do mês</p>
                        </CardContent>
                    </Card>

                    {/* Weekly Goal */}
                    <Card className="!bg-gradient-to-br from-blue-500/[0.08] to-transparent !border-blue-500/[0.12]">
                        <CardContent className="pt-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">📈</span>
                                <span className="text-[11px] font-semibold text-blue-400/60 uppercase tracking-wider">Meta Semanal</span>
                            </div>
                            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                                {formatCents(weeklyGoal)}
                            </p>
                            <p className="text-[12px] text-white/25">Objetivo por semana</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Adjust Goals Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ajustar Metas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Orçamento Mensal (R$)"
                                    value={globalLimit}
                                    onChange={(e) => {
                                        const cents = parseCurrencyInput(e.target.value);
                                        setGlobalLimit(formatCurrencyInputValue(cents));
                                    }}
                                    placeholder="0,00"
                                />
                                <p className="text-[11px] text-white/20 mt-1.5">
                                    Limite total de gastos para o mês
                                </p>
                            </div>
                        </div>

                        <Button onClick={handleSave} variant="primary" size="sm">
                            Salvar Metas
                        </Button>
                    </CardContent>
                </Card>

                {/* Tips */}
                <div className="bg-indigo-500/[0.04] border border-indigo-400/[0.08] rounded-xl p-4">
                    <p className="text-[13px] text-white/40">
                        💡 <strong className="text-white/50">Dica:</strong> Estabeleça uma meta de gastos por semana
                        para acompanhar seu progresso e manter o controle financeiro no dia a dia.
                    </p>
                </div>

                <WeeklyGoal />
                <SubscriptionsManager />
                <CategoryManager />
                <CardConfig />

                {/* Data Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados e Backup</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-white/70 text-sm">Exportar Dados</h3>
                                <p className="text-[12px] text-white/25">Baixe suas transações em CSV</p>
                            </div>
                            <ExportButton />
                        </div>
                    </CardContent>
                </Card>

                {/* Account Settings */}
                <Card className="!border-white/[0.04]">
                    <CardHeader>
                        <CardTitle>Conta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-[13px] text-white/25">Logado como: {user?.email}</p>
                        <Button
                            variant="ghost"
                            className="w-full text-red-400/70 hover:bg-red-400/[0.06] hover:text-red-400 min-h-[48px] justify-center rounded-xl"
                            onClick={signOut}
                        >
                            <svg className="w-[18px] h-[18px] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair da Conta
                        </Button>
                    </CardContent>
                </Card>

                {!settings && (
                    <div className="p-4 bg-amber-500/[0.04] border border-amber-400/[0.08] text-white/40 rounded-xl text-[13px]">
                        ⚠️ Nota: Se as configurações não forem salvas, verifique se executou as migrações SQL no Supabase.
                    </div>
                )}
            </div>
        </div>
    );
}
