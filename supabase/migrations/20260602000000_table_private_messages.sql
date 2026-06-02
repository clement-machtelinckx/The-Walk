-- Migration: 20260602000000_table_private_messages.sql
-- Description: Add table-scoped 1-to-1 private messages with optional session context.

create table public.table_private_messages (
    id uuid default gen_random_uuid() primary key,
    table_id uuid references public.tables(id) on delete cascade not null,
    session_id uuid references public.sessions(id) on delete set null,
    sender_user_id uuid references public.profiles(id) on delete cascade not null,
    recipient_user_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    created_at timestamptz default now() not null,
    constraint table_private_messages_no_self_message check (sender_user_id <> recipient_user_id)
);

create index idx_table_private_messages_table on public.table_private_messages(table_id);
create index idx_table_private_messages_session on public.table_private_messages(session_id);
create index idx_table_private_messages_sender on public.table_private_messages(sender_user_id);
create index idx_table_private_messages_recipient on public.table_private_messages(recipient_user_id);
create index idx_table_private_messages_pair on public.table_private_messages(
    table_id,
    sender_user_id,
    recipient_user_id,
    created_at
);

alter table public.table_private_messages enable row level security;

create policy "Table private messages readable by participants"
    on public.table_private_messages for select
    using (
        (
            auth.uid() = sender_user_id
            or auth.uid() = recipient_user_id
        )
        and exists (
            select 1
            from public.table_memberships membership
            where membership.table_id = public.table_private_messages.table_id
            and membership.user_id = auth.uid()
        )
    );

create policy "Table private messages insertable by sender"
    on public.table_private_messages for insert
    with check (
        auth.uid() = sender_user_id
        and exists (
            select 1
            from public.table_memberships sender_membership
            join public.table_memberships recipient_membership
                on recipient_membership.table_id = sender_membership.table_id
                and recipient_membership.user_id = public.table_private_messages.recipient_user_id
            where sender_membership.table_id = public.table_private_messages.table_id
            and sender_membership.user_id = auth.uid()
        )
        and (
            session_id is null
            or exists (
                select 1
                from public.sessions s
                where s.id = public.table_private_messages.session_id
                and s.table_id = public.table_private_messages.table_id
            )
        )
    );
