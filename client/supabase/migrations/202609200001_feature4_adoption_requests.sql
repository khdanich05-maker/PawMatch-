-- Feature 4: Volunteer Matching / Adoption Requests
create extension if not exists "pgcrypto";

create table if not exists public.adoption_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  animal_id text not null,
  animal_name text not null,
  animal_type text not null,
  applicant_name text not null,
  phone text not null,
  address text not null,
  occupation text not null,
  housing_type text not null,
  has_fence boolean not null default false,
  has_other_pets boolean not null default false,
  experience text not null,
  reason text not null check (char_length(reason) >= 20),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists adoption_requests_user_id_idx on public.adoption_requests(user_id);
create index if not exists adoption_requests_status_idx on public.adoption_requests(status);
alter table public.adoption_requests enable row level security;

create policy "users create their own adoption requests"
on public.adoption_requests for insert to authenticated
with check (auth.uid() = user_id);

create policy "users read their own adoption requests"
on public.adoption_requests for select to authenticated
using (auth.uid() = user_id or coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

create policy "admins review adoption requests"
on public.adoption_requests for update to authenticated
using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false))
with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false));

