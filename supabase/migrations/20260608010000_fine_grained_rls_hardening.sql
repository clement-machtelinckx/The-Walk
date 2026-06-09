-- Migration: Fine-grained RLS hardening before production
-- Description: Align profile, notification, and dice-roll writes with current product behavior.

-- Profiles: the current product only exposes avatar selection after signup.
create or replace function public.protect_profile_editable_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.id is distinct from old.id
        or new.email is distinct from old.email
        or new.display_name is distinct from old.display_name
        or new.avatar_url is distinct from old.avatar_url
        or new.created_at is distinct from old.created_at
    then
        raise exception 'Only profile avatar_key can be changed'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_profile_editable_fields_before_update on public.profiles;
create trigger protect_profile_editable_fields_before_update
    before update on public.profiles
    for each row
    execute procedure public.protect_profile_editable_fields();

drop policy if exists "Profiles are viewable by self" on public.profiles;
drop policy if exists "Profiles are viewable by table members" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Profiles are viewable by self"
    on public.profiles for select
    to authenticated
    using (id = (select auth.uid()));

create policy "Profiles are viewable by table members"
    on public.profiles for select
    to authenticated
    using (
        exists (
            select 1
            from public.table_memberships own_membership
            join public.table_memberships other_membership
                on other_membership.table_id = own_membership.table_id
            where own_membership.user_id = (select auth.uid())
            and other_membership.user_id = public.profiles.id
        )
    );

create policy "Users can update own profile"
    on public.profiles for update
    to authenticated
    using (id = (select auth.uid()))
    with check (id = (select auth.uid()));

-- Notifications: clients can only move their own notification read state.
create or replace function public.protect_notification_content()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.id is distinct from old.id
        or new.user_id is distinct from old.user_id
        or new.type is distinct from old.type
        or new.title is distinct from old.title
        or new.body is distinct from old.body
        or new.resource_type is distinct from old.resource_type
        or new.resource_id is distinct from old.resource_id
        or new.href is distinct from old.href
        or new.data is distinct from old.data
        or new.created_at is distinct from old.created_at
    then
        raise exception 'Only notification read state can be changed'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_notification_content_before_update on public.notifications;
create trigger protect_notification_content_before_update
    before update on public.notifications
    for each row
    execute procedure public.protect_notification_content();

drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;

create policy "Users can read own notifications"
    on public.notifications for select
    to authenticated
    using (user_id = (select auth.uid()));

create policy "Users can update own notification read state"
    on public.notifications for update
    to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

-- Dice rolls: an optional session must belong to the same table as the roll.
create or replace function public.ensure_dice_roll_session_matches_table()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    session_table_id uuid;
begin
    if new.session_id is null then
        return new;
    end if;

    select session_row.table_id
    into session_table_id
    from public.sessions session_row
    where session_row.id = new.session_id;

    if session_table_id is null or session_table_id is distinct from new.table_id then
        raise exception 'Dice roll session_id must belong to table_id'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

drop trigger if exists ensure_dice_roll_session_matches_table_before_write
    on public.session_dice_rolls;
create trigger ensure_dice_roll_session_matches_table_before_write
    before insert or update of table_id, session_id on public.session_dice_rolls
    for each row
    execute procedure public.ensure_dice_roll_session_matches_table();

drop policy if exists "Dice rolls are viewable by table members"
    on public.session_dice_rolls;
drop policy if exists "Table members can create dice rolls"
    on public.session_dice_rolls;

create policy "Dice rolls are viewable by table members"
    on public.session_dice_rolls for select
    to authenticated
    using ((select public.is_table_member(table_id)));

create policy "Table members can create own dice rolls"
    on public.session_dice_rolls for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and (select public.is_table_member(table_id))
    );

-- Trigger functions are internal implementation details, not client RPC endpoints.
revoke all on function public.protect_profile_editable_fields() from public, anon, authenticated;
revoke all on function public.protect_notification_content() from public, anon, authenticated;
revoke all on function public.ensure_dice_roll_session_matches_table() from public, anon, authenticated;
