-- V1 Initial Schema for The-Walk
-- Convention:
-- auth.users = Authentification technique Supabase
-- public.profiles = Entité métier applicative représentant l'utilisateur côté The-Walk

-- ENUMS
create type public.table_role as enum ('gm', 'player', 'observer');
create type public.session_status as enum ('scheduled', 'active', 'completed', 'cancelled');
create type public.response_status as enum ('going', 'maybe', 'declined', 'pending');
create type public.presence_status as enum ('present', 'absent', 'late', 'excused');
create type public.invitation_status as enum ('pending', 'accepted', 'declined', 'expired');

-- TABLES

-- 1. Profiles (linked to auth.users)
create table public.profiles (
                                 id uuid references auth.users on delete cascade primary key,
                                 email text unique not null,
                                 display_name text,
                                 avatar_url text,
                                 created_at timestamptz default now() not null,
                                 updated_at timestamptz default now() not null
);

comment on table public.profiles is 'Entité métier principale pour l''utilisateur applicatif. Synchronisée avec auth.users via trigger.';

-- 2. Tables (RPG tables)
create table public.tables (
                               id uuid default gen_random_uuid() primary key,
                               name text not null,
                               description text,
                               owner_id uuid references public.profiles(id) on delete restrict not null,
                               created_at timestamptz default now() not null,
                               updated_at timestamptz default now() not null
);

-- 3. Table Memberships
create table public.table_memberships (
                                          id uuid default gen_random_uuid() primary key,
                                          table_id uuid references public.tables(id) on delete cascade not null,
                                          user_id uuid references public.profiles(id) on delete cascade not null,
                                          role public.table_role default 'player' not null,
                                          joined_at timestamptz default now() not null,
                                          unique(table_id, user_id)
);

-- 4. Sessions
create table public.sessions (
                                 id uuid default gen_random_uuid() primary key,
                                 table_id uuid references public.tables(id) on delete cascade not null,
                                 title text not null,
                                 description text,
                                 status public.session_status default 'scheduled' not null,
                                 scheduled_at timestamptz,
                                 started_at timestamptz,
                                 ended_at timestamptz,
                                 created_at timestamptz default now() not null,
                                 updated_at timestamptz default now() not null
);

-- 5. Session Responses
create table public.session_responses (
                                          id uuid default gen_random_uuid() primary key,
                                          session_id uuid references public.sessions(id) on delete cascade not null,
                                          user_id uuid references public.profiles(id) on delete cascade not null,
                                          status public.response_status default 'pending' not null,
                                          updated_at timestamptz default now() not null,
                                          unique(session_id, user_id)
);

-- 6. Invitations
create table public.invitations (
                                    id uuid default gen_random_uuid() primary key,
                                    table_id uuid references public.tables(id) on delete cascade not null,
                                    inviter_id uuid references public.profiles(id) on delete set null,
                                    email text not null,
                                    role public.table_role default 'player' not null,
                                    status public.invitation_status default 'pending' not null,
                                    token text unique not null,
                                    expires_at timestamptz,
                                    created_at timestamptz default now() not null,
                                    updated_at timestamptz default now() not null
);

-- 7. Pre-session Messages
create table public.pre_session_messages (
                                             id uuid default gen_random_uuid() primary key,
                                             session_id uuid references public.sessions(id) on delete cascade not null,
                                             user_id uuid references public.profiles(id) on delete set null,
                                             content text not null,
                                             created_at timestamptz default now() not null
);

-- 8. Live Session Messages
create table public.live_session_messages (
                                              id uuid default gen_random_uuid() primary key,
                                              session_id uuid references public.sessions(id) on delete cascade not null,
                                              user_id uuid references public.profiles(id) on delete set null,
                                              content text not null,
                                              created_at timestamptz default now() not null
);

-- 9. Session Presence
create table public.session_presence (
                                         id uuid default gen_random_uuid() primary key,
                                         session_id uuid references public.sessions(id) on delete cascade not null,
                                         user_id uuid references public.profiles(id) on delete cascade not null,
                                         status public.presence_status default 'present' not null,
                                         last_seen_at timestamptz default now() not null,
                                         unique(session_id, user_id)
);

-- 10. Personal Notes
create table public.personal_notes (
                                       id uuid default gen_random_uuid() primary key,
                                       user_id uuid references public.profiles(id) on delete cascade not null,
                                       table_id uuid references public.tables(id) on delete cascade,
                                       session_id uuid references public.sessions(id) on delete cascade,
                                       content text not null,
                                       created_at timestamptz default now() not null,
                                       updated_at timestamptz default now() not null
);

-- 11. Group Notes
create table public.group_notes (
                                    id uuid default gen_random_uuid() primary key,
                                    table_id uuid references public.tables(id) on delete cascade not null,
                                    session_id uuid references public.sessions(id) on delete cascade,
                                    content text not null,
                                    created_at timestamptz default now() not null,
                                    updated_at timestamptz default now() not null
);

-- INDEXES
create index idx_profiles_email on public.profiles(email);
create index idx_tables_owner on public.tables(owner_id);
create index idx_memberships_table on public.table_memberships(table_id);
create index idx_memberships_user on public.table_memberships(user_id);
create index idx_sessions_table on public.sessions(table_id);
create index idx_sessions_status on public.sessions(status);
create index idx_responses_session on public.session_responses(session_id);
create index idx_responses_user on public.session_responses(user_id);
create index idx_invitations_table on public.invitations(table_id);
create index idx_invitations_token on public.invitations(token);
create index idx_invitations_email on public.invitations(email);
create index idx_pre_messages_session on public.pre_session_messages(session_id);
create index idx_live_messages_session on public.live_session_messages(session_id);
create index idx_presence_session on public.session_presence(session_id);
create index idx_presence_user on public.session_presence(user_id);
create index idx_personal_notes_user on public.personal_notes(user_id);
create index idx_personal_notes_session on public.personal_notes(session_id);
create index idx_group_notes_table on public.group_notes(table_id);
create index idx_group_notes_session on public.group_notes(session_id);

-- TRIGGER for updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
return new;
end;
$$;

create trigger on_profiles_update
    before update on public.profiles
    for each row
    execute procedure public.handle_updated_at();

create trigger on_tables_update
    before update on public.tables
    for each row
    execute procedure public.handle_updated_at();

create trigger on_sessions_update
    before update on public.sessions
    for each row
    execute procedure public.handle_updated_at();

create trigger on_responses_update
    before update on public.session_responses
    for each row
    execute procedure public.handle_updated_at();

create trigger on_invitations_update
    before update on public.invitations
    for each row
    execute procedure public.handle_updated_at();

create trigger on_personal_notes_update
    before update on public.personal_notes
    for each row
    execute procedure public.handle_updated_at();

create trigger on_group_notes_update
    before update on public.group_notes
    for each row
    execute procedure public.handle_updated_at();

-- FUNCTION for profile creation on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
insert into public.profiles (
    id,
    email,
    display_name,
    avatar_url
)
values (
           new.id,
           new.email,
           coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
           new.raw_user_meta_data->>'avatar_url'
       );

return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute procedure public.handle_new_user();