'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { parseCurrencyInput, formatCurrencyInputValue } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/contexts/ToastContext';

export function WeeklyGoal() {
    const { settings, updateSettings, isLoading } = useSettings();
    const { showToast } = useToast();
    const [weeklyGoal, setWeeklyGoal] = useState('');

    useEffect(() => {
        if (settings?.weekly_goal_cents !== undefined) {
            setWeeklyGoal(formatCurrencyInputValue(settings.weekly_goal_cents));
        }
    }, [settings]);

    const handleSave = async () => {
        const goalInCents = parseCurrencyInput(weeklyGoal);
        if (isNaN(goalInCents)) {
            showToast('Digite um valor válido', 'error');
            return;
        }

        try {
            await updateSettings({ weekly_goal_cents: goalInCents });
            showToast('Meta semanal salva!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar meta', 'error');
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
                <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-300">
                        Defina um limite de gasto por semana.
                    </p>
                    <Tooltip content="O sistema vai alertar quando você ultrapassar 80% e 100% da meta. Esta meta é independente do orçamento mensal e serve como controle adicional." />
                </div>

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
                    <div className="bg-emerald-500/10 p-3 rounded-md text-sm text-emerald-400 border border-emerald-500/20">
                        ✅ Meta semanal ativa: {formatCurrencyInputValue(settings.weekly_goal_cents)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
