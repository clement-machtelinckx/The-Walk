-- Seed data for The-Walk local development
-- password for all users: "1234AZER$"
-- Intended for local dev after `supabase db reset`

-- =========================================================
-- 1. Auth users
-- =========================================================

insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
)
values
    (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'yazii@email.com',
        crypt('1234AZER$', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"display_name":"Yazii"}',
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'test@email.com',
        crypt('1234AZER$', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"display_name":"Testeur 1"}',
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'test2@email.com',
        crypt('1234AZER$', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"display_name":"Testeur 2"}',
        now(),
        now()
    );

-- =========================================================
-- 2. Business profiles
-- Explicit insert for reliable local seed
-- =========================================================

insert into public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    created_at,
    updated_at
)
values
    (
        '00000000-0000-0000-0000-000000000001',
        'yazii@email.com',
        'Yazii',
        null,
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'test@email.com',
        'Testeur 1',
        null,
        now(),
        now()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'test2@email.com',
        'Testeur 2',
        null,
        now(),
        now()
    )
    on conflict (id) do update
                            set
                                email = excluded.email,
                            display_name = excluded.display_name,
                            avatar_url = excluded.avatar_url,
                            updated_at = now();

-- =========================================================
-- 3. Table
-- =========================================================

insert into public.tables (
    id,
    name,
    description,
    owner_id,
    created_at,
    updated_at
)
values
    (
        '11111111-1111-1111-1111-111111111111',
        'Table de test locale',
        'Une table générée automatiquement pour le développement.',
        '00000000-0000-0000-0000-000000000001',
        now(),
        now()
    );

-- =========================================================
-- 4. Membership owner (GM)
-- table_memberships has joined_at, not created_at/updated_at
-- =========================================================

insert into public.table_memberships (
    table_id,
    user_id,
    role,
    joined_at
)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000001',
        'gm',
        now()
    );

-- =========================================================
-- 5. Targeted invitation
-- =========================================================

insert into public.invitations (
    table_id,
    inviter_id,
    email,
    role,
    status,
    token,
    expires_at,
    created_at,
    updated_at
)
values
    (
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000001',
        'test2@email.com',
        'player',
        'pending',
        'token-invitation-test-targeted',
        now() + interval '7 days',
        now(),
        now()
    );

-- =========================================================
-- 6. Scheduled session
-- =========================================================

insert into public.sessions (
    table_id,
    title,
    description,
    status,
    scheduled_at,
    created_at,
    updated_at
)
values
    (
        '11111111-1111-1111-1111-111111111111',
        'Session 1 : Le Réveil',
        'Première session de test du seed.',
        'scheduled',
        now() + interval '2 days',
        now(),
        now()
    );