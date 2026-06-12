-- Migration: Session initiative
-- Description: Indicative live turn order with member and custom participants.

create table public.session_initiative_entries (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.sessions(id) on delete cascade not null,
    table_id uuid references public.tables(id) on delete cascade not null,
    participant_type text not null,
    user_id uuid references public.profiles(id) on delete cascade,
    label text,
    initiative_score integer,
    initiative_modifier integer default 0 not null,
    initiative_requested_at timestamptz,
    position integer not null,
    last_roll_id uuid references public.session_dice_rolls(id) on delete set null,
    created_by uuid references public.profiles(id) on delete restrict not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    constraint session_initiative_entries_participant_type_check
        check (participant_type in ('member', 'custom')),
    constraint session_initiative_entries_identity_check check (
        (participant_type = 'member' and user_id is not null and label is null)
        or (participant_type = 'custom' and user_id is null and label is not null)
    ),
    constraint session_initiative_entries_label_check
        check (label is null or char_length(trim(label)) between 1 and 80),
    constraint session_initiative_entries_modifier_check
        check (initiative_modifier between -99 and 99),
    constraint session_initiative_entries_score_check
        check (initiative_score is null or initiative_score between -999 and 999),
    constraint session_initiative_entries_position_check check (position >= 0),
    constraint session_initiative_entries_member_unique unique (session_id, user_id)
);

