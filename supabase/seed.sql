-- Minimal local seed for The-Walk
-- 3 users only, no tables, no sessions.
-- Password for all users: 1234AZER$
--
-- Intended for Supabase local `npx supabase db reset`

delete from auth.identities
where user_id in (
                  '11111111-1111-4111-8111-111111111111',
                  '22222222-2222-4222-8222-222222222222',
                  '33333333-3333-4333-8333-333333333333'
    );

delete from auth.users
where id in (
             '11111111-1111-4111-8111-111111111111',
             '22222222-2222-4222-8222-222222222222',
             '33333333-3333-4333-8333-333333333333'
    );

insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
)
values
    (
        '00000000-0000-0000-0000-000000000000',
        '11111111-1111-4111-8111-111111111111',
        'authenticated',
        'authenticated',
        'admin@email.com',
        crypt('1234AZER$', gen_salt('bf')),
        now(),
        null,
        '',
        null,
        '',
        null,
        '',
        '',
        null,
        null,
        '{"provider":"email","providers":["email"]}',
        '{"display_name":"Admin"}',
        false,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null,
        false,
        null,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '22222222-2222-4222-8222-222222222222',
        'authenticated',
        'authenticated',
        'user1@email.com',
        crypt('1234AZER$', gen_salt('bf')),
        now(),
        null,
        '',
        null,
        '',
        null,
        '',
        '',
        null,
        null,
        '{"provider":"email","providers":["email"]}',
        '{"display_name":"User 1"}',
        false,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null,
        false,
        null,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '33333333-3333-4333-8333-333333333333',
        'authenticated',
        'authenticated',
        'user2@email.com',
        crypt('1234AZER$', gen_salt('bf')),
        now(),
        null,
        '',
        null,
        '',
        null,
        '',
        '',
        null,
        null,
        '{"provider":"email","providers":["email"]}',
        '{"display_name":"User 2"}',
        false,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null,
        false,
        null,
        false
    );

insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
)
values
    (
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '11111111-1111-4111-8111-111111111111',
        jsonb_build_object(
                'sub', '11111111-1111-4111-8111-111111111111',
                'email', 'admin@email.com',
                'email_verified', true
        ),
        'email',
        'admin@email.com',
        now(),
        now(),
        now()
    ),
    (
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        '22222222-2222-4222-8222-222222222222',
        jsonb_build_object(
                'sub', '22222222-2222-4222-8222-222222222222',
                'email', 'user1@email.com',
                'email_verified', true
        ),
        'email',
        'user1@email.com',
        now(),
        now(),
        now()
    ),
    (
        'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        '33333333-3333-4333-8333-333333333333',
        jsonb_build_object(
                'sub', '33333333-3333-4333-8333-333333333333',
                'email', 'user2@email.com',
                'email_verified', true
        ),
        'email',
        'user2@email.com',
        now(),
        now(),
        now()
    );

-- The profile rows should be created automatically by the auth trigger.
