// Central type definitions for the application
export interface Category {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    color: string;
    created_at: string;
}

export interface Card {
    id: string;
    user_id: string;
    name: string;
    last_four: string | null;
    color: string;
    limit_cents: number;
    due_day: number;
    closing_days_before: number;
    is_active: boolean;
    created_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    description: string;
    amount_cents: number;
    posted_at: string;
    category_id: string;
    card_id: string | null;
    currency: string;
    installment_group_id: string | null;
    installment_number: number | null;
    total_installments: number | null;
    created_at: string;
}

export interface IncomeEntry {
    id: string;
    user_id: string;
    description: string;
    amount_cents: number;
    received_at: string;
    income_type: string;
    notes: string | null;
    created_at: string;
}

export interface UserSettings {
    user_id: string;
    global_monthly_limit_cents: number;
    weekly_goal_cents: number;
}

// Additional types for UI
export interface TransactionWithDetails extends Transaction {
    category?: Category;
    card?: Card;
}

export interface ChartDataPoint {
    date: string;
    value: number;
    cumulative?: number;
}

export interface CategorySpending {
    category: Category;
    total: number;
    percentage: number;
}
