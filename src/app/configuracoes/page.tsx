'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CURRENCY_FORMATTER } from '@/lib/constants';

export default function ConfiguracoesPage() {
    const { settings, updateSettings, expenses } = useExpenses();
    const { darkMode, toggleDarkMode } = useTheme();
    const [budgetInput, setBudgetInput] = useState(String(settings.monthlyBudget));
    const [weeklyBudgetInput, setWeeklyBudgetInput] = useState(String(settings.weeklyBudget || 400));
    const [daysBeforeClose, setDaysBeforeClose] = useState(String(settings.daysBeforeClose || 10));
    const [dueDay, setDueDay] = useState(String(settings.dueDay || 10));
    const [saved, setSaved] = useState(false);
    const [weeklySaved, setWeeklySaved] = useState(false);
    const [cardSaved, setCardSaved] = useState(false);

    // Update states when settings change
    useEffect(() => {
        setBudgetInput(String(settings.monthlyBudget));
        setWeeklyBudgetInput(String(settings.weeklyBudget || 400));
        setDaysBeforeClose(String(settings.daysBeforeClose || 10));
        setDueDay(String(settings.dueDay || 10));
    }, [settings]);

    const handleSaveBudget = () => {
        const value = parseFloat(budgetInput.replace(',', '.'));
        if (!isNaN(value) && value > 0) {
            updateSettings({ monthlyBudget: value });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const handleSaveWeeklyBudget = () => {
        const value = parseFloat(weeklyBudgetInput.replace(',', '.'));
        if (!isNaN(value) && value > 0) {
            updateSettings({ weeklyBudget: value });
            setWeeklySaved(true);
            setTimeout(() => setWeeklySaved(false), 2000);
        }
    };

    const suggestWeeklyBudget = () => {
        const monthly = parseFloat(budgetInput.replace(',', '.'));
        if (!isNaN(monthly) && monthly > 0) {
            setWeeklyBudgetInput(String(Math.round(monthly / 4)));
        }
    };

    const handleSaveCardSettings = () => {
        const daysBefore = parseInt(daysBeforeClose);
        const due = parseInt(dueDay);

        if (daysBefore >= 1 && daysBefore <= 30 && due >= 1 && due <= 28) {
            updateSettings({ daysBeforeClose: daysBefore, dueDay: due });
            setCardSaved(true);
            setTimeout(() => setCardSaved(false), 2000);
        }
    };

    const handleExportData = () => {
        // Create CSV content
        const headers = ['Item', 'Categoria', 'Valor Total', 'Parcelas', 'Valor Parcela', 'Data da Compra'];
        const rows = expenses.map((exp) => [
            exp.item,
            exp.category,
            exp.totalValue.toFixed(2),
            exp.installments,
            exp.installmentValue.toFixed(2),
            new Date(exp.purchaseDate).toLocaleDateString('pt-BR'),
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map((row) => row.join(';')),
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `contapp-gastos-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleClearData = () => {
        if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('contapp-expenses');
            localStorage.removeItem('contapp-settings');
            window.location.reload();
        }
    };

    // Generate day options (1-28)
    const dayOptions = Array.from({ length: 28 }, (_, i) => ({
        value: String(i + 1),
        label: `Dia ${i + 1}`,
    }));

    return (
        <div className="space-y-6 animate-in max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Configurações
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Personalize seu aplicativo de controle financeiro
                </p>
            </div>

            {/* Credit Card Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>💳 Cartão de Crédito</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Configure o ciclo de fatura do seu cartão. O vencimento é sempre no mês seguinte às compras.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Dia de Vencimento
                            </label>
                            <Select
                                options={dayOptions}
                                value={dueDay}
                                onChange={(e) => setDueDay(e.target.value)}
                            />
                            <p className="text-xs text-slate-400 mt-1">do mês seguinte</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Dias antes do fechamento
                            </label>
                            <Input
                                type="number"
                                min="1"
                                max="30"
                                value={daysBeforeClose}
                                onChange={(e) => setDaysBeforeClose(e.target.value)}
                            />
                            <p className="text-xs text-slate-400 mt-1">antes do vencimento</p>
                        </div>
                    </div>

                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            💡 <strong>Exemplo:</strong>
                        </p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                            Vencimento dia <strong>{dueDay}</strong>, fecha <strong>{daysBeforeClose} dias antes</strong>.
                            <br />
                            Todas as compras de fevereiro → Fatura vence <strong>{dueDay}/03</strong> (março).
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveCardSettings}>
                            {cardSaved ? '✓ Salvo!' : 'Salvar Configurações'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Budget Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>💰 Orçamento Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Defina o valor máximo que você deseja gastar por mês.
                    </p>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value.replace(/[^\d,.-]/g, ''))}
                                placeholder="Ex: 1600,00"
                            />
                        </div>
                        <Button onClick={handleSaveBudget}>
                            {saved ? '✓ Salvo!' : 'Salvar'}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Orçamento atual: {CURRENCY_FORMATTER.format(settings.monthlyBudget)}
                    </p>
                </CardContent>
            </Card>

            {/* Weekly Budget Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>📅 Meta Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Defina uma meta de gastos por semana para maior controle.
                    </p>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={weeklyBudgetInput}
                                onChange={(e) => setWeeklyBudgetInput(e.target.value.replace(/[^\d,.-]/g, ''))}
                                placeholder="Ex: 400,00"
                            />
                        </div>
                        <Button variant="secondary" onClick={suggestWeeklyBudget}>
                            Sugerir
                        </Button>
                        <Button onClick={handleSaveWeeklyBudget}>
                            {weeklySaved ? '✓ Salvo!' : 'Salvar'}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Meta atual: {CURRENCY_FORMATTER.format(settings.weeklyBudget)} por semana
                    </p>
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            💡 <strong>Dica:</strong> Clique em "Sugerir" para calcular automaticamente baseado no orçamento mensal ÷ 4 semanas.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle>🎨 Aparência</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                                Modo Escuro
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Alterne entre tema claro e escuro
                            </p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${darkMode ? 'left-7' : 'left-1'
                                    }`}
                            >
                                {darkMode ? (
                                    <span className="flex items-center justify-center h-full">🌙</span>
                                ) : (
                                    <span className="flex items-center justify-center h-full">☀️</span>
                                )}
                            </span>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle>📁 Gerenciar Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                                Exportar Dados
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Baixe seus gastos em formato CSV/Excel
                            </p>
                        </div>
                        <Button variant="secondary" onClick={handleExportData}>
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            Exportar
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <div>
                            <p className="font-medium text-red-700 dark:text-red-300">
                                Apagar Todos os Dados
                            </p>
                            <p className="text-sm text-red-500 dark:text-red-400">
                                Remove permanentemente todos os gastos e configurações
                            </p>
                        </div>
                        <Button variant="danger" onClick={handleClearData}>
                            Apagar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* App Info */}
            <Card>
                <CardHeader>
                    <CardTitle>ℹ️ Sobre o App</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <p>
                            <strong className="text-slate-700 dark:text-slate-300">ContApp</strong> - Controle de Gastos com Parcelas
                        </p>
                        <p>Versão 1.1.0</p>
                        <p>
                            Seus dados são armazenados localmente no navegador.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
