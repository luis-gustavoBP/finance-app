// Types for ContApp - Personal Finance Control Application

export type Category =
    | 'essencial'
    | 'lazer'
    | 'transporte'
    | 'alimentacao'
    | 'saude'
    | 'educacao'
    | 'moradia'
    | 'outros';

export interface Expense {
    id: string;
    item: string;
    category: Category;
    totalValue: number;
    installments: number;
    installmentValue: number;
    purchaseDate: string; // ISO date string
    createdAt: string;
}

export interface Settings {
    monthlyBudget: number;
    weeklyBudget: number;    // Orçamento semanal
    currency: string;
    darkMode: boolean;
    daysBeforeClose: number;  // Dias antes do vencimento que a fatura fecha (ex: 10)
    dueDay: number;           // Dia de vencimento da fatura (sempre no mês seguinte)
}

export interface MonthlyData {
    month: string; // Format: YYYY-MM
    totalSpent: number;
    totalInstallments: number;
    budgetRemaining: number;
    budgetPercentage: number;
    expensesByCategory: Record<Category, number>;
}

export interface InstallmentInfo {
    expenseId: string;
    expenseItem: string;
    category: Category;
    installmentNumber: number;
    totalInstallments: number;
    value: number;
    dueMonth: string; // Format: YYYY-MM
}

export interface BudgetStatus {
    budget: number;
    totalSpent: number;
    futureCommitments: number;
    available: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
}

export interface CategoryInfo {
    id: Category;
    label: string;
    color: string;
    bgColor: string;
    icon: string;
}

export interface WeeklyStatus {
    weekNumber: number;      // Número da semana no mês (1-5)
    weekStart: string;       // Data início da semana
    weekEnd: string;         // Data fim da semana
    budget: number;          // Orçamento semanal
    spent: number;           // Gasto na semana
    available: number;       // Disponível na semana
    percentage: number;      // % usado
    status: 'safe' | 'warning' | 'danger';
}
