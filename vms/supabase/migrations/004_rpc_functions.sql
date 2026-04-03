-- ============================================================
-- RPC Functions for atomic balance operations
-- ============================================================

-- Deduct member balance atomically
CREATE OR REPLACE FUNCTION deduct_member_balance(
    p_member_id UUID,
    p_principal_delta INTEGER,  -- negative value
    p_reward_delta INTEGER,     -- negative value
    p_order_id UUID,
    p_created_by UUID
)
RETURNS void AS $$
BEGIN
    -- Update balance
    UPDATE members
    SET 
        principal_cents = principal_cents + p_principal_delta,
        reward_cents = reward_cents + p_reward_delta
    WHERE id = p_member_id;

    -- Record transaction
    INSERT INTO member_transactions (
        member_id, tx_type, principal_delta, reward_delta, order_id, created_by, note
    ) VALUES (
        p_member_id, 'spend', p_principal_delta, p_reward_delta, p_order_id, p_created_by,
        '消费扣款'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refund member balance atomically (for void)
CREATE OR REPLACE FUNCTION refund_member_balance(
    p_member_id UUID,
    p_principal_delta INTEGER,  -- positive value (refund)
    p_reward_delta INTEGER      -- positive value (refund)
)
RETURNS void AS $$
BEGIN
    UPDATE members
    SET 
        principal_cents = principal_cents + p_principal_delta,
        reward_cents = reward_cents + p_reward_delta
    WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply VIP cashback
CREATE OR REPLACE FUNCTION apply_vip_cashback(
    p_member_id UUID,
    p_order_total_cents INTEGER,
    p_order_id UUID,
    p_created_by UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_tier TEXT;
    v_steps INTEGER;
    v_cashback INTEGER;
BEGIN
    SELECT tier INTO v_tier FROM members WHERE id = p_member_id;
    
    -- Only VIP and Board get cashback
    IF v_tier NOT IN ('VIP', 'Board') THEN
        RETURN 0;
    END IF;
    
    v_steps := p_order_total_cents / 20000;  -- every $200
    v_cashback := v_steps * 1000;            -- $10 per step
    
    IF v_cashback > 0 THEN
        UPDATE members
        SET reward_cents = reward_cents + v_cashback
        WHERE id = p_member_id;
        
        INSERT INTO member_transactions (
            member_id, tx_type, reward_delta, order_id, created_by, note
        ) VALUES (
            p_member_id, 'cashback', v_cashback, p_order_id, p_created_by,
            FORMAT('消费返现：消费 $%s，返现 $%s', p_order_total_cents/100, v_cashback/100)
        );
    END IF;
    
    RETURN v_cashback;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-generate member code
CREATE OR REPLACE FUNCTION next_member_code()
RETURNS TEXT AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM members;
    RETURN LPAD((v_count + 1)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
