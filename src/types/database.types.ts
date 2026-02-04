export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    icon: string
                    color: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    icon?: string
                    color?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    icon?: string
                    color?: string
                    created_at?: string
                }
                Relationships: []
            }
            cards: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    last_four: string | null
                    color: string
                    closing_day: number | null
                    closing_days_before: number
                    due_day: number
                    is_active: boolean
                    limit_cents: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    last_four?: string | null
                    color?: string
                    closing_day?: number | null
                    closing_days_before?: number
                    due_day?: number
                    is_active?: boolean
                    limit_cents?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    last_four?: string | null
                    color?: string
                    closing_day?: number | null
                    closing_days_before?: number
                    due_day?: number
                    is_active?: boolean
                    limit_cents?: number
                    created_at?: string
                }
                Relationships: []
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    category_id: string | null
                    description: string
                    amount_cents: number
                    due_day: number
                    active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category_id?: string | null
                    description: string
                    amount_cents: number
                    due_day: number
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category_id?: string | null
                    description?: string
                    amount_cents?: number
                    due_day?: number
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    card_id: string | null
                    category_id: string | null
                    description: string
                    amount_cents: number
                    posted_at: string
                    installments: number
                    installment_number: number
                    parent_transaction_id: string | null
                    include_in_weekly_plan: boolean
                    payment_method: 'credit' | 'debit' | 'pix' | 'cash'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    card_id?: string | null
                    category_id?: string | null
                    description: string
                    amount_cents: number
                    posted_at?: string
                    installments?: number
                    installment_number?: number
                    parent_transaction_id?: string | null
                    include_in_weekly_plan?: boolean
                    payment_method?: 'credit' | 'debit' | 'pix' | 'cash'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    card_id?: string | null
                    category_id?: string | null
                    description?: string
                    amount_cents?: number
                    posted_at?: string
                    installments?: number
                    installment_number?: number
                    parent_transaction_id?: string | null
                    include_in_weekly_plan?: boolean
                    payment_method?: 'credit' | 'debit' | 'pix' | 'cash'
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "transactions_card_id_fkey"
                        columns: ["card_id"]
                        isOneToOne: false
                        referencedRelation: "cards"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
            invoices: {
                Row: {
                    id: string
                    user_id: string
                    card_id: string
                    month: number
                    year: number
                    status: 'OPEN' | 'CLOSED' | 'PAID'
                    amount_cents: number
                    paid_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    card_id: string
                    month: number
                    year: number
                    status?: 'OPEN' | 'CLOSED' | 'PAID'
                    amount_cents?: number
                    paid_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    card_id?: string
                    month?: number
                    year?: number
                    status?: 'OPEN' | 'CLOSED' | 'PAID'
                    amount_cents?: number
                    paid_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "invoices_card_id_fkey"
                        columns: ["card_id"]
                        isOneToOne: false
                        referencedRelation: "cards"
                        referencedColumns: ["id"]
                    }
                ]
            }
            income_entries: {
                Row: {
                    id: string
                    user_id: string
                    description: string
                    amount_cents: number
                    received_at: string
                    type: 'extra' | 'reembolso' | 'presente' | 'freelance' | 'bonus' | 'outros'
                    destination: 'budget' | 'savings'
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    description: string
                    amount_cents: number
                    received_at?: string
                    type: 'extra' | 'reembolso' | 'presente' | 'freelance' | 'bonus' | 'outros'
                    destination?: 'budget' | 'savings'
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    description?: string
                    amount_cents?: number
                    received_at?: string
                    type?: 'extra' | 'reembolso' | 'presente' | 'freelance' | 'bonus' | 'outros'
                    destination?: 'budget' | 'savings'
                    notes?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            user_settings: {
                Row: {
                    user_id: string
                    global_monthly_limit_cents: number
                    weekly_goal_cents: number
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    global_monthly_limit_cents?: number
                    weekly_goal_cents?: number
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    global_monthly_limit_cents?: number
                    weekly_goal_cents?: number
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            create_installment_transactions: {
                Args: {
                    p_user_id: string
                    p_card_id: string | null
                    p_category_id: string
                    p_description: string
                    p_total_amount_cents: number
                    p_installments: number

                    p_first_date: string
                    p_include_in_weekly_plan?: boolean
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
