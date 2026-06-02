-- Migration: 20260603000000_email_delivery_logs.sql
-- Description: Add transactional email delivery logs and monthly usage tracking base.

create table public.email_delivery_logs (
    id uuid default gen_random_uuid() primary key,
    email_type text not null,
    recipient_email text not null,
    sender_user_id uuid references public.profiles(id) on delete set null,
    status text not null check (status in ('sent', 'failed', 'quota_blocked')),
    provider text check (provider in ('mailtrap', 'brevo')),
    provider_message_id text,
    error_message text,
    metadata jsonb,
    created_at timestamptz default now() not null
);

create index idx_email_delivery_logs_sender_month
    on public.email_delivery_logs(sender_user_id, created_at)
    where sender_user_id is not null;

create index idx_email_delivery_logs_sender_status_month
    on public.email_delivery_logs(sender_user_id, status, created_at)
    where sender_user_id is not null;

create index idx_email_delivery_logs_type_month
    on public.email_delivery_logs(email_type, created_at);

alter table public.email_delivery_logs enable row level security;
