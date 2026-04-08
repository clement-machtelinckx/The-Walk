-- Seed data for The-Walk local development
-- password for all users: "password"

-- 1. Create Users in auth.users
-- The trigger on_auth_user_created will automatically create the public.profiles
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'yazii@email.com', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Yazii"}', 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'test@email.com', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Testeur 1"}', 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'test2@email.com', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Testeur 2"}', 'authenticated', 'authenticated');

-- 2. Create Table
insert into public.tables (id, name, description, owner_id)
values
    ('11111111-1111-1111-1111-111111111111', 'Table de test locale', 'Une table générée automatiquement pour le développement.', '00000000-0000-0000-0000-000000000001');

-- 3. Create Membership for the owner (GM)
insert into public.table_memberships (table_id, user_id, role)
values
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'gm');

-- 4. Create Targeted Invitation for test2
insert into public.invitations (table_id, inviter_id, email, role, status, token, expires_at)
values
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'test2@email.com', 'player', 'pending', 'token-invitation-test-targeted', now() + interval '7 days');

-- 5. Create a Scheduled Session
insert into public.sessions (table_id, title, description, status, scheduled_at)
values
    ('11111111-1111-1111-1111-111111111111', 'Session 1 : Le Réveil', 'Première session de test du seed.', 'scheduled', now() + interval '2 days');
