-- Migration: 20260408020000_fix_hardening_rls_regressions.sql
-- Description: Fix functional regressions introduced by RLS hardening on tables and sessions.

-- 1. Fix Table Creation and Management
-- Regression: INSERT was blocked.
-- Regression: SELECT after INSERT was blocked before membership was created (missing owner-based SELECT).

create policy "Users can create tables"
    on public.tables for insert
    with check ( auth.uid() = owner_id );

-- Explicitly allow owner to select even if they haven't been added to table_memberships yet
create policy "Owners can view their own tables"
    on public.tables for select
    using ( auth.uid() = owner_id );

create policy "Owners and GMs can update their tables"
    on public.tables for update
    using (
        auth.uid() = owner_id
        or exists (
            select 1 from public.table_memberships
            where table_id = public.tables.id
            and user_id = auth.uid()
            and role = 'gm'
        )
    )
    with check (
        auth.uid() = owner_id
        or exists (
            select 1 from public.table_memberships
            where table_id = public.tables.id
            and user_id = auth.uid()
            and role = 'gm'
        )
    );

create policy "Owners can delete their own tables"
    on public.tables for delete
    using ( auth.uid() = owner_id );

-- Allow prospective members to see table details (name/description) if they have a token
create policy "Tables are viewable by invitation recipients"
    on public.tables for select
    using (
        exists (
            select 1 from public.table_group_invitations
            where table_id = public.tables.id
            and expires_at > now()
        )
    );


-- 2. Fix Session Creation and Management
-- Regression: INSERT and UPDATE were blocked even for GMs.

create policy "GMs can create sessions"
    on public.sessions for insert
    with check (
        exists (
            select 1 from public.table_memberships
            where table_id = public.sessions.table_id
            and user_id = auth.uid()
            and role = 'gm'
        )
    );

create policy "GMs can update sessions"
    on public.sessions for update
    using (
        exists (
            select 1 from public.table_memberships
            where table_id = public.sessions.table_id
            and user_id = auth.uid()
            and role = 'gm'
        )
    )
    with check (
        exists (
            select 1 from public.table_memberships
            where table_id = public.sessions.table_id
            and user_id = auth.uid()
            and role = 'gm'
        )
    );

create policy "GMs can delete sessions"
    on public.sessions for delete
    using (
        exists (
            select 1 from public.table_memberships
            where table_id = public.sessions.table_id
            and user_id = auth.uid()
            and role = 'gm'
        )
    );


-- 3. Profiles Fix for Invitations
-- Allow seeing the profile of people who created invitations.
create policy "Profiles are viewable by invitation recipients"
    on public.profiles for select
    using (
        exists (
            select 1 from public.table_group_invitations
            where created_by = public.profiles.id
            and expires_at > now()
        )
    );
