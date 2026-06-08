begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(9);

insert into public.tables (id, name, owner_id)
values
    (
        'a1000000-0000-4000-8000-000000000001',
        'RLS test table',
        '11111111-1111-4111-8111-111111111111'
    ),
    (
        'a1000000-0000-4000-8000-000000000002',
        'Other RLS test table',
        '33333333-3333-4333-8333-333333333333'
    );

insert into public.table_memberships (table_id, user_id, role)
values
    (
        'a1000000-0000-4000-8000-000000000001',
        '11111111-1111-4111-8111-111111111111',
        'gm'
    ),
    (
        'a1000000-0000-4000-8000-000000000001',
        '22222222-2222-4222-8222-222222222222',
        'player'
    ),
    (
        'a1000000-0000-4000-8000-000000000002',
        '33333333-3333-4333-8333-333333333333',
        'gm'
    );

insert into public.sessions (id, table_id, title, status)
values
    (
        'a2000000-0000-4000-8000-000000000001',
        'a1000000-0000-4000-8000-000000000001',
        'RLS test session',
        'scheduled'
    ),
    (
        'a2000000-0000-4000-8000-000000000002',
        'a1000000-0000-4000-8000-000000000002',
        'Other RLS test session',
        'scheduled'
    );

insert into public.notifications (id, user_id, type, title, body, href, data)
values
    (
        'a3000000-0000-4000-8000-000000000001',
        '22222222-2222-4222-8222-222222222222',
        'test',
        'Own notification',
        'Trusted body',
        '/tables/a1000000-0000-4000-8000-000000000001',
        '{"trusted": true}'
    ),
    (
        'a3000000-0000-4000-8000-000000000002',
        '33333333-3333-4333-8333-333333333333',
        'test',
        'Other notification',
        'Other trusted body',
        '/tables/a1000000-0000-4000-8000-000000000002',
        '{"trusted": true}'
    );

set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-4222-8222-222222222222',
    true
);

select extensions.lives_ok(
    $$update public.profiles
      set avatar_key = 'adventurer'
      where id = '22222222-2222-4222-8222-222222222222'$$,
    'users can update their avatar_key'
);

select extensions.throws_ok(
    $$update public.profiles
      set display_name = 'Forged name'
      where id = '22222222-2222-4222-8222-222222222222'$$,
    '42501',
    'Only profile avatar_key can be changed',
    'users cannot update display_name'
);

select extensions.throws_ok(
    $$update public.profiles
      set email = 'forged@example.com'
      where id = '22222222-2222-4222-8222-222222222222'$$,
    '42501',
    'Only profile avatar_key can be changed',
    'users cannot update another protected profile field'
);

select extensions.lives_ok(
    $$update public.notifications
      set is_read = true, read_at = now()
      where id = 'a3000000-0000-4000-8000-000000000001'$$,
    'users can mark their own notification as read'
);

select extensions.throws_ok(
    $$update public.notifications
      set title = 'Forged title'
      where id = 'a3000000-0000-4000-8000-000000000001'$$,
    '42501',
    'Only notification read state can be changed',
    'users cannot update notification content'
);

select extensions.is_empty(
    $$update public.notifications
      set is_read = true, read_at = now()
      where id = 'a3000000-0000-4000-8000-000000000002'
      returning id$$,
    'users cannot update another user notification'
);

select extensions.lives_ok(
    $$insert into public.session_dice_rolls (
          table_id, session_id, user_id, dice_type, quantity, modifier, rolls, total, roll_kind
      ) values (
          'a1000000-0000-4000-8000-000000000001',
          'a2000000-0000-4000-8000-000000000001',
          '22222222-2222-4222-8222-222222222222',
          6, 1, 0, array[4], 4, 'standard'
      )$$,
    'members can insert a dice roll for a session in the same table'
);

select extensions.throws_ok(
    $$insert into public.session_dice_rolls (
          table_id, session_id, user_id, dice_type, quantity, modifier, rolls, total, roll_kind
      ) values (
          'a1000000-0000-4000-8000-000000000001',
          'a2000000-0000-4000-8000-000000000002',
          '22222222-2222-4222-8222-222222222222',
          6, 1, 0, array[4], 4, 'standard'
      )$$,
    '23514',
    'Dice roll session_id must belong to table_id',
    'members cannot associate a dice roll with a session from another table'
);

reset role;
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    '33333333-3333-4333-8333-333333333333',
    true
);

select extensions.throws_ok(
    $$insert into public.session_dice_rolls (
          table_id, session_id, user_id, dice_type, quantity, modifier, rolls, total, roll_kind
      ) values (
          'a1000000-0000-4000-8000-000000000001',
          null,
          '33333333-3333-4333-8333-333333333333',
          20, 1, 0, array[12], 12, 'standard'
      )$$,
    '42501',
    'new row violates row-level security policy for table "session_dice_rolls"',
    'non-members cannot insert dice rolls'
);

select extensions.finish();

rollback;
