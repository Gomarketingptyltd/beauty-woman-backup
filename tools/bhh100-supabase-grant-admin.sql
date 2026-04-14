-- bhh100.com — grant first admin in Supabase (run in SQL Editor as postgres).
-- Repo schema reference: admin_users in admin_schema.sql (adjust names if yours differ).

-- See who will receive admin (expect exactly one row)
SELECT id, email, created_at
FROM auth.users
WHERE email = 'oceannoir580@gmail.com'
   OR id = '66bbca45-5e65-47dc-96c8-47b3ea87fff2'::uuid;

-- Prefer lookup by email so Auth is source of truth
INSERT INTO public.admin_users (user_id)
SELECT u.id
FROM auth.users AS u
WHERE u.email = 'oceannoir580@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_users AS a WHERE a.user_id = u.id
  );

-- If the row must match a fixed UUID (email differs), use instead:
-- INSERT INTO public.admin_users (user_id)
-- SELECT '66bbca45-5e65-47dc-96c8-47b3ea87fff2'::uuid
-- WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = '66bbca45-5e65-47dc-96c8-47b3ea87fff2'::uuid)
--   AND NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = '66bbca45-5e65-47dc-96c8-47b3ea87fff2'::uuid);

SELECT * FROM public.admin_users;
