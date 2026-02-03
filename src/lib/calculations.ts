import { Expense, Category, BudgetStatus, InstallmentInfo } from '@/types';
import { CATEGORIES } from './constants';

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate installment value
 */
export const calculateInstallmentValue = (
    totalValue: number,
    installments: number
): number => {
    return Math.round((totalValue / installments) * 100) / 100;
};

/**
 * Get month string from date (YYYY-MM format)
 */
export const getMonthString = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

/**
 * Add months to a date and return YYYY-MM format
 */
export const addMonths = (dateStr: string, monthsToAdd: number): string => {
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() + monthsToAdd);
    return getMonthString(date);
};

/**
 * Calcula a data de fechamento baseado no vencimento e dias antes
 * Ex: Vencimento 10/Mar, 10 dias antes = Fechamento 28/Fev
 */
export const getClosingDate = (dueYear: number, dueMonth: number, dueDay: number, daysBeforeClose: number): Date => {
    const dueDate = new Date(dueYear, dueMonth - 1, dueDay);
    const closingDate = new Date(dueDate);
    closingDate.setDate(closingDate.getDate() - daysBeforeClose);
    return closingDate;
};

/**
 * Determina em qual fatura uma compra cai.
 * O vencimento é SEMPRE no mês seguinte ao mês em que a compra pode ser feita.
 * 
 * Exemplo: Vencimento dia 10, 10 dias antes fechamento
 * - Fatura de Março: vence 10/Mar, fecha 28/Fev
 *   Compras de 29/Jan até 28/Fev entram nessa fatura
 * - Fatura de Abril: vence 10/Abr, fecha 01/Mar (ou 31/Mar dependendo)
 *   Compras de 01/Mar até 31/Mar entram nessa fatura
 */
export const getBillingMonth = (
    purchaseDate: string,
    daysBeforeClose: number,
    dueDay: number = 10
): string => {
    const purchase = new Date(purchaseDate);
    const purchaseYear = purchase.getFullYear();
    const purchaseMonth = purchase.getMonth(); // 0-indexed

    // O vencimento é sempre no mês seguinte
    // Então precisamos verificar se a compra cabe no ciclo atual ou vai pro próximo

    // Testar se a compra entra na fatura do MÊS SEGUINTE ao mês da compra
    // Fatura do mês seguinte: vence dia X do mês seguinte
    let testDueMonth = purchaseMonth + 2; // +1 para mês seguinte, +1 porque é 0-indexed
    let testDueYear = purchaseYear;
    if (testDueMonth > 12) {
        testDueMonth -= 12;
        testDueYear++;
    }

    // Calcular a data de fechamento dessa fatura
    const closingDate = getClosingDate(testDueYear, testDueMonth, dueDay, daysBeforeClose);

    // Se a compra foi feita ANTES ou NO fechamento, entra nessa fatura
    if (purchase <= closingDate) {
        return `${testDueYear}-${String(testDueMonth).padStart(2, '0')}`;
    }

    // Senão, vai para a fatura do mês seguinte
    let nextDueMonth = testDueMonth + 1;
    let nextDueYear = testDueYear;
    if (nextDueMonth > 12) {
        nextDueMonth = 1;
        nextDueYear++;
    }

    return `${nextDueYear}-${String(nextDueMonth).padStart(2, '0')}`;
};

/**
 * Adiciona meses ao mês de fatura (não à data da compra)
 */
export const addBillingMonths = (billingMonth: string, monthsToAdd: number): string => {
    const [year, month] = billingMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + monthsToAdd, 1);
    return getMonthString(date);
};

/**
 * Get installments that fall in a specific billing month
 */
export const getInstallmentsForMonth = (
    expenses: Expense[],
    targetMonth: string,
    closingDay: number = 10,
    dueDay: number = 10
): InstallmentInfo[] => {
    const installments: InstallmentInfo[] = [];

    expenses.forEach((expense) => {
        if (expense.installments <= 1) return;

        // Determinar o mês da primeira fatura baseado no dia de fechamento e vencimento
        const firstBillingMonth = getBillingMonth(expense.purchaseDate, closingDay, dueDay);

        for (let i = 0; i < expense.installments; i++) {
            const installmentBillingMonth = addBillingMonths(firstBillingMonth, i);

            if (installmentBillingMonth === targetMonth) {
                installments.push({
                    expenseId: expense.id,
                    expenseItem: expense.item,
                    category: expense.category,
                    installmentNumber: i + 1,
                    totalInstallments: expense.installments,
                    value: expense.installmentValue,
                    dueMonth: installmentBillingMonth,
                });
            }
        }
    });

    return installments;
};

