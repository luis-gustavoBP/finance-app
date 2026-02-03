import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function formatCents(cents: number) {
    return formatCurrency(cents / 100);
}

/**
 * Filtra apenas números de uma string
 */
export function parseCurrencyInput(value: string): number {
    return Number(value.replace(/\D/g, ''));
}

/**
 * Formata um valor em centavos para o formato de input R$ 0,00
 */
export function formatCurrencyInputValue(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(cents / 100);
}

/**
 * Parses a YYYY-MM-DD string as a local date to avoid timezone shifts
 */
export function parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Formats a YYYY-MM-DD string for display in pt-BR
 */
export function formatDate(dateString: string): string {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Calcula o mês de fatura com base na data da transação e ciclo do cartão
 */
export function calculateBillingMonth(
    transactionDate: string,
    card: { due_day: number; closing_days_before: number }
): string {
    const date = parseLocalDate(transactionDate);
    const closingDay = card.due_day - card.closing_days_before;

    let billingMonth = date.getMonth();
    let billingYear = date.getFullYear();

    if (date.getDate() > closingDay) {
        billingMonth++;
        if (billingMonth > 11) {
            billingMonth = 0;
            billingYear++;
        }
    }

    return `${billingYear}-${String(billingMonth + 1).padStart(2, '0')}`;
}

/**
 * Tipos de entrada de dinheiro
 */
export const incomeTypes = [
    { value: 'extra', label: 'Extra', icon: '💰' },
    { value: 'reembolso', label: 'Reembolso', icon: '↩️' },
    { value: 'presente', label: 'Presente', icon: '🎁' },
    { value: 'freelance', label: 'Freelance', icon: '💼' },
    { value: 'bonus', label: 'Bônus', icon: '🎯' },
    { value: 'outros', label: 'Outros', icon: '📦' },
];

/**
 * Retorna o início da semana atual (domingo)
 */
export function getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
}

/**
 * Retorna o início do mês atual
 */
export function getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Escurece uma cor hexadecimal em X%
 */
export function darken(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}
