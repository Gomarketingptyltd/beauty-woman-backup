-- ============================================================
-- Additional RPC Functions
-- ============================================================

-- Lookup email by username (used by login flow)
-- Reads from profiles.username, returns the corresponding auth email.
-- Uses SECURITY DEFINER so anon callers can resolve usernames.
CREATE OR REPLACE FUNCTION lookup_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE username = p_username
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT email INTO v_email
    FROM auth.users
    WHERE id = v_user_id;

    RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Atomic topup: inserts transaction + updates balance in a single call
CREATE OR REPLACE FUNCTION topup_member_balance(
    p_member_id UUID,
    p_principal_delta INTEGER,
    p_reward_delta INTEGER,
    p_created_by UUID,
    p_note TEXT DEFAULT '充值'
)
RETURNS void AS $$
BEGIN
    -- Update balance
    UPDATE members
    SET
        principal_cents = principal_cents + p_principal_delta,
        reward_cents    = reward_cents    + p_reward_delta
    WHERE id = p_member_id;

    -- Record transaction
    INSERT INTO member_transactions (
        member_id, tx_type, principal_delta, reward_delta, created_by, note
    ) VALUES (
        p_member_id, 'topup', p_principal_delta, p_reward_delta, p_created_by, p_note
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
