-- Migration: Critical RLS hardening before production
-- Description: Protect memberships, invitations, session content, notes, and table ownership.

-- Shared authorization helpers bypass table_memberships RLS to avoid recursive policies.
create or replace function public.is_table_member(target_table_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.table_memberships membership
        where membership.table_id = target_table_id
        and membership.user_id = (select auth.uid())
    );
$$;

create or replace function public.is_table_gm(target_table_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.table_memberships membership
        where membership.table_id = target_table_id
        and membership.user_id = (select auth.uid())
        and membership.role = 'gm'
    );
$$;

create or replace function public.is_table_owner(target_table_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.tables table_row
        where table_row.id = target_table_id
        and table_row.owner_id = (select auth.uid())
    );
$$;

create or replace function public.has_other_table_gm(target_table_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.table_memberships membership
        where membership.table_id = target_table_id
        and membership.user_id <> (select auth.uid())
        and membership.role = 'gm'
    );
$$;

create or replace function public.is_session_table_member(target_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.sessions session_row
        join public.table_memberships membership
            on membership.table_id = session_row.table_id
        where session_row.id = target_session_id
        and membership.user_id = (select auth.uid())
    );
$$;

create or replace function public.is_session_table_gm(target_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.sessions session_row
        join public.table_memberships membership
            on membership.table_id = session_row.table_id
        where session_row.id = target_session_id
        and membership.user_id = (select auth.uid())
        and membership.role = 'gm'
    );
$$;

revoke all on function public.is_table_member(uuid) from public;
revoke all on function public.is_table_gm(uuid) from public;
revoke all on function public.is_table_owner(uuid) from public;
revoke all on function public.has_other_table_gm(uuid) from public;
revoke all on function public.is_session_table_member(uuid) from public;
revoke all on function public.is_session_table_gm(uuid) from public;

revoke all on function public.is_table_member(uuid) from anon;
revoke all on function public.is_table_gm(uuid) from anon;
revoke all on function public.is_table_owner(uuid) from anon;
revoke all on function public.has_other_table_gm(uuid) from anon;
revoke all on function public.is_session_table_member(uuid) from anon;
revoke all on function public.is_session_table_gm(uuid) from anon;

grant execute on function public.is_table_member(uuid) to authenticated;
grant execute on function public.is_table_gm(uuid) to authenticated;
grant execute on function public.is_table_owner(uuid) to authenticated;
grant execute on function public.has_other_table_gm(uuid) to authenticated;
grant execute on function public.is_session_table_member(uuid) to authenticated;
grant execute on function public.is_session_table_gm(uuid) to authenticated;

-- Membership identity is immutable. Role changes remain available to GMs.
create or replace function public.protect_membership_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.table_id is distinct from old.table_id
        or new.user_id is distinct from old.user_id
    then
        raise exception 'Membership table_id and user_id cannot be changed';
    end if;

    return new;
end;
$$;

create trigger protect_membership_identity_before_update
    before update on public.table_memberships
    for each row
    execute procedure public.protect_membership_identity();

-- Ownership transfer requires a future dedicated flow and cannot happen through a regular update.
create or replace function public.protect_table_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.owner_id is distinct from old.owner_id then
        raise exception 'Table owner_id cannot be changed directly';
    end if;

    return new;
end;
$$;

create trigger protect_table_owner_before_update
    before update on public.tables
    for each row
    execute procedure public.protect_table_owner();

-- Remove the indirect public exposure created for group invitation landing pages.
-- Token lookups now use the server-only service role path.
drop policy if exists "Tables are viewable by invitation recipients" on public.tables;
drop policy if exists "Profiles are viewable by invitation recipients" on public.profiles;

-- Table memberships: members can read their table roster. Only the owner bootstrap insert is
-- available to clients; invitation acceptance uses a dedicated server-only service role path.
alter table public.table_memberships enable row level security;

create policy "Members can view table memberships"
    on public.table_memberships for select
    to authenticated
    using ((select public.is_table_member(table_id)));

create policy "Owners can create their initial GM membership"
    on public.table_memberships for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and role = 'gm'
        and (select public.is_table_owner(table_id))
    );

create policy "GMs can update table memberships"
    on public.table_memberships for update
    to authenticated
    using ((select public.is_table_gm(table_id)))
    with check ((select public.is_table_gm(table_id)));

create policy "Members can leave and GMs can remove non GMs"
    on public.table_memberships for delete
    to authenticated
    using (
        (
            user_id = (select auth.uid())
            and (
                role <> 'gm'
                or (select public.has_other_table_gm(table_id))
            )
        )
        or (
            role <> 'gm'
            and (select public.is_table_gm(table_id))
        )
    );

-- Targeted invitations: GMs manage them; recipients can only list invitations matching their
-- authenticated email. Token lookup and acceptance mutations remain server-only.
alter table public.invitations enable row level security;

create policy "GMs can view targeted invitations"
    on public.invitations for select
    to authenticated
    using ((select public.is_table_gm(table_id)));

create policy "Recipients can view own targeted invitations"
    on public.invitations for select
    to authenticated
    using (
        lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    );

create policy "GMs can create targeted invitations"
    on public.invitations for insert
    to authenticated
    with check (
        inviter_id = (select auth.uid())
        and (select public.is_table_gm(table_id))
    );

