# Ocean Noir VMS — Setup Guide

## 1. Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project: `ocean-noir-vms`
3. Choose region: `ap-southeast-2` (Sydney)
4. Save the database password

## 2. Run Database Migrations

In Supabase Dashboard → SQL Editor, run these files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_data.sql`
4. `supabase/migrations/004_rpc_functions.sql`

## 3. Get API Keys

Supabase Dashboard → Project Settings → API:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 4. Configure Storage

Supabase Dashboard → Storage → Create bucket:
- Name: `technician-photos`
- Public: ✅ Yes

## 5. Create First Admin Account

In Supabase Dashboard → SQL Editor:

```sql
-- First, create the user via Auth → Users → Add user
-- Email: admin@vms.oceannoir.internal
-- Password: (your admin password)
-- Then run:

UPDATE profiles 
SET username = 'admin', 
    display_name = '管理员', 
    role = 'admin'
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'admin@vms.oceannoir.internal'
);
```

## 6. Configure .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=https://staff.oceannoir.au
```

## 7. Deploy to Vercel

1. Push this repository to GitHub (`Morgan2026/ocean-noir-erp`)
2. Import project in [vercel.com](https://vercel.com) (bjhyn2015@gmail.com)
3. Add environment variables (same as .env.local)
4. Deploy

## 8. Bind Domain

1. In Vercel: Project → Settings → Domains → Add `staff.oceannoir.au`
2. In your DNS: Add CNAME `staff` → `cname.vercel-dns.com`

## 9. Account Login Format

All accounts use: **序号 + 密码**
- Staff: username `001`, `002`, etc.
- Manager: username `mgr01`, etc.
- Admin: username `admin`
- Agent: username set when created

## Routes

| URL | Access | Description |
|-----|--------|-------------|
| `/display` | Public | Technician display screen |
| `/login` | Public | Staff login |
| `/desk/orders` | Staff+ | New order wizard |
| `/desk/checkin` | Staff+ | Tech check-in/out |
| `/desk/members` | Staff+ | Member management |
| `/admin/reports` | Staff+ | Daily reports |
| `/admin/technicians` | Staff+ | Tech management |
| `/admin/agents` | Manager+ | Agent management |
| `/admin/accounts` | Admin only | Account management |
| `/agent/dashboard` | Agent | Agent portal |

## Contact Info

- Email: oceannoir580@gmail.com
- Phone: 0452 629 580
- Japanese Line: 0433 132 618
- LINE: @347chmhh
- WhatsApp: 0452 629 580
