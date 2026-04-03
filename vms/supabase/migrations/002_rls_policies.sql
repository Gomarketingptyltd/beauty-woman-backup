-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_package_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's agent_id
CREATE OR REPLACE FUNCTION get_my_agent_id()
RETURNS UUID AS $$
    SELECT agent_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES policies
-- ============================================================
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid() OR get_my_role() IN ('admin','manager'));

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles
    FOR ALL USING (get_my_role() = 'admin');

-- ============================================================
-- AGENTS policies
-- ============================================================
-- Admin/manager: full access
CREATE POLICY "agents_admin_manager" ON agents
    FOR ALL USING (get_my_role() IN ('admin','manager'));

-- Agent: can only see their own record
CREATE POLICY "agents_self_read" ON agents
    FOR SELECT USING (
        get_my_role() = 'agent' AND
        id = get_my_agent_id()
    );

-- ============================================================
-- AGENT PACKAGE COMMISSIONS policies
-- ============================================================
CREATE POLICY "apc_admin_manager" ON agent_package_commissions
    FOR ALL USING (get_my_role() IN ('admin','manager'));

CREATE POLICY "apc_agent_read_own" ON agent_package_commissions
    FOR SELECT USING (
        get_my_role() = 'agent' AND
        agent_id = get_my_agent_id()
    );

-- ============================================================
-- TECHNICIANS policies
-- All roles can read, but agent_id column restricted via views
-- ============================================================
CREATE POLICY "technicians_read_operational" ON technicians
    FOR SELECT USING (get_my_role() IN ('admin','manager','staff'));

CREATE POLICY "technicians_read_agent" ON technicians
    FOR SELECT USING (
        get_my_role() = 'agent' AND
        agent_id = get_my_agent_id()
    );

CREATE POLICY "technicians_write_operational" ON technicians
    FOR ALL USING (get_my_role() IN ('admin','manager','staff'));

-- ============================================================
-- TECHNICIAN SHIFTS policies
-- ============================================================
CREATE POLICY "shifts_read_operational" ON technician_shifts
    FOR SELECT USING (get_my_role() IN ('admin','manager','staff'));

CREATE POLICY "shifts_write_operational" ON technician_shifts
    FOR ALL USING (get_my_role() IN ('admin','manager','staff'));

-- ============================================================
-- ROOMS policies
-- ============================================================
CREATE POLICY "rooms_read_all" ON rooms
    FOR SELECT USING (get_my_role() IN ('admin','manager','staff'));

CREATE POLICY "rooms_write_operational" ON rooms
    FOR ALL USING (get_my_role() IN ('admin','manager','staff'));

-- ============================================================
-- MEMBERS policies
-- ============================================================
CREATE POLICY "members_read_operational" ON members
    FOR SELECT USING (get_my_role() IN ('admin','manager','staff'));

CREATE POLICY "members_write_operational" ON members
    FOR ALL USING (get_my_role() IN ('admin','manager','staff'));

-- ============================================================
-- MEMBER TRANSACTIONS policies
-- ============================================================
CREATE POLICY "member_tx_read_operational" ON member_transactions
    FOR SELECT USING (get_my_role() IN ('admin','manager','staff'));

CREATE POLICY "member_tx_write_operational" ON member_transactions
    FOR INSERT USING (get_my_role() IN ('admin','manager','staff'));

-- ============================================================
-- ORDERS policies
-- Staff can read/create but not see agent fields (handled at API level)
-- ============================================================
CREATE POLICY "orders_read_operational" ON orders
    FOR SELECT USING (get_my_role() IN ('admin','manager','staff'));

CREATE POLICY "orders_insert_operational" ON orders
    FOR INSERT WITH CHECK (get_my_role() IN ('admin','manager','staff'));

CREATE POLICY "orders_update_void" ON orders
    FOR UPDATE USING (
        -- Void: only admin/manager
        (NEW.status = 'voided' AND get_my_role() IN ('admin','manager'))
        OR
        -- Other updates: admin/manager/staff
        (NEW.status != 'voided' AND get_my_role() IN ('admin','manager','staff'))
    );

-- Agent can read their own commission data
CREATE POLICY "orders_agent_commission_read" ON orders
    FOR SELECT USING (
        get_my_role() = 'agent' AND
        agent_id = get_my_agent_id()
    );
