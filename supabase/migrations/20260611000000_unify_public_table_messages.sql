-- Migration: Unify public table messages
-- Description: Replace both legacy public chats with one permanent table discussion.

create table public.table_messages (
    id uuid default gen_random_uuid() primary key,
    table_id uuid references public.tables(id) on delete cascade not null,
    session_id uuid references public.sessions(id) on delete set null,
    user_id uuid references public.profiles(id) on delete set null,
    content text not null,
    created_at timestamptz default now() not null
);

create index idx_table_messages_table_created_at
    on public.table_messages(table_id, created_at);
create index idx_table_messages_session
    on public.table_messages(session_id);

alter table public.table_messages enable row level security;

create policy "Table members can view table messages"
    on public.table_messages for select
    to authenticated
    using ((select public.is_table_member(table_id)));

create policy "Table members can create table messages"
    on public.table_messages for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and (select public.is_table_member(table_id))
        and (
            session_id is null
            or exists (
                select 1
                from public.sessions session_row
                where session_row.id = public.table_messages.session_id
                and session_row.table_id = public.table_messages.table_id
            )
        )
    );

create or replace function public.validate_table_message_session()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.session_id is not null and not exists (
        select 1
        from public.sessions session_row
        where session_row.id = new.session_id
        and session_row.table_id = new.table_id
    ) then
        raise exception 'Table message session_id must belong to table_id'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create trigger validate_table_message_session_trigger
before insert or update of table_id, session_id
on public.table_messages
for each row
execute function public.validate_table_message_session();

-- Legacy public chat data is intentionally discarded.
drop table public.pre_session_messages;
drop table public.live_session_messages;

delete from public.session_live_enabled_modules
where module_key = 'live_chat';

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
        select 1 from public.table_messages where session_id = target_session_id
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
