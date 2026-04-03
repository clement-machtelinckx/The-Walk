-- Migration: 20260403000000_login_tokens.sql
-- Description: Create login_tokens table for single-use direct login links.

-- Table: login_tokens
create table public.login_tokens (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    token_hash text not null unique,
    expires_at timestamptz not null,
    used_at timestamptz,
    redirect_to text default '/tables' not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

comment on table public.login_tokens is 'Tokens à usage unique pour la connexion directe par lien.';

-- Index for lookup by hash
create index idx_login_tokens_hash on public.login_tokens(token_hash);
create index idx_login_tokens_profile_id on public.login_tokens(profile_id);

-- Trigger for updated_at
create trigger on_login_tokens_update
    before update on public.login_tokens
    for each row
    execute procedure public.handle_updated_at();

-- RLS (Row Level Security)
-- This table should only be accessible via the service_role or server-side functions.
-- We don't want any public or authenticated user access by default.
alter table public.login_tokens enable row level security;

-- No policies = deny all (except service_role)
