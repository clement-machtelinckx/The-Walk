-- Migration: 20260601000000_session_dice_rolls.sql
-- Description: Persistent table-level dice roll journal with optional session context.

create table public.session_dice_rolls (
    id uuid default gen_random_uuid() primary key,
    table_id uuid references public.tables(id) on delete cascade not null,
    session_id uuid references public.sessions(id) on delete set null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    dice_type integer not null,
    quantity integer default 1 not null,
    modifier integer default 0 not null,
    rolls integer[] not null,
    total integer not null,
    roll_kind text default 'standard' not null,
    created_at timestamptz default now() not null,
    constraint session_dice_rolls_dice_type_check
        check (dice_type in (3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 30, 100)),
    constraint session_dice_rolls_quantity_check check (quantity between 1 and 20),
    constraint session_dice_rolls_modifier_check check (modifier between -999 and 999),
    constraint session_dice_rolls_rolls_count_check check (cardinality(rolls) = quantity),
    constraint session_dice_rolls_roll_kind_check check (char_length(roll_kind) between 1 and 40)
);

create index idx_session_dice_rolls_table_created
    on public.session_dice_rolls(table_id, created_at desc);

create index idx_session_dice_rolls_user
    on public.session_dice_rolls(user_id);

create index idx_session_dice_rolls_session
    on public.session_dice_rolls(session_id)
    where session_id is not null;

alter table public.session_dice_rolls enable row level security;

create policy "Dice rolls are viewable by table members"
    on public.session_dice_rolls for select
    using (
        exists (
            select 1
            from public.table_memberships tm
            where tm.table_id = public.session_dice_rolls.table_id
            and tm.user_id = auth.uid()
        )
    );

create policy "Table members can create dice rolls"
    on public.session_dice_rolls for insert
    with check (
        auth.uid() = user_id
        and exists (
            select 1
            from public.table_memberships tm
            where tm.table_id = public.session_dice_rolls.table_id
            and tm.user_id = auth.uid()
        )
    );

