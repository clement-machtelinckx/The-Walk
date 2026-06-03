-- Migration: 20260605000000_session_live_enabled_modules.sql
-- Description: Relation table for live modules enabled per session.

create table public.session_live_enabled_modules (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.sessions(id) on delete cascade not null,
    module_key text not null,
    created_at timestamptz default now() not null,
    constraint session_live_enabled_modules_unique unique (session_id, module_key),
    constraint session_live_enabled_modules_module_key_check
        check (
            module_key = lower(module_key)
            and module_key ~ '^([a-z][a-z0-9_]*|__[a-z0-9_]+)$'
        )
);

create index idx_session_live_enabled_modules_session
    on public.session_live_enabled_modules(session_id);

alter table public.session_live_enabled_modules enable row level security;

create policy "Live enabled modules are viewable by table members"
    on public.session_live_enabled_modules for select
    using (
        exists (
            select 1
            from public.sessions s
            join public.table_memberships tm on tm.table_id = s.table_id
            where s.id = public.session_live_enabled_modules.session_id
            and tm.user_id = auth.uid()
        )
    );

create policy "GMs can create live enabled modules"
    on public.session_live_enabled_modules for insert
    with check (
        exists (
            select 1
            from public.sessions s
            join public.table_memberships tm on tm.table_id = s.table_id
            where s.id = public.session_live_enabled_modules.session_id
            and tm.user_id = auth.uid()
            and tm.role = 'gm'
        )
    );

create policy "GMs can delete live enabled modules"
    on public.session_live_enabled_modules for delete
    using (
        exists (
            select 1
            from public.sessions s
            join public.table_memberships tm on tm.table_id = s.table_id
            where s.id = public.session_live_enabled_modules.session_id
            and tm.user_id = auth.uid()
            and tm.role = 'gm'
        )
    );
