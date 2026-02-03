'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { parseCurrencyInput, formatCurrencyInputValue } from '@/lib/utils';

export function WeeklyGoal() {
    const { settings, updateSettings, isLoading } = useSettings();
    const [weeklyGoal, setWeeklyGoal] = useState('');

    useEffect(() => {
        if (settings?.weekly_goal_cents !== undefined) {
            setWeeklyGoal(formatCurrencyInputValue(settings.weekly_goal_cents));
        }
    }, [settings]);

    const handleSave = async () => {
        const goalInCents = parseCurrencyInput(weeklyGoal);
        if (isNaN(goalInCents)) {
            alert('Digite um valor válido');
            return;
        }

        try {
            await updateSettings({ weekly_goal_cents: goalInCents });
            alert('Meta semanal salva!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar meta');
        }
    };

    if (isLoading) {
        return <div className="animate-pulse">Carregando...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>🎯 Meta de Gasto Semanal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">
                    Defina um limite de gasto por semana. O sistema vai alertar quando você ultrapassar 80% e 100% da meta.
                </p>
                <p className="text-xs text-amber-600 ">
                    💡 Esta meta é independente do orçamento mensal e serve como controle adicional.
                </p>

                <Input
                    label="Limite Semanal (R$)"
                    value={weeklyGoal}
                    onChange={(e) => {
                        const cents = parseCurrencyInput(e.target.value);
                        setWeeklyGoal(formatCurrencyInputValue(cents));
                    }}
                    placeholder="0,00"
                />

                <Button onClick={handleSave}>
                    Salvar Meta Semanal
                </Button>

                {settings && settings.weekly_goal_cents > 0 && (
                    <div className="bg-green-50 p-3 rounded-md text-sm text-green-700 ">
                        ✅ Meta semanal ativa: {formatCurrencyInputValue(settings.weekly_goal_cents)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
