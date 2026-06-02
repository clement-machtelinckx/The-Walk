-- Migration: 20260604000000_in_app_notifications.sql
-- Description: Add minimal in-app notifications with read state.

create table public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    type text not null,
    title text not null,
    body text,
    resource_type text,
    resource_id uuid,
    href text,
    data jsonb,
    is_read boolean default false not null,
    created_at timestamptz default now() not null,
    read_at timestamptz,
    constraint notifications_type_check check (char_length(type) between 1 and 80),
    constraint notifications_title_check check (char_length(title) between 1 and 160),
    constraint notifications_body_check check (body is null or char_length(body) <= 500),
    constraint notifications_resource_type_check
        check (resource_type is null or char_length(resource_type) between 1 and 80),
    constraint notifications_href_check check (href is null or char_length(href) <= 500),
    constraint notifications_read_at_check check (
        (is_read = false and read_at is null)
        or (is_read = true)
    )
);

create index idx_notifications_user_created
    on public.notifications(user_id, created_at desc);

create index idx_notifications_user_unread
    on public.notifications(user_id, created_at desc)
    where is_read = false;

create index idx_notifications_resource
    on public.notifications(resource_type, resource_id)
    where resource_type is not null and resource_id is not null;

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

create policy "Users can update own notifications"
    on public.notifications for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
