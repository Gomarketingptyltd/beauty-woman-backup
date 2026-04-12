-- 百花汇 (bhh100.com) — 在 Supabase SQL Editor 中执行
-- 依赖：Supabase 已启用 Auth（auth.users）

-- ---------------------------------------------------------------------------
-- 扩展
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 枚举类型
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.verification_status as enum ('pending', 'verified', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ad_status as enum ('active', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.recharge_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- profiles：一人一号；对外展示资料与联系方式（平台不介入交易）
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  age smallint,
  height_cm smallint,
  weight_kg smallint,
  bust text,
  nationality text,
  area text not null default '其它',
  bio text,
  verification_status public.verification_status not null default 'pending',
  verification_photo_url text,
  avatar_url text,
  -- 直接联系方式（首页/详情展示，无站内信）
  wechat text,
  telegram text,
  whatsapp text,
  phone text,
  -- 卡片展示：平台发布费固定 $10/24h；此字段可存「展示价」或备注价（默认 10）
  listing_price_aud numeric(10, 2) not null default 10,
  today_online boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_area_idx on public.profiles (area);
create index if not exists profiles_verification_idx on public.profiles (verification_status);
create index if not exists profiles_today_online_idx on public.profiles (today_online) where today_online = true;

-- ---------------------------------------------------------------------------
-- profile_images：详情轮播（存储 bucket 路径或公开 URL）
-- ---------------------------------------------------------------------------
create table if not exists public.profile_images (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists profile_images_profile_idx on public.profile_images (profile_id, sort_order);

-- ---------------------------------------------------------------------------
-- ads：广告时段（活跃 / 过期）
-- ---------------------------------------------------------------------------
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.ad_status not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (profile_id)
);

create index if not exists ads_status_ended_idx on public.ads (status, ended_at desc);

-- ---------------------------------------------------------------------------
-- credits：点数余额（1 点 = 1 天广告费，与业务规则对齐）
-- ---------------------------------------------------------------------------
create table if not exists public.credits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- credit_ledger：点数流水（可选，便于对账；发布广告时写入）
-- ---------------------------------------------------------------------------
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,
  reason text not null,
  ref_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- comments：详情页评论
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  author_display text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_profile_idx on public.comments (profile_id, created_at desc);

-- ---------------------------------------------------------------------------
-- recharge_requests：充值申请（收款码 + 用户上传截图 + 后台审核）
-- ---------------------------------------------------------------------------
create table if not exists public.recharge_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  credits_requested integer not null check (credits_requested > 0),
  payment_screenshot_url text not null,
  status public.recharge_status not null default 'pending',
  admin_note text,
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists recharge_requests_user_idx on public.recharge_requests (user_id, created_at desc);
create index if not exists recharge_requests_status_idx on public.recharge_requests (status);

-- ---------------------------------------------------------------------------
-- updated_at 触发器
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists credits_set_updated_at on public.credits;
create trigger credits_set_updated_at
  before update on public.credits
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 新用户：自动创建 profiles / credits 占位（需在应用注册时写入 slug 等，或使用默认）
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
begin
  base_slug := 'user-' || substr(replace(new.id::text, '-', ''), 1, 12);
  insert into public.profiles (id, slug, display_name)
  values (
    new.id,
    base_slug,
    coalesce(new.raw_user_meta_data->>'display_name', '新用户')
  )
  on conflict (id) do nothing;

  insert into public.credits (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profile_images enable row level security;
alter table public.ads enable row level security;
alter table public.credits enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.comments enable row level security;
alter table public.recharge_requests enable row level security;

-- profiles：所有人可读已验证且广告未过期可由业务层过滤；此处开放公开读简化首页（生产请收紧）
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- profile_images
create policy "profile_images_select_public"
  on public.profile_images for select
  using (true);

create policy "profile_images_write_own"
  on public.profile_images for all
  using (
    exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
  )
  with check (
    exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
  );

-- ads
create policy "ads_select_public"
  on public.ads for select
  using (true);

create policy "ads_write_own"
  on public.ads for all
  using (
    exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
  )
  with check (
    exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
  );

-- credits：本人只读；余额变更建议仅用 service_role 或 security definer 函数
create policy "credits_select_own"
  on public.credits for select
  using (auth.uid() = user_id);

-- credit_ledger
create policy "credit_ledger_select_own"
  on public.credit_ledger for select
  using (auth.uid() = user_id);

-- comments：公开读；登录用户可发（可按需改为匿名）
create policy "comments_select_public"
  on public.comments for select
  using (true);

create policy "comments_insert_authenticated"
  on public.comments for insert
  with check (auth.uid() is not null);

-- recharge_requests
create policy "recharge_select_own"
  on public.recharge_requests for select
  using (auth.uid() = user_id);

create policy "recharge_insert_own"
  on public.recharge_requests for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage（在 Dashboard 创建 bucket 后，将 bucket 名替换为 ad-images）
-- 在 SQL 中可启用 policies，例如：
-- insert into storage.buckets (id, name, public) values ('ad-images', 'ad-images', true);
-- 然后为 storage.objects 添加基于 (storage.foldername(name))[1] = auth.uid()::text 的策略
-- ---------------------------------------------------------------------------
comment on table public.profiles is '百花汇用户公开资料与联系方式，一人一号';
comment on table public.ads is '广告投放时段：活跃/过期';
comment on table public.credits is '广告点数：1 点 = 1 天';
comment on table public.recharge_requests is '充值申请与审核';
