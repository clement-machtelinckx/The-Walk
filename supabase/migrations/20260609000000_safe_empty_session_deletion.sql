-- Migration: Safe deletion of empty scheduled sessions
-- Description: Make the activity check and session deletion atomic without exposing private notes.

-- A regular session DELETE cannot reliably enforce the product rule because RLS hides private
-- activity from the GM. All client-side session deletion now goes through the guarded function.
drop policy if exists "GMs can delete sessions" on public.sessions;

create or replace function public.delete_empty_scheduled_session(target_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    target_table_id uuid;
    target_status public.session_status;
begin
    select session_row.table_id, session_row.status
    into target_table_id, target_status
    from public.sessions session_row
    where session_row.id = target_session_id
    for update;

    if not found then
        raise exception 'Session not found'
            using errcode = 'P0002';
    end if;

    if (select auth.uid()) is null or not exists (
        select 1
        from public.table_memberships membership
        where membership.table_id = target_table_id
        and membership.user_id = (select auth.uid())
        and membership.role = 'gm'
    ) then
        raise exception 'Only table GMs can delete sessions'
            using errcode = '42501';
    end if;

    if target_status <> 'scheduled' then
        raise exception 'Only scheduled sessions can be deleted'
            using errcode = '22023';
    end if;

    if exists (
        select 1 from public.session_responses where session_id = target_session_id
    ) or exists (
        select 1 from public.session_presence where session_id = target_session_id
    ) or exists (
        select 1 from public.pre_session_messages where session_id = target_session_id
    ) or exists (
        select 1 from public.live_session_messages where session_id = target_session_id
    ) or exists (
        select 1 from public.personal_notes where session_id = target_session_id
    ) or exists (
        select 1 from public.group_notes where session_id = target_session_id
    ) or exists (
        select 1 from public.session_dice_rolls where session_id = target_session_id
    ) or exists (
        select 1 from public.table_private_messages where session_id = target_session_id
    ) then
        return false;
    end if;

    delete from public.sessions
    where id = target_session_id;

    return true;
end;
$$;

revoke all on function public.delete_empty_scheduled_session(uuid) from public;
revoke all on function public.delete_empty_scheduled_session(uuid) from anon;
revoke all on function public.delete_empty_scheduled_session(uuid) from service_role;
grant execute on function public.delete_empty_scheduled_session(uuid) to authenticated;