/**
 * Get single purchases (non-installment) for a specific billing month
 */
export const getSinglePurchasesForMonth = (
    expenses: Expense[],
    targetMonth: string,
    closingDay: number = 10,
    dueDay: number = 10
): Expense[] => {
    return expenses.filter((expense) => {
        const billingMonth = getBillingMonth(expense.purchaseDate, closingDay, dueDay);
        return billingMonth === targetMonth && expense.installments === 1;
    });
};

/**
 * Calculate total spent in a billing month (single purchases + installments)
 */
export const calculateMonthlyTotal = (
    expenses: Expense[],
    targetMonth: string,
    closingDay: number = 10,
    dueDay: number = 10
): number => {
    // Single purchases
    const singlePurchases = getSinglePurchasesForMonth(expenses, targetMonth, closingDay, dueDay);
    const singleTotal = singlePurchases.reduce((sum, exp) => sum + exp.totalValue, 0);

    // Installments from previous purchases
    const installments = getInstallmentsForMonth(expenses, targetMonth, closingDay, dueDay);
    const installmentTotal = installments.reduce((sum, inst) => sum + inst.value, 0);

    // First installments of new installment purchases this billing month
    const installmentPurchasesThisMonth = expenses.filter((expense) => {
        const billingMonth = getBillingMonth(expense.purchaseDate, closingDay, dueDay);
        return billingMonth === targetMonth && expense.installments > 1;
    });
    const firstInstallmentTotal = installmentPurchasesThisMonth.reduce(
        (sum, exp) => sum + exp.installmentValue,
        0
    );

    return singleTotal + installmentTotal;
};

/**
 * Calculate future commitments (installments in future billing months)
 */
export const calculateFutureCommitments = (
    expenses: Expense[],
    currentMonth: string,
    closingDay: number = 10,
    dueDay: number = 10
): number => {
    let total = 0;

    expenses.forEach((expense) => {
        if (expense.installments <= 1) return;

        const firstBillingMonth = getBillingMonth(expense.purchaseDate, closingDay, dueDay);

        for (let i = 0; i < expense.installments; i++) {
            const installmentBillingMonth = addBillingMonths(firstBillingMonth, i);
            if (installmentBillingMonth > currentMonth) {
                total += expense.installmentValue;
            }
        }
    });

    return total;
};

/**
 * Calculate budget status for a billing month
 */
export const calculateBudgetStatus = (
    expenses: Expense[],
    monthlyBudget: number,
    targetMonth: string,
    closingDay: number = 10,
    dueDay: number = 10
): BudgetStatus => {
    const totalSpent = calculateMonthlyTotal(expenses, targetMonth, closingDay, dueDay);
    const futureCommitments = calculateFutureCommitments(expenses, targetMonth, closingDay, dueDay);
    const available = monthlyBudget - totalSpent;
    const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 100) {
        status = 'danger';
    } else if (percentage >= 80) {
        status = 'warning';
    }

    return {
        budget: monthlyBudget,
        totalSpent,
        futureCommitments,
        available,
        percentage,
        status,
    };
};

/**
 * Group expenses by category for a specific billing month
 */
export const groupExpensesByCategory = (
    expenses: Expense[],
    targetMonth: string,
    closingDay: number = 10,
    dueDay: number = 10
): Record<string, number> => {
    const result: Record<string, number> = {
        essencial: 0,
        lazer: 0,
        transporte: 0,
        alimentacao: 0,
        saude: 0,
        educacao: 0,
        moradia: 0,
        outros: 0,
    };

    // Single purchases
    const singlePurchases = getSinglePurchasesForMonth(expenses, targetMonth, closingDay, dueDay);
    singlePurchases.forEach((exp) => {
        result[exp.category] += exp.totalValue;
    });

    // Installments
    const installments = getInstallmentsForMonth(expenses, targetMonth, closingDay, dueDay);
    installments.forEach((inst) => {
        result[inst.category] += inst.value;
    });

    // First installments of purchases this billing month
    expenses
        .filter((expense) => {
            const billingMonth = getBillingMonth(expense.purchaseDate, closingDay, dueDay);
            return billingMonth === targetMonth && expense.installments > 1;
        })
        .forEach((exp) => {
            result[exp.category] += exp.installmentValue;
        });

    return result;
};

/**
 * Get all expenses that affect a specific billing month
 */