create policy "GMs can update targeted invitations"
    on public.invitations for update
    to authenticated
    using ((select public.is_table_gm(table_id)))
    with check ((select public.is_table_gm(table_id)));

create policy "GMs can delete targeted invitations"
    on public.invitations for delete
    to authenticated
    using ((select public.is_table_gm(table_id)));

-- Group invitations: no public row listing. Landing pages and acceptance resolve the token through
-- the server-only service role path.
drop policy if exists "Anyone can read group invitations by token"
    on public.table_group_invitations;
drop policy if exists "GMs can manage group invitations"
    on public.table_group_invitations;

create policy "GMs can view group invitations"
    on public.table_group_invitations for select
    to authenticated
    using ((select public.is_table_gm(table_id)));

create policy "GMs can create group invitations"
    on public.table_group_invitations for insert
    to authenticated
    with check (
        created_by = (select auth.uid())
        and (select public.is_table_gm(table_id))
    );

create policy "GMs can update group invitations"
    on public.table_group_invitations for update
    to authenticated
    using ((select public.is_table_gm(table_id)))
    with check ((select public.is_table_gm(table_id)));

create policy "GMs can delete group invitations"
    on public.table_group_invitations for delete
    to authenticated
    using ((select public.is_table_gm(table_id)));

-- Session responses: table members can read; each user owns their response mutation.
alter table public.session_responses enable row level security;

create policy "Members can view session responses"
    on public.session_responses for select
    to authenticated
    using ((select public.is_session_table_member(session_id)));

create policy "Members can create own session response"
    on public.session_responses for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and (select public.is_session_table_member(session_id))
    );

create policy "Members can update own session response"
    on public.session_responses for update
    to authenticated
    using (
        user_id = (select auth.uid())
        and (select public.is_session_table_member(session_id))
    )
    with check (
        user_id = (select auth.uid())
        and (select public.is_session_table_member(session_id))
    );

-- Session presence: members can read; GMs manage attendance records.
alter table public.session_presence enable row level security;

create policy "Members can view session presence"
    on public.session_presence for select
    to authenticated
    using ((select public.is_session_table_member(session_id)));

create policy "GMs can create session presence"
    on public.session_presence for insert
    to authenticated
    with check ((select public.is_session_table_gm(session_id)));

create policy "GMs can update session presence"
    on public.session_presence for update
    to authenticated
    using ((select public.is_session_table_gm(session_id)))
    with check ((select public.is_session_table_gm(session_id)));

create policy "GMs can delete session presence"
    on public.session_presence for delete
    to authenticated
    using ((select public.is_session_table_gm(session_id)));

-- Session chats are immutable client-side: members can read and create messages as themselves.
alter table public.pre_session_messages enable row level security;

create policy "Members can view pre session messages"
    on public.pre_session_messages for select
    to authenticated
    using ((select public.is_session_table_member(session_id)));

create policy "Members can create pre session messages"
    on public.pre_session_messages for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and (select public.is_session_table_member(session_id))
    );

alter table public.live_session_messages enable row level security;

create policy "Members can view live session messages"
    on public.live_session_messages for select
    to authenticated
    using ((select public.is_session_table_member(session_id)));

create policy "Members can create live session messages"
    on public.live_session_messages for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and (select public.is_session_table_member(session_id))
    );

-- Personal notes stay private and require membership for attached table/session contexts.
alter table public.personal_notes enable row level security;

create policy "Users can view own personal notes"
    on public.personal_notes for select
    to authenticated
    using (
        user_id = (select auth.uid())
        and (table_id is null or (select public.is_table_member(table_id)))
        and (session_id is null or (select public.is_session_table_member(session_id)))
    );

create policy "Users can create own personal notes"
    on public.personal_notes for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and (table_id is null or (select public.is_table_member(table_id)))
        and (session_id is null or (select public.is_session_table_member(session_id)))
    );

create policy "Users can update own personal notes"
    on public.personal_notes for update
    to authenticated
    using (
        user_id = (select auth.uid())
        and (table_id is null or (select public.is_table_member(table_id)))
        and (session_id is null or (select public.is_session_table_member(session_id)))
    )
    with check (
        user_id = (select auth.uid())
        and (table_id is null or (select public.is_table_member(table_id)))
        and (session_id is null or (select public.is_session_table_member(session_id)))
    );

create policy "Users can delete own personal notes"
    on public.personal_notes for delete
    to authenticated
    using (
        user_id = (select auth.uid())
        and (table_id is null or (select public.is_table_member(table_id)))
        and (session_id is null or (select public.is_session_table_member(session_id)))
    );

-- Group notes are shared editable content for every table member. Client delete remains denied.
alter table public.group_notes enable row level security;

create policy "Members can view group notes"
    on public.group_notes for select
    to authenticated
    using ((select public.is_table_member(table_id)));

create policy "Members can create group notes"
    on public.group_notes for insert
    to authenticated
    with check (
        (select public.is_table_member(table_id))
        and (session_id is null or (select public.is_session_table_member(session_id)))
    );

create policy "Members can update group notes"
    on public.group_notes for update
    to authenticated
    using ((select public.is_table_member(table_id)))
    with check (
        (select public.is_table_member(table_id))
        and (session_id is null or (select public.is_session_table_member(session_id)))
    );
