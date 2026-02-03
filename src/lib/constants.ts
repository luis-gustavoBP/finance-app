import { CategoryInfo, Settings } from '@/types';

export const CATEGORIES: CategoryInfo[] = [
    {
        id: 'essencial',
        label: 'Essencial',
        color: '#ef4444',
        bgColor: 'bg-red-500',
        icon: '🔴',
    },
    {
        id: 'lazer',
        label: 'Lazer',
        color: '#a855f7',
        bgColor: 'bg-purple-500',
        icon: '🟣',
    },
    {
        id: 'transporte',
        label: 'Transporte',
        color: '#3b82f6',
        bgColor: 'bg-blue-500',
        icon: '🔵',
    },
    {
        id: 'alimentacao',
        label: 'Alimentação',
        color: '#f97316',
        bgColor: 'bg-orange-500',
        icon: '🟠',
    },
    {
        id: 'saude',
        label: 'Saúde',
        color: '#22c55e',
        bgColor: 'bg-green-500',
        icon: '🟢',
    },
    {
        id: 'educacao',
        label: 'Educação',
        color: '#eab308',
        bgColor: 'bg-yellow-500',
        icon: '🟡',
    },
    {
        id: 'moradia',
        label: 'Moradia',
        color: '#78716c',
        bgColor: 'bg-stone-500',
        icon: '🟤',
    },
    {
        id: 'outros',
        label: 'Outros',
        color: '#6b7280',
        bgColor: 'bg-gray-500',
        icon: '⚪',
    },
];

export const DEFAULT_SETTINGS: Settings = {
    monthlyBudget: 1600,
    weeklyBudget: 400,    // Orçamento semanal padrão (mensal / 4)
    currency: 'BRL',
    darkMode: false,
    daysBeforeClose: 10,  // Fechamento 10 dias antes do vencimento
    dueDay: 10,           // Vencimento dia 10 do mês seguinte
};

export const CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export const getCategoryInfo = (categoryId: string): CategoryInfo => {
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
};

export const MONTHS_PT = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];
