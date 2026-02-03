-- Add column to include or not in weekly plan
ALTER TABLE transactions 
ADD COLUMN include_in_weekly_plan BOOLEAN DEFAULT true;

-- Update the RPC function to handle the new flag
CREATE OR REPLACE FUNCTION create_installment_transactions(
    p_user_id UUID,
    p_card_id UUID,
    p_category_id UUID,
    p_description TEXT,
    p_total_amount_cents INTEGER,
    p_installments INTEGER,
    p_first_date DATE,
    p_include_in_weekly_plan BOOLEAN DEFAULT true
)
RETURNS SETOF transactions AS $$
DECLARE
    v_installment_amount INTEGER;
    v_parent_id UUID;
    v_transaction transactions;
BEGIN
    -- Validate inputs
    IF p_installments < 1 THEN
        RAISE EXCEPTION 'Number of installments must be at least 1';
    END IF;
    
    IF p_total_amount_cents <= 0 THEN
        RAISE EXCEPTION 'Total amount must be positive';
    END IF;
    
    -- Calculate installment amount
    v_installment_amount := p_total_amount_cents / p_installments;
    
    -- Create installment transactions
    FOR i IN 1..p_installments LOOP
        -- First installment becomes the parent
        IF i = 1 THEN
            INSERT INTO transactions (
                user_id,
                card_id,
                category_id,
                description,
                amount_cents,
                posted_at,
                installments,
                installment_number,
                parent_transaction_id,
                include_in_weekly_plan
            ) VALUES (
                p_user_id,
                p_card_id,
                p_category_id,
                p_description,
                v_installment_amount,
                p_first_date,
                p_installments,
                1,
                NULL,
                p_include_in_weekly_plan
            )
            RETURNING * INTO v_transaction;
            
            v_parent_id := v_transaction.id;
            RETURN NEXT v_transaction;
        ELSE
            -- Subsequent installments reference the parent
            -- Note: For installments, maybe we always want them to be included? 
            -- Or follow the same setting as the parent. The user said "ao adicionar um gasto", 
            -- so we'll follow the provided setting for all installments.
            INSERT INTO transactions (
                user_id,
                card_id,
                category_id,
                description,
                amount_cents,
                posted_at,
                installments,
                installment_number,
                parent_transaction_id,
                include_in_weekly_plan
            ) VALUES (
                p_user_id,
                p_card_id,
                p_category_id,
                p_description,
                v_installment_amount,
                p_first_date + INTERVAL '1 month' * (i - 1),
                p_installments,
                i,
                v_parent_id,
                p_include_in_weekly_plan
            )
            RETURNING * INTO v_transaction;
            
            RETURN NEXT v_transaction;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
