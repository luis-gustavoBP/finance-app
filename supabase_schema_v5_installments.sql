-- Schema V5: Installment Logic using RPC

-- Function to create transactions with installments
-- Handles the logic of respecting card closing days
CREATE OR REPLACE FUNCTION public.create_installment_transactions(
  p_description text,
  p_amount_cents integer,
  p_category_id uuid,
  p_card_id uuid,
  p_installments_count integer,
  p_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_closing_day integer;
  v_transaction_date date;
  v_installment_amount integer;
  v_remainder integer;
  v_current_amount integer;
  i integer;
  v_base_date date;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get card closing day
  IF p_card_id IS NOT NULL THEN
    SELECT closing_day INTO v_closing_day
    FROM public.cards
    WHERE id = p_card_id AND user_id = v_user_id;
  END IF;

  -- Calculate base date for installments
  v_transaction_date := p_date;
  
  -- If card has closing day and transaction is on/after it, move to next month
  IF v_closing_day IS NOT NULL AND EXTRACT(DAY FROM v_transaction_date) >= v_closing_day THEN
    v_base_date := v_transaction_date + interval '1 month';
  ELSE
    v_base_date := v_transaction_date;
  END IF;

  -- Calculate installment amounts
  -- We split the total equally, and add the remainder to the first installment
  v_installment_amount := p_amount_cents / p_installments_count;
  v_remainder := p_amount_cents % p_installments_count;

  -- Loop to create installments
  FOR i IN 1..p_installments_count LOOP
    -- Add remainder to first installment
    IF i = 1 THEN
      v_current_amount := v_installment_amount + v_remainder;
    ELSE
      v_current_amount := v_installment_amount;
    END IF;

    -- Calculate date for this installment
    -- We keep the same day of month, just increment the month
    -- (The base_date logic above already handled the closing day shift)
    
    INSERT INTO public.transactions (
      user_id,
      card_id,
      category_id,
      description,
      amount_cents,
      posted_at,
      installments,
      installment_number,
      created_at
    )
    VALUES (
      v_user_id,
      p_card_id,
      p_category_id,
      p_description,
      v_current_amount,
      -- Increment month for each subsequent installment
      -- i=1 is base_date + 0 months
      -- i=2 is base_date + 1 month, etc.
      (v_base_date + ((i - 1) || ' months')::interval)::date,
      p_installments_count,
      i,
      now()
    );
  END LOOP;
END;
$$;
