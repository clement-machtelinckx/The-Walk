-- Migration: 20260408010000_hardening_rls.sql
-- Description: Harden RLS policies for profiles and tables to prevent data leaks.

-- 1. Profiles Hardening
-- Current situation: typically allowed all authenticated users.
-- Goal: Only allow profile reading if:
--   a) It's my own profile
--   b) We share a table
--   c) I am a GM of a table where they are invited (or vice-versa)

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Profiles are viewable by self"
    on public.profiles for select
    using ( auth.uid() = id );

create policy "Profiles are viewable by table members"
    on public.profiles for select
    using (
        exists (
            select 1 from public.table_memberships m1
            join public.table_memberships m2 on m1.table_id = m2.table_id
            where m1.user_id = auth.uid()
            and m2.user_id = public.profiles.id
        )
    );

create policy "Users can update own profile"
    on public.profiles for update
    using ( auth.uid() = id )
    with check ( auth.uid() = id );


-- 2. Tables Hardening
-- Goal: Only members can read table details via RLS.
alter table public.tables enable row level security;

drop policy if exists "Tables are viewable by members" on public.tables;

create policy "Tables are viewable by members"
    on public.tables for select
    using (
        exists (
            select 1 from public.table_memberships
            where table_id = public.tables.id
            and user_id = auth.uid()
        )
    );

-- 3. Sessions Hardening
alter table public.sessions enable row level security;

drop policy if exists "Sessions are viewable by table members" on public.sessions;

create policy "Sessions are viewable by table members"
    on public.sessions for select
    using (
        exists (
            select 1 from public.table_memberships
            where table_id = public.sessions.table_id
            and user_id = auth.uid()
        )
    );
