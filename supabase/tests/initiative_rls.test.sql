begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(13);

select extensions.has_table(
    'public',
    'session_initiative_entries',
    'initiative entries table exists'
);

select extensions.has_table(
    'public',
    'session_initiative_state',
    'initiative state table exists'
);

insert into public.tables (id, name, owner_id)
values
    (
        'b1000000-0000-4000-8000-000000000001',
        'Initiative test table',
        '11111111-1111-4111-8111-111111111111'
    ),
    (
        'b1000000-0000-4000-8000-000000000002',
        'Other initiative table',
        '33333333-3333-4333-8333-333333333333'
    );

insert into public.table_memberships (table_id, user_id, role)
values
    (
        'b1000000-0000-4000-8000-000000000001',
        '11111111-1111-4111-8111-111111111111',
        'gm'
    ),
    (
        'b1000000-0000-4000-8000-000000000001',
        '22222222-2222-4222-8222-222222222222',
        'player'
    ),
    (
        'b1000000-0000-4000-8000-000000000002',
        '33333333-3333-4333-8333-333333333333',
        'gm'
    );

insert into public.sessions (id, table_id, title, status)
values
    (
        'b2000000-0000-4000-8000-000000000001',
        'b1000000-0000-4000-8000-000000000001',
        'Initiative live',
        'active'
    ),
    (
        'b2000000-0000-4000-8000-000000000002',
        'b1000000-0000-4000-8000-000000000002',
        'Other initiative live',
        'active'
    );

set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-4111-8111-111111111111',
    true
);

select extensions.lives_ok(
    $$insert into public.session_initiative_entries (
          id, session_id, table_id, participant_type, user_id, initiative_requested_at,
          position, created_by
      ) values (
          'b3000000-0000-4000-8000-000000000001',
          'b2000000-0000-4000-8000-000000000001',
          'b1000000-0000-4000-8000-000000000001',
          'member',
          '22222222-2222-4222-8222-222222222222',
          now(),
          0,
          '11111111-1111-4111-8111-111111111111'
      )$$,
    'a GM can add a member initiative entry'
);

select extensions.lives_ok(
    $$insert into public.session_initiative_entries (
          id, session_id, table_id, participant_type, label, position, created_by
      ) values (
          'b3000000-0000-4000-8000-000000000002',
          'b2000000-0000-4000-8000-000000000001',
          'b1000000-0000-4000-8000-000000000001',
          'custom',
          'Boss',
          1,
          '11111111-1111-4111-8111-111111111111'
      )$$,
    'a GM can add a custom initiative entry'
);

select extensions.lives_ok(
    $$insert into public.session_initiative_state (
          session_id, table_id, initiative_requested_at, requested_by
      ) values (
          'b2000000-0000-4000-8000-000000000001',
          'b1000000-0000-4000-8000-000000000001',
          now(),
          '11111111-1111-4111-8111-111111111111'
      )$$,
    'a GM can request initiative'
);

select extensions.throws_ok(
    $$insert into public.session_initiative_entries (
          session_id, table_id, participant_type, label, position, created_by
      ) values (
          'b2000000-0000-4000-8000-000000000002',
          'b1000000-0000-4000-8000-000000000001',
          'custom',
          'Cross table',
          2,
          '11111111-1111-4111-8111-111111111111'
      )$$,
    '23514',
    'Initiative entry session_id must belong to table_id',
    'initiative entries reject cross-table sessions'
);

select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-4222-8222-222222222222',
    true
);

select extensions.lives_ok(
    $$insert into public.session_dice_rolls (
          id, table_id, session_id, user_id, dice_type, quantity, modifier, rolls, total, roll_kind
      ) values (
          'b4000000-0000-4000-8000-000000000001',
          'b1000000-0000-4000-8000-000000000001',
          'b2000000-0000-4000-8000-000000000001',
          '22222222-2222-4222-8222-222222222222',
          20, 1, 3, array[14], 17, 'initiative'
      )$$,
    'a player can persist an initiative dice roll'
);

select extensions.lives_ok(
    $$update public.session_initiative_entries
      set initiative_score = 17,
          initiative_modifier = 3,
          last_roll_id = 'b4000000-0000-4000-8000-000000000001'
      where id = 'b3000000-0000-4000-8000-000000000001'$$,
    'a requested player can submit their own matching roll'
);

select extensions.results_eq(
    $$select count(*)::integer
      from public.session_initiative_entries
      where session_id = 'b2000000-0000-4000-8000-000000000001'$$,
    $$values (2)$$,
    'a table member can read the full initiative order'
);

select extensions.throws_ok(
    $$update public.session_initiative_entries
      set position = 9
      where id = 'b3000000-0000-4000-8000-000000000001'$$,
    '42501',
    'Players can only submit their own pending initiative',
    'a player cannot reorder their own entry'
);

select extensions.is_empty(
    $$update public.session_initiative_entries
      set initiative_score = 99
      where id = 'b3000000-0000-4000-8000-000000000002'
      returning id$$,
    'a player cannot update a custom participant'
);

select extensions.is_empty(
    $$delete from public.session_initiative_entries
      where id = 'b3000000-0000-4000-8000-000000000002'
      returning id$$,
    'a player cannot remove initiative entries'
);

select set_config(
    'request.jwt.claim.sub',
    '33333333-3333-4333-8333-333333333333',
    true
);

select extensions.is_empty(
    $$select id
      from public.session_initiative_entries
      where session_id = 'b2000000-0000-4000-8000-000000000001'$$,
    'initiative entries are not exposed across tables'
);

select extensions.finish();

rollback;
