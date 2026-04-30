# Veloura — Order Management System

A full-stack order management system built with Next.js and Supabase for managing fashion orders via WhatsApp.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts

---

## Project Structure

```
app/
├── page.tsx                        # Landing page
├── order/page.tsx                  # Public order form
├── thanks/page.tsx                 # Order confirmation
├── admin-login/page.tsx            # Admin login
└── dashboard/
    ├── layout.tsx                  # Sidebar + header layout
    ├── page.tsx                    # Overview + stats + chart
    ├── clients/page.tsx            # Clients management
    ├── orders/
    │   ├── page.tsx                # Orders list (Suspense wrapper)
    │   ├── OrdersPage.tsx          # Orders table + filters
    │   └── [id]/page.tsx           # Order detail + edit
    └── settings/page.tsx           # Export + WhatsApp config

components/
├── ui/
│   ├── Button.tsx                  # Reusable button with glass effect
│   ├── Input.tsx                   # Reusable input/textarea
│   ├── StatusBadge.tsx             # Order status badge
│   ├── Skeleton.tsx                # Loading skeleton
│   └── EmptyState.tsx              # Empty table state
└── layout/
    └── PageHeader.tsx              # Page title + action slot

lib/
├── constants.ts                    # STATUSES, STATUS_COLORS, openWhatsApp
└── supabase/
    ├── client.ts                   # Browser-side Supabase client
    └── server.ts                   # Server-side Supabase client

middleware.ts                       # Auth protection + robots header
```

---

## Database Schema

```sql
clients
├── id          uuid (PK)
├── name        text
├── phone       text (unique)
├── city        text
├── address     text
└── created_at  timestamptz

orders
├── id          uuid (PK)
├── client_id   uuid (FK → clients.id)
├── items       text
├── image_url   text
├── size        text
├── color       text
├── total       numeric
├── status      text (NEW → CONTACTED → PACKED → SENT → DELIVERED)
├── store       text
├── notes       text
├── updated_by  text
├── created_at  timestamptz
└── updated_at  timestamptz

logs
├── id          uuid (PK)
├── action      text
├── user_id     uuid
├── order_id    uuid (FK → orders.id)
└── timestamp   timestamptz
```

---

## Order Status Flow

```
NEW → CONTACTED → PACKED → SENT → DELIVERED
          ↓           ↓
       CHANGED     CANCELED
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/veloura.git
cd veloura
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up Supabase

Run the SQL schema in your Supabase SQL Editor:

```sql
-- Clients table
create table clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null unique,
  city text not null,
  address text,
  created_at timestamptz default now()
);

-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  items text,
  image_url text,
  size text,
  color text,
  total numeric,
  status text default 'NEW',
  store text,
  notes text,
  updated_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Logs table
create table logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  user_id uuid,
  order_id uuid references orders(id) on delete set null,
  timestamp timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger orders_updated_at
before update on orders
for each row execute function update_updated_at();
```

### 5. Set up RLS policies

```sql
alter table clients enable row level security;
alter table orders enable row level security;
alter table logs enable row level security;

create policy "anon can insert clients"
on clients for insert to anon with check (true);

create policy "authenticated full access clients"
on clients for all to authenticated using (true) with check (true);

create policy "anon can insert orders"
on orders for insert to anon with check (true);

create policy "authenticated full access orders"
on orders for all to authenticated using (true) with check (true);

create policy "authenticated full access logs"
on logs for all to authenticated using (true) with check (true);
```

### 6. Create Storage bucket

In Supabase → Storage → create a bucket called `order-images` (public).

Add policies:

```sql
create policy "anon can upload images"
on storage.objects for insert to anon
with check (bucket_id = 'order-images');

create policy "anyone can view images"
on storage.objects for select
using (bucket_id = 'order-images');

create policy "authenticated can manage images"
on storage.objects for all to authenticated
using (bucket_id = 'order-images')
with check (bucket_id = 'order-images');
```

### 7. Create admin user

In Supabase → Authentication → Users → Add user with your email and password.

### 8. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/order` | Public | Client order form |
| `/thanks` | Public | Order confirmation |
| `/admin-login` | Public | Admin login |
| `/dashboard` | Admin only | Overview + stats + chart |
| `/dashboard/clients` | Admin only | Client management |
| `/dashboard/orders` | Admin only | Orders table |
| `/dashboard/orders/[id]` | Admin only | Order detail + edit |
| `/dashboard/settings` | Admin only | Export + settings |

---

## Deployment

This project is deployed on **Vercel**.

### Deploy steps

1. Push to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment variables required on Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### After deploy

In Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

---

## Features

- Public order form with image upload
- Moroccan phone number validation
- Supabase Storage for order images
- Admin dashboard with real-time stats
- Area chart for weekly order trends
- Client management with status tracking
- Orders table with inline editing
- Status dropdown with color coding
- CSV export for all orders
- WhatsApp deep links for client contact
- Route protection via Next.js middleware
- Row Level Security on all tables
- Responsive sidebar with collapse toggle

---

## Security

- All `/dashboard/*` routes protected by middleware
- RLS policies enforce role-based data access
- `anon` role can only insert (public form)
- `authenticated` role has full access (admin dashboard)
- Search engines blocked from admin pages via `X-Robots-Tag`
- Environment variables never committed to git

---

## Weekly Maintenance

- Export orders CSV from `/dashboard/settings`
- Save backup copy to Google Drive
- Check Supabase Storage usage

---

## License

Private project — all rights reserved.
