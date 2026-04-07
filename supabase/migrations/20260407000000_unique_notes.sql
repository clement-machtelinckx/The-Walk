-- Migration: Unique notes per table
-- Ensures one personal note per user per table and one group note per table

-- 1. Personal Notes: Ensure user has only one note per table when session_id is null
-- Note: We allow session_id to be null for "table-level" notes.
-- If we want strictly ONE personal note per table regardless of session, we use this:
alter table public.personal_notes add constraint personal_notes_table_user_unique unique (table_id, user_id);

-- 2. Group Notes: Ensure one group note per table
alter table public.group_notes add constraint group_notes_table_unique unique (table_id);

-- Clean up any duplicates before applying (optional, but safer if data exists)
-- (Assuming fresh dev environment or manual cleanup if it fails)
