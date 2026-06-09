-- Migration: Final attachment identity hardening before production
-- Description: Keep editable business fields mutable while preventing context reassignment.

-- Sessions keep their original table while their title, dates, and status remain editable.
create or replace function public.protect_session_table_attachment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.table_id is distinct from old.table_id then
        raise exception 'Session table_id cannot be changed'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_session_table_attachment_before_update on public.sessions;
create trigger protect_session_table_attachment_before_update
    before update of table_id on public.sessions
    for each row
    execute procedure public.protect_session_table_attachment();

-- Personal notes keep their owner and original optional table/session context.
create or replace function public.protect_personal_note_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'UPDATE'
        and (
            new.user_id is distinct from old.user_id
            or new.table_id is distinct from old.table_id
            or new.session_id is distinct from old.session_id
        )
    then
        raise exception 'Personal note user_id, table_id and session_id cannot be changed'
            using errcode = '42501';
    end if;

    if new.session_id is not null
        and not exists (
            select 1
            from public.sessions session_row
            where session_row.id = new.session_id
            and session_row.table_id = new.table_id
        )
    then
        raise exception 'Personal note session_id must belong to table_id'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_personal_note_identity_before_write on public.personal_notes;
create trigger protect_personal_note_identity_before_write
    before insert or update of user_id, table_id, session_id on public.personal_notes
    for each row
    execute procedure public.protect_personal_note_identity();

-- Group notes keep their original table/session context while shared content remains editable.
create or replace function public.protect_group_note_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'UPDATE'
        and (
            new.table_id is distinct from old.table_id
            or new.session_id is distinct from old.session_id
        )
    then
        raise exception 'Group note table_id and session_id cannot be changed'
            using errcode = '42501';
    end if;

    if new.session_id is not null
        and not exists (
            select 1
            from public.sessions session_row
            where session_row.id = new.session_id
            and session_row.table_id = new.table_id
        )
    then
        raise exception 'Group note session_id must belong to table_id'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_group_note_identity_before_write on public.group_notes;
create trigger protect_group_note_identity_before_write
    before insert or update of table_id, session_id on public.group_notes
    for each row
    execute procedure public.protect_group_note_identity();

-- RSVP and presence rows are identified by their session/user pair.
create or replace function public.protect_session_response_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.session_id is distinct from old.session_id
        or new.user_id is distinct from old.user_id
    then
        raise exception 'Session response session_id and user_id cannot be changed'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_session_response_identity_before_update
    on public.session_responses;
create trigger protect_session_response_identity_before_update
    before update of session_id, user_id on public.session_responses
    for each row
    execute procedure public.protect_session_response_identity();

create or replace function public.protect_session_presence_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'UPDATE'
        and (
            new.session_id is distinct from old.session_id
            or new.user_id is distinct from old.user_id
        )
    then
        raise exception 'Session presence session_id and user_id cannot be changed'
            using errcode = '42501';
    end if;

    if not exists (
        select 1
        from public.sessions session_row
        join public.table_memberships membership
            on membership.table_id = session_row.table_id
        where session_row.id = new.session_id
        and membership.user_id = new.user_id
    ) then
        raise exception 'Session presence user_id must belong to session table'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_session_presence_identity_before_write
    on public.session_presence;
create trigger protect_session_presence_identity_before_write
    before insert or update of session_id, user_id on public.session_presence
    for each row
    execute procedure public.protect_session_presence_identity();

-- Invitations may change lifecycle fields, but never their origin, target, or access token.
create or replace function public.protect_invitation_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.table_id is distinct from old.table_id
        or (
            new.inviter_id is distinct from old.inviter_id
            and not (old.inviter_id is not null and new.inviter_id is null)
        )
        or new.email is distinct from old.email
        or new.token is distinct from old.token
    then
        raise exception 'Invitation table_id, inviter_id, email and token cannot be changed'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_invitation_identity_before_update on public.invitations;
create trigger protect_invitation_identity_before_update
    before update of table_id, inviter_id, email, token on public.invitations
    for each row
    execute procedure public.protect_invitation_identity();

create or replace function public.protect_group_invitation_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.table_id is distinct from old.table_id
        or (
            new.created_by is distinct from old.created_by
            and not (old.created_by is not null and new.created_by is null)
        )
        or new.token is distinct from old.token
    then
        raise exception 'Group invitation table_id, created_by and token cannot be changed'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_group_invitation_identity_before_update
    on public.table_group_invitations;
create trigger protect_group_invitation_identity_before_update
    before update of table_id, created_by, token on public.table_group_invitations
    for each row
    execute procedure public.protect_group_invitation_identity();

-- Trigger functions are internal implementation details, not client RPC endpoints.
revoke all on function public.protect_session_table_attachment()
    from public, anon, authenticated, service_role;
revoke all on function public.protect_personal_note_identity()
    from public, anon, authenticated, service_role;
revoke all on function public.protect_group_note_identity()
    from public, anon, authenticated, service_role;
revoke all on function public.protect_session_response_identity()
    from public, anon, authenticated, service_role;
revoke all on function public.protect_session_presence_identity()
    from public, anon, authenticated, service_role;
revoke all on function public.protect_invitation_identity()
    from public, anon, authenticated, service_role;
revoke all on function public.protect_group_invitation_identity()
    from public, anon, authenticated, service_role;
