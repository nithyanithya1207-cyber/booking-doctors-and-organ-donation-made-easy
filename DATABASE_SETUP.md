# MediLink — Database Setup

The complete backend schema ships with this project:

- `supabase/migrations/20260812000000_medilink_schema.sql` — tables, enums, grants, RLS policies, `has_role()` function and the signup trigger.
- `supabase/seed.sql` — 8 demo doctors so the app isn't empty on first run.

## Option A — Supabase (hosted)
1. Create a project at supabase.com.
2. Open **SQL Editor**, paste the contents of the migration file, run it.
3. Paste `supabase/seed.sql`, run it.
4. Copy Project URL + anon key into `.env`:
   ```
   VITE_SUPABASE_URL="https://<ref>.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="<anon key>"
   SUPABASE_URL="https://<ref>.supabase.co"
   SUPABASE_PUBLISHABLE_KEY="<anon key>"
   ```

## Option B — Supabase CLI (local)
```bash
supabase init      # if supabase/ config is missing
supabase start
supabase db reset  # applies migrations + seed.sql
```

## Making yourself an admin
After signing up in the app, run in SQL Editor:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
ON CONFLICT DO NOTHING;
```

## Notes
- Every table has RLS enabled; users only see their own rows, admins see all.
- `handle_new_user()` runs on signup and auto-creates a profile + `patient` role.
- Roles live in `user_roles` (never on profiles) to prevent privilege escalation.
