-- ============================================================
-- 百花汇 bhh100.com - Supabase Database Schema
-- 在 Supabase SQL Editor 中运行此文件
-- ============================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 枚举类型
-- ============================================================

-- 悉尼区域枚举（仅5个核心区）
CREATE TYPE area_type AS ENUM (
  'City',
  'Burwood',
  'Hurstville',
  'Chatswood',
  '其它'
);

-- 广告状态
CREATE TYPE ad_status AS ENUM ('pending', 'active', 'expired', 'rejected');

-- 充值状态
CREATE TYPE recharge_status AS ENUM ('pending', 'approved', 'rejected');

-- 积分流水类型
CREATE TYPE credit_type AS ENUM ('recharge', 'consume', 'refund', 'bonus');

-- ============================================================
-- 1. profiles 表 - 女生档案
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  VARCHAR(50) NOT NULL,
  age                   SMALLINT CHECK (age >= 18 AND age <= 60),
  height                SMALLINT CHECK (height >= 140 AND height <= 200),   -- cm
  weight                SMALLINT CHECK (weight >= 35 AND weight <= 120),    -- kg
  bust                  VARCHAR(10),                                          -- 如 "34C"
  nationality           VARCHAR(50) DEFAULT '中国',
  area                  area_type NOT NULL DEFAULT 'City',
  bio                   TEXT,
  avatar_url            TEXT,
  photos                TEXT[] DEFAULT '{}',                                  -- 多张照片 URL
  phone                 VARCHAR(30),
  telegram              VARCHAR(100),
  wechat                VARCHAR(100),
  whatsapp              VARCHAR(30),
  price_per_day         DECIMAL(10,2) DEFAULT 10.00,
  is_verified           BOOLEAN DEFAULT FALSE,
  verification_photo_url TEXT,
  is_active             BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 2. ads 表 - 广告投放记录
-- ============================================================
CREATE TABLE IF NOT EXISTS ads (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                ad_status DEFAULT 'pending',
  starts_at             TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ,
  days                  SMALLINT DEFAULT 1 CHECK (days >= 1 AND days <= 30),
  amount_charged        DECIMAL(10,2),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 自动过期索引
CREATE INDEX idx_ads_expires_at ON ads(expires_at);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_profile_id ON ads(profile_id);

-- ============================================================
-- 3. credits 表 - 积分流水账（余额 = SUM(amount)）
-- ============================================================
CREATE TABLE IF NOT EXISTS credits (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                  credit_type NOT NULL,
  amount                DECIMAL(10,2) NOT NULL,                               -- 正数入账，负数扣费
  description           VARCHAR(200),
  related_ad_id         UUID REFERENCES ads(id),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credits_user_id ON credits(user_id);

-- ============================================================
-- 4. recharge_requests 表 - 充值申请
-- ============================================================
CREATE TABLE IF NOT EXISTS recharge_requests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount                DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  screenshot_url        TEXT NOT NULL,                                         -- 支付截图
  status                recharge_status DEFAULT 'pending',
  admin_note            TEXT,
  reviewed_at           TIMESTAMPTZ,
  reviewed_by           UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. 视图：当前有效广告（活跃状态）
-- ============================================================
CREATE OR REPLACE VIEW active_profiles AS
SELECT
  p.*,
  a.starts_at,
  a.expires_at
FROM profiles p
INNER JOIN ads a ON a.profile_id = p.id
WHERE a.status = 'active'
  AND a.expires_at > NOW()
  AND p.is_active = TRUE
ORDER BY a.starts_at DESC;

-- ============================================================
-- 6. 函数：获取用户积分余额
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0) FROM credits WHERE user_id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- ============================================================
-- 7. 函数：自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. 函数：自动过期广告（Supabase Cron 每小时调用）
-- ============================================================
CREATE OR REPLACE FUNCTION expire_ads()
RETURNS void AS $$
BEGIN
  UPDATE ads
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. Row Level Security (RLS) 策略
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_requests ENABLE ROW LEVEL SECURITY;

-- profiles: 公开可读活跃档案，本人可写
CREATE POLICY "公开读取活跃档案" ON profiles FOR SELECT USING (is_active = TRUE);
CREATE POLICY "本人更新档案" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "本人插入档案" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ads: 公开可读活跃广告，本人可管理
CREATE POLICY "公开读取活跃广告" ON ads FOR SELECT USING (status = 'active');
CREATE POLICY "本人管理广告" ON ads FOR ALL USING (auth.uid() = user_id);

-- credits: 仅本人可读
CREATE POLICY "本人读取积分" ON credits FOR SELECT USING (auth.uid() = user_id);

-- recharge_requests: 仅本人可读写
CREATE POLICY "本人管理充值申请" ON recharge_requests FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 10. Storage Buckets
-- ============================================================
-- 在 Supabase Dashboard > Storage 创建以下 buckets：
--   avatars    - 头像（公开）
--   photos     - 作品图（公开）
--   verification - 验证照片（私有）
--   recharge   - 充值截图（私有）

-- ============================================================
-- 11. 测试数据（开发用，上线前删除）
-- ============================================================
-- 注意：需要先在 Auth 创建用户，再插入 profiles
-- INSERT INTO profiles (user_id, name, age, height, weight, bust, nationality, area, bio, phone, telegram, wechat)
-- VALUES
--   ('your-auth-user-uuid', '小雨', 22, 165, 50, '34C', '中国', 'City', '温柔甜美，服务专业', '0400000001', '@xiaoyu', 'xiaoyu_wx'),
--   ('your-auth-user-uuid2', '小美', 24, 168, 52, '36D', '中国', 'Burwood', '身材好，服务周到', '0400000002', '@xiaomei', 'xiaomei_wx');