create table public.session_initiative_state (
    session_id uuid references public.sessions(id) on delete cascade primary key,
    table_id uuid references public.tables(id) on delete cascade not null,
    current_entry_id uuid references public.session_initiative_entries(id) on delete set null,
    initiative_requested_at timestamptz,
    requested_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index idx_session_initiative_entries_session_position
    on public.session_initiative_entries(session_id, position);
create index idx_session_initiative_entries_table
    on public.session_initiative_entries(table_id);
create index idx_session_initiative_entries_user
    on public.session_initiative_entries(user_id)
    where user_id is not null;
create index idx_session_initiative_entries_last_roll
    on public.session_initiative_entries(last_roll_id)
    where last_roll_id is not null;
create index idx_session_initiative_entries_created_by
    on public.session_initiative_entries(created_by);
create index idx_session_initiative_state_table
    on public.session_initiative_state(table_id);
create index idx_session_initiative_state_current
    on public.session_initiative_state(current_entry_id)
    where current_entry_id is not null;
create index idx_session_initiative_state_requested_by
    on public.session_initiative_state(requested_by)
    where requested_by is not null;

create trigger on_session_initiative_entries_update
    before update on public.session_initiative_entries
    for each row execute procedure public.handle_updated_at();

create trigger on_session_initiative_state_update
    before update on public.session_initiative_state
    for each row execute procedure public.handle_updated_at();

create or replace function public.ensure_initiative_entry_coherence()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    session_table_id uuid;
    session_status public.session_status;
    roll_table_id uuid;
    roll_session_id uuid;
    roll_user_id uuid;
    roll_total integer;
    roll_modifier integer;
    roll_kind text;
    roll_created_at timestamptz;
begin
    select session_row.table_id, session_row.status
    into session_table_id, session_status
    from public.sessions session_row
    where session_row.id = new.session_id;

    if session_table_id is null or session_table_id is distinct from new.table_id then
        raise exception 'Initiative entry session_id must belong to table_id'
            using errcode = '23514';
    end if;

    if session_status <> 'active' then
        raise exception 'Initiative entries require an active session'
            using errcode = '23514';
    end if;

    if new.participant_type = 'member' and not exists (
        select 1
        from public.table_memberships membership
        where membership.table_id = new.table_id
        and membership.user_id = new.user_id
    ) then
        raise exception 'Initiative member must belong to the table'
            using errcode = '23514';
    end if;

    if new.last_roll_id is not null then
        select roll.table_id, roll.session_id, roll.user_id, roll.total, roll.modifier,
            roll.roll_kind, roll.created_at
        into roll_table_id, roll_session_id, roll_user_id, roll_total, roll_modifier, roll_kind,
            roll_created_at
        from public.session_dice_rolls roll
        where roll.id = new.last_roll_id;

        if roll_table_id is distinct from new.table_id
            or roll_session_id is distinct from new.session_id
            or roll_kind is distinct from 'initiative'
            or roll_total is distinct from new.initiative_score
            or roll_modifier is distinct from new.initiative_modifier
            or (
                new.participant_type = 'member'
                and (
                    roll_user_id is distinct from new.user_id
                    or new.initiative_requested_at is null
                    or roll_created_at < new.initiative_requested_at
                )
            )
            or (
                new.participant_type = 'custom'
                and not exists (
                    select 1
                    from public.table_memberships membership
                    where membership.table_id = new.table_id
                    and membership.user_id = roll_user_id
                    and membership.role = 'gm'
                )
            )
        then
            raise exception 'Initiative roll must match the participant and session'
                using errcode = '23514';
        end if;
    end if;

    return new;
end;
$$;

create trigger ensure_initiative_entry_coherence_before_write
    before insert or update of session_id, table_id, participant_type, user_id, last_roll_id,
        initiative_score, initiative_modifier
    on public.session_initiative_entries
    for each row execute procedure public.ensure_initiative_entry_coherence();

create or replace function public.ensure_initiative_state_coherence()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    session_table_id uuid;
    session_status public.session_status;
begin
    select session_row.table_id, session_row.status
    into session_table_id, session_status
    from public.sessions session_row
    where session_row.id = new.session_id;

    if session_table_id is null or session_table_id is distinct from new.table_id then
        raise exception 'Initiative state session_id must belong to table_id'
            using errcode = '23514';
    end if;

    if session_status <> 'active' then
        raise exception 'Initiative state requires an active session'
            using errcode = '23514';
    end if;

    if new.current_entry_id is not null and not exists (
        select 1
        from public.session_initiative_entries entry
        where entry.id = new.current_entry_id
        and entry.session_id = new.session_id
        and entry.table_id = new.table_id
    ) then
        raise exception 'Current initiative entry must belong to the state session'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create trigger ensure_initiative_state_coherence_before_write
    before insert or update of session_id, table_id, current_entry_id
    on public.session_initiative_state
    for each row execute procedure public.ensure_initiative_state_coherence();

create or replace function public.protect_initiative_player_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if current_user = 'service_role'
        and new.session_id is not distinct from old.session_id
        and new.table_id is not distinct from old.table_id
        and new.participant_type is not distinct from old.participant_type
        and new.user_id is not distinct from old.user_id
        and new.label is not distinct from old.label
        and new.initiative_score is not distinct from old.initiative_score
        and new.initiative_modifier is not distinct from old.initiative_modifier
        and new.initiative_requested_at is not distinct from old.initiative_requested_at
        and new.last_roll_id is not distinct from old.last_roll_id
        and new.created_by is not distinct from old.created_by
        and new.created_at is not distinct from old.created_at
    then
        return new;
    end if;

    if (select public.is_table_gm(old.table_id)) then
        return new;
    end if;

    if old.participant_type <> 'member'
        or old.user_id is distinct from (select auth.uid())
        or new.session_id is distinct from old.session_id
        or new.table_id is distinct from old.table_id
        or new.participant_type is distinct from old.participant_type
        or new.user_id is distinct from old.user_id
        or new.label is distinct from old.label
        or new.initiative_requested_at is distinct from old.initiative_requested_at
        or new.position is distinct from old.position
        or new.created_by is distinct from old.created_by
        or new.created_at is distinct from old.created_at
        or old.initiative_score is not null
        or new.last_roll_id is null
        or old.initiative_requested_at is null
    then
        raise exception 'Players can only submit their own pending initiative'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

create trigger protect_initiative_player_update_before_write
    before update on public.session_initiative_entries
    for each row execute procedure public.protect_initiative_player_update();

alter table public.session_initiative_entries enable row level security;
alter table public.session_initiative_state enable row level security;

create policy "Initiative entries are viewable by table members"
    on public.session_initiative_entries for select
    to authenticated
    using ((select public.is_table_member(table_id)));

create policy "GMs can create initiative entries"
    on public.session_initiative_entries for insert
    to authenticated
    with check ((select public.is_table_gm(table_id)));

create policy "GMs and own members can update initiative entries"
    on public.session_initiative_entries for update
    to authenticated
    using (
        (select public.is_table_gm(table_id))
        or (participant_type = 'member' and user_id = (select auth.uid()))
    )
    with check (
        (select public.is_table_gm(table_id))
        or (participant_type = 'member' and user_id = (select auth.uid()))
    );

create policy "GMs can delete initiative entries"
    on public.session_initiative_entries for delete
    to authenticated
    using ((select public.is_table_gm(table_id)));

create policy "Initiative state is viewable by table members"
    on public.session_initiative_state for select
    to authenticated
    using ((select public.is_table_member(table_id)));

create policy "GMs can create initiative state"
    on public.session_initiative_state for insert
    to authenticated
    with check ((select public.is_table_gm(table_id)));

create policy "GMs can update initiative state"
    on public.session_initiative_state for update
    to authenticated
    using ((select public.is_table_gm(table_id)))
    with check ((select public.is_table_gm(table_id)));

create policy "GMs can delete initiative state"
    on public.session_initiative_state for delete
    to authenticated
    using ((select public.is_table_gm(table_id)));

revoke all on function public.ensure_initiative_entry_coherence()
    from public, anon, authenticated, service_role;
revoke all on function public.ensure_initiative_state_coherence()
    from public, anon, authenticated, service_role;
revoke all on function public.protect_initiative_player_update()
    from public, anon, authenticated, service_role;

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
        raise exception 'Session not found' using errcode = 'P0002';
    end if;

    if (select auth.uid()) is null or not exists (
        select 1 from public.table_memberships membership
        where membership.table_id = target_table_id
        and membership.user_id = (select auth.uid())
        and membership.role = 'gm'
    ) then
        raise exception 'Only table GMs can delete sessions' using errcode = '42501';
    end if;

    if target_status <> 'scheduled' then
        raise exception 'Only scheduled sessions can be deleted' using errcode = '22023';
    end if;

    if exists (select 1 from public.session_responses where session_id = target_session_id)
        or exists (select 1 from public.session_presence where session_id = target_session_id)
        or exists (select 1 from public.table_messages where session_id = target_session_id)
        or exists (select 1 from public.personal_notes where session_id = target_session_id)
        or exists (select 1 from public.group_notes where session_id = target_session_id)
        or exists (select 1 from public.session_dice_rolls where session_id = target_session_id)
        or exists (select 1 from public.table_private_messages where session_id = target_session_id)
        or exists (
            select 1 from public.session_initiative_entries where session_id = target_session_id
        )
        or exists (
            select 1 from public.session_initiative_state where session_id = target_session_id
        )
    then
        return false;
    end if;

    delete from public.sessions where id = target_session_id;
    return true;
end;
$$;

revoke all on function public.delete_empty_scheduled_session(uuid) from public, anon, service_role;
grant execute on function public.delete_empty_scheduled_session(uuid) to authenticated;
 