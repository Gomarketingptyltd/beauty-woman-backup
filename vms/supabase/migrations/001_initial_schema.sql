-- ============================================================
-- Ocean Noir VMS — Initial Schema
-- Execute in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- AGENTS (中介)
-- ============================================================
CREATE TABLE IF NOT EXISTS agents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    bio                 TEXT,
    contact             JSONB NOT NULL DEFAULT '{}',
    default_commission  INTEGER NOT NULL DEFAULT 2000, -- AUD cents, default $20
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AGENT PACKAGE COMMISSIONS (中介按套餐提成规则)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_package_commissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id            UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    package_key         TEXT NOT NULL CHECK(package_key IN (
                            'QUICK_BLISS','STEAM_SANCTUARY','SILK_ROAD_AQUA',
                            'DEEP_SPA_RITUAL','BLACK_GOLD_SOVEREIGN'
                        )),
    commission_amount   INTEGER NOT NULL, -- AUD cents
    UNIQUE(agent_id, package_key)
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        TEXT UNIQUE NOT NULL,
    display_name    TEXT,
    role            TEXT NOT NULL DEFAULT 'staff'
                    CHECK(role IN ('admin','manager','staff','agent')),
    agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
    phone           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TECHNICIANS (技师)
-- ============================================================
CREATE TABLE IF NOT EXISTS technicians (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                TEXT UNIQUE NOT NULL, -- T001, T002...
    name                TEXT NOT NULL,
    age                 INTEGER,
    body                TEXT,
    cup_size            TEXT,
    height              TEXT,
    language            TEXT[] NOT NULL DEFAULT '{}',
    type                TEXT,
    speciality          TEXT,
    starting_price      TEXT, -- e.g. "$200起"
    holder_description  TEXT,
    photos              TEXT[] NOT NULL DEFAULT '{}', -- up to 4 Supabase Storage URLs
    status              TEXT NOT NULL DEFAULT 'off'
                        CHECK(status IN ('available','busy','break','off')),
    agent_id            UUID REFERENCES agents(id) ON DELETE SET NULL,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TECHNICIAN SHIFTS (签到签退)
-- ============================================================
CREATE TABLE IF NOT EXISTS technician_shifts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_id   UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    business_day    TEXT NOT NULL, -- YYYY-MM-DD
    checked_in_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_out_at  TIMESTAMPTZ,
    paused_at       TIMESTAMPTZ,
    resumed_at      TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'working'
                    CHECK(status IN ('working','paused','completed')),
    created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROOMS (房间)
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        TEXT UNIQUE NOT NULL, -- S01-S15, W1, PUB
    room_type   TEXT NOT NULL CHECK(room_type IN ('service','waiting','public')),
    status      TEXT NOT NULL DEFAULT 'free'
                CHECK(status IN ('free','occupied','cleaning','maintenance')),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ============================================================
-- MEMBERS (会员)
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                    TEXT UNIQUE NOT NULL, -- 4-digit zero-padded
    display_name            TEXT NOT NULL,
    phone                   TEXT,
    contact_other           TEXT,
    tier                    TEXT NOT NULL DEFAULT 'Casual'
                            CHECK(tier IN ('Casual','Standard','VIP','Board')),
    principal_cents         INTEGER NOT NULL DEFAULT 0,
    reward_cents            INTEGER NOT NULL DEFAULT 0,
    annual_fee_paid         BOOLEAN NOT NULL DEFAULT false,
    annual_fee_expires_at   TIMESTAMPTZ,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEMBER TRANSACTIONS (会员流水)
-- ============================================================
CREATE TABLE IF NOT EXISTS member_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    tx_type         TEXT NOT NULL
                    CHECK(tx_type IN ('topup','spend','cashback','referral','void','adjust','annual_fee')),
    principal_delta INTEGER NOT NULL DEFAULT 0, -- positive=credit, negative=debit
    reward_delta    INTEGER NOT NULL DEFAULT 0,
    order_id        UUID, -- set after orders table exists
    note            TEXT,
    created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS (订单)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no                TEXT UNIQUE NOT NULL, -- ON-YYYYMMDD-NNNN
    business_day            TEXT NOT NULL, -- YYYY-MM-DD
    member_id               UUID REFERENCES members(id) ON DELETE SET NULL,
    is_new_customer         BOOLEAN NOT NULL DEFAULT false,
    technician_id           UUID NOT NULL REFERENCES technicians(id),
    room_id                 UUID NOT NULL REFERENCES rooms(id),
    staff_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
    package_key             TEXT NOT NULL CHECK(package_key IN (
                                'QUICK_BLISS','STEAM_SANCTUARY','SILK_ROAD_AQUA',
                                'DEEP_SPA_RITUAL','BLACK_GOLD_SOVEREIGN'
                            )),
    duration_minutes        INTEGER NOT NULL,
    total_cents             INTEGER NOT NULL,
    commission_cents        INTEGER NOT NULL, -- technician 60%
    agent_id                UUID REFERENCES agents(id) ON DELETE SET NULL, -- restricted
    agent_commission_cents  INTEGER NOT NULL DEFAULT 0, -- restricted
    principal_used_cents    INTEGER NOT NULL DEFAULT 0,
    reward_used_cents       INTEGER NOT NULL DEFAULT 0,
    cash_paid_cents         INTEGER NOT NULL DEFAULT 0,
    payment_method          TEXT NOT NULL DEFAULT 'cash'
                            CHECK(payment_method IN ('cash','member_account','split')),
    status                  TEXT NOT NULL DEFAULT 'paid'
                            CHECK(status IN ('draft','paid','voided')),
    note                    TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at                 TIMESTAMPTZ,
    voided_by               UUID REFERENCES profiles(id) ON DELETE SET NULL,
    void_reason             TEXT,
    voided_at               TIMESTAMPTZ
);

-- Add FK from member_transactions to orders
ALTER TABLE member_transactions
    ADD CONSTRAINT fk_member_transactions_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_agent ON technicians(agent_id);
CREATE INDEX IF NOT EXISTS idx_shifts_tech_day ON technician_shifts(technician_id, business_day);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON technician_shifts(status);
CREATE INDEX IF NOT EXISTS idx_orders_business_day ON orders(business_day);
CREATE INDEX IF NOT EXISTS idx_orders_technician ON orders(technician_id);
CREATE INDEX IF NOT EXISTS idx_orders_member ON orders(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_agent ON orders(agent_id);
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_code ON members(code);
CREATE INDEX IF NOT EXISTS idx_member_tx_member ON member_transactions(member_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_technicians_updated_at
    BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        NEW.raw_user_meta_data->>'display_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
