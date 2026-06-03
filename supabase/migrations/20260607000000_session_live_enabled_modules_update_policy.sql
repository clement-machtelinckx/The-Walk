-- Allow idempotent upserts on already enabled live module rows.
create policy "GMs can update live enabled modules"
    on public.session_live_enabled_modules for update
    using (
        exists (
            select 1
            from public.sessions s
            join public.table_memberships tm on tm.table_id = s.table_id
            where s.id = public.session_live_enabled_modules.session_id
            and tm.user_id = auth.uid()
            and tm.role = 'gm'
        )
    )
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
