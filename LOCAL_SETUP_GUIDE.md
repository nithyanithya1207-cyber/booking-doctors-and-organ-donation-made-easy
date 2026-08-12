# MediLink — Local Setup & Database Guide

This guide explains how to run the **MediLink** website, how it is connected to its backend database, how to view stored data, and how to download the project for local development.

---

## 1. Quick overview

MediLink is a full-stack healthcare app with:

- **Frontend:** React + TanStack Start (runs in the browser)
- **Backend / Database:** Lovable Cloud (managed Supabase) — already hosted and connected
- **Tables:** doctors, donors, appointments, organ_requests, notifications, profiles, user_roles

You do **not** need to install PostgreSQL or Supabase locally to use this project. The database is already live and the app is already configured to talk to it.

---

## 2. How the website is connected to the database

The connection is handled by environment variables in `.env`:

```env
VITE_SUPABASE_URL="https://yjcewxbixgsqqlbjgvtu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_KsPspuVeedz7g7qlMEWQqQ_6KVjRJXV"
VITE_SUPABASE_PROJECT_ID="yjcewxbixgsqqlbjgvtu"
SUPABASE_URL="https://yjcewxbixgsqqlbjgvtu.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_KsPspuVeedz7g7qlMEWQqQ_6KVjRJXV"
```

These keys tell the app which database to read from and write to. They are already included in the project, so the connection works immediately.

---

## 3. How to run the website in Lovable

1. Open the project in the **Lovable editor**.
2. The preview panel on the right already shows the live website.
3. You can also open the preview in a new tab at:

   ```
   https://id-preview--23e583d5-9f3d-4366-82b5-ec38eb26c24d.lovable.app
   ```

4. Click **Login / Register** and create an account to test the app.
5. After signing up, the app stores your profile in the `profiles` table and your role in the `user_roles` table automatically.

---

## 4. How to view data stored in the database

Because this project uses **Lovable Cloud**, the database is managed for you. You can inspect live data directly from the Lovable editor.

### Option A: View through the Backend UI

1. In the Lovable editor, click the **Backend** button in the top toolbar (or click **View Backend** in the publish/share panel).
2. This opens the Lovable Cloud backend interface.
3. Open the **Database / Tables** section.
4. Click any table to see its rows:
   - `doctors` — doctor profiles
   - `donors` — registered donors
   - `appointments` — booked appointments
   - `organ_requests` — organ requests
   - `notifications` — user notifications
   - `profiles` — user profiles
   - `user_roles` — assigned roles (patient, doctor, donor, admin)

### Option B: Add or edit data directly

1. In the backend table view, click **New row** to insert data manually.
2. Or open an existing row and edit its values.
3. Any change you make in the database is immediately visible in the app after a refresh.

> **Tip:** Use the table view to take screenshots for your project guide/report. The rows prove that data is really being stored in the backend.

---

## 5. How data flows through the app

| User action | What happens in the database |
|-------------|------------------------------|
| Register a new account | A new row is created in `auth.users`, `profiles`, and `user_roles` (default role = `patient`) |
| Register as a donor | A new row is created in `donors` |
| Book an appointment | A new row is created in `appointments` with status `pending` |
| Create an organ request | A new row is created in `organ_requests` |
| Admin adds a doctor | A new row is created in `doctors` |
| Appointment status changes | The `status` column in `appointments` is updated |
| Notification sent | A new row is created in `notifications` for the user |

All of this is protected by **Row Level Security (RLS)** — users can only see and edit their own data unless they are an admin.

---

## 6. How to download the project

1. In the Lovable editor, open the project.
2. Export the project as a **ZIP file** (usually via the export / download option in the editor menu).
3. Save the ZIP to your computer.
4. Extract it.
5. Open the folder in a terminal and run:

```bash
# Install dependencies
bun install

# Run the local development server
bun run dev
```

The website will open at `http://localhost:8080`.

> The `.env` file in the ZIP already contains the database keys, so the downloaded app will connect to the same live database.

---

## 7. How to make yourself an admin

After you sign up in the app, run the following SQL in the backend SQL Editor to make your account an admin:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT DO NOTHING;
```

Replace `your-email@example.com` with the email you used to register.

After this, you can open `/admin` and manage doctors, donors, and appointments.

---

## 8. Database schema (quick reference)

The full schema is in `supabase/migrations/20260812000000_medilink_schema.sql`.

Key tables:

- **profiles** — stores user name, phone, city, blood group
- **user_roles** — stores role (patient, doctor, donor, admin)
- **doctors** — doctor name, specialization, hospital, city, fee, available days
- **donors** — donor name, age, blood group, organs, city, availability
- **organ_requests** — patient request for an organ, with urgency and status
- **appointments** — booked doctor appointments, date, time, reason, status
- **notifications** — user messages and read/unread status

The schema also includes:

- A `has_role()` helper function for security
- Row Level Security (RLS) policies on every table
- A `handle_new_user()` trigger that automatically creates a profile and role when someone signs up
- Demo doctors in `supabase/seed.sql`

---

## 9. Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Preview shows a blank page | Build error | Check the editor build log or run `bun run dev` locally |
| Cannot see doctors or donors | Tables are empty | Seed demo data with `supabase/seed.sql` or add rows in the backend UI |
| Sign-up fails | Auth settings | Make sure email confirmation is enabled in the backend Auth settings |
| Admin page says "Admins only" | You do not have the `admin` role | Run the admin SQL query from section 7 |

---

## 10. Useful commands for local development

```bash
# Install dependencies
bun install

# Run the dev server
bun run dev

# Build the project for production
bun run build

# Preview the production build
bun run preview
```

---

## Summary for your project report

- **Website:** Already hosted by Lovable, accessible through the editor preview or the preview URL.
- **Database:** Lovable Cloud (managed Supabase) — already connected via the `.env` keys.
- **Data storage:** Every user action (signup, appointment, donor registration, organ request) creates real rows in the database tables.
- **Data visibility:** Use the Lovable Cloud backend UI to inspect live data, or use the local setup guide above to run the project on your own machine.

You can use the backend table view to capture screenshots of stored records and include them in your project documentation.
