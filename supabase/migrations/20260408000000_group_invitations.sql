-- Migration: 20260408000000_group_invitations.sql
-- Description: Create table_group_invitations for public, time-limited table invitations.

create table public.table_group_invitations (
    id uuid default gen_random_uuid() primary key,
    table_id uuid references public.tables(id) on delete cascade not null,
    role public.table_role default 'player' not null,
    token text unique not null,
    created_by uuid references public.profiles(id) on delete set null,
    expires_at timestamptz not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

comment on table public.table_group_invitations is 'Liens d''invitation de groupe temporaires et partageables pour une table.';

-- Indexes
create index idx_group_invitations_table on public.table_group_invitations(table_id);
create index idx_group_invitations_token on public.table_group_invitations(token);
create index idx_group_invitations_expires on public.table_group_invitations(expires_at);

-- Trigger for updated_at
create trigger on_group_invitations_update
    before update on public.table_group_invitations
    for each row
    execute procedure public.handle_updated_at();

-- RLS
alter table public.table_group_invitations enable row level security;

-- Policies
create policy "Anyone can read group invitations by token"
    on public.table_group_invitations for select
    using (true);

create policy "GMs can manage group invitations"
    on public.table_group_invitations for all
    using (
        exists (
            select 1 from public.table_memberships
            where table_id = table_group_invitations.table_id
            and user_id = auth.uid()
            and role = 'gm'
        )
    );