export const getExpensesForMonth = (
    expenses: Expense[],
    targetMonth: string,
    closingDay: number = 10,
    dueDay: number = 10
): (Expense & { installmentInfo?: { current: number; total: number } })[] => {
    const result: (Expense & { installmentInfo?: { current: number; total: number } })[] = [];

    expenses.forEach((expense) => {
        const firstBillingMonth = getBillingMonth(expense.purchaseDate, closingDay, dueDay);

        if (expense.installments === 1) {
            // Single purchase - only show in its billing month
            if (firstBillingMonth === targetMonth) {
                result.push(expense);
            }
        } else {
            // Installment purchase - check each installment's billing month
            for (let i = 0; i < expense.installments; i++) {
                const installmentBillingMonth = addBillingMonths(firstBillingMonth, i);
                if (installmentBillingMonth === targetMonth) {
                    result.push({
                        ...expense,
                        installmentInfo: {
                            current: i + 1,
                            total: expense.installments,
                        },
                    });
                    break;
                }
            }
        }
    });

    return result.sort(
        (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
};

/**
 * Format month string for display as "Fatura de Mês Ano"
 */
export const formatMonthDisplay = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
};

/**
 * Get billing period description
 * Exemplo: Fatura de Março (vence 10/03)
 * - Fechamento é X dias antes do vencimento
 */
export const getBillingPeriodDescription = (
    billingMonth: string,
    daysBeforeClose: number,
    dueDay: number
): string => {
    const [dueYear, dueMonth] = billingMonth.split('-').map(Number);

    // Calcular data de vencimento e fechamento
    const dueDate = new Date(dueYear, dueMonth - 1, dueDay);
    const closingDate = getClosingDate(dueYear, dueMonth, dueDay, daysBeforeClose);

    // Calcular data de início (dia após fechamento do ciclo anterior)
    // O ciclo anterior fechou daysBeforeClose dias antes do vencimento do mês anterior
    let prevDueMonth = dueMonth - 1;
    let prevDueYear = dueYear;
    if (prevDueMonth < 1) {
        prevDueMonth = 12;
        prevDueYear--;
    }
    const prevClosingDate = getClosingDate(prevDueYear, prevDueMonth, dueDay, daysBeforeClose);
    const startDate = new Date(prevClosingDate);
    startDate.setDate(startDate.getDate() + 1);

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return `Compras de ${formatDate(startDate)} a ${formatDate(closingDate)} • Vence ${formatDate(dueDate)}`;
};

/**
 * Get the week number of the month (1-5)
 */
export const getWeekOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

/**
 * Get start and end dates of a week in a month
 */
export const getWeekRange = (year: number, month: number, weekNumber: number): { start: Date; end: Date } => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Find the first day of the target week
    const firstDayOfWeek = firstDay.getDay();
    let weekStart = 1 - firstDayOfWeek + (weekNumber - 1) * 7;
    if (weekStart < 1) weekStart = 1;

    let weekEnd = weekStart + 6;
    if (weekEnd > lastDay.getDate()) weekEnd = lastDay.getDate();

    return {
        start: new Date(year, month, Math.max(1, weekStart)),
        end: new Date(year, month, weekEnd)
    };
};

/**
 * Get current week's start and end dates
 */
export const getCurrentWeekRange = (): { start: Date; end: Date; weekNumber: number } => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Calculate start of week (Sunday)
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    // Calculate end of week (Saturday)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
        start,
        end,
        weekNumber: getWeekOfMonth(today)
    };
};

/**
 * Calculate weekly spending (based on actual purchase dates, not billing month)
 */
export const calculateWeeklySpending = (
    expenses: Expense[],
    weekStart: Date,
    weekEnd: Date
): number => {
    return expenses.reduce((total, expense) => {
        const purchaseDate = new Date(expense.purchaseDate);
        purchaseDate.setHours(12, 0, 0, 0); // Normalize time

        if (purchaseDate >= weekStart && purchaseDate <= weekEnd) {
            // For installments, count the installment value; for single purchases, count total
            if (expense.installments > 1) {
                return total + expense.installmentValue;
            }
            return total + expense.totalValue;
        }
        return total;
    }, 0);
};

/**
 * Get weekly status with budget information
 */
export const getWeeklyStatus = (
    expenses: Expense[],
    weeklyBudget: number
): {
    weekNumber: number;
    weekStart: string;
    weekEnd: string;
    budget: number;
    spent: number;
    available: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
} => {
    const { start, end, weekNumber } = getCurrentWeekRange();
    const spent = calculateWeeklySpending(expenses, start, end);
    const available = weeklyBudget - spent;
    const percentage = weeklyBudget > 0 ? (spent / weeklyBudget) * 100 : 0;

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 100) {
        status = 'danger';
    } else if (percentage >= 80) {
        status = 'warning';
    }

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return {
        weekNumber,
        weekStart: formatDate(start),
        weekEnd: formatDate(end),
        budget: weeklyBudget,
        spent,
        available,
        percentage,
        status
    };
};

