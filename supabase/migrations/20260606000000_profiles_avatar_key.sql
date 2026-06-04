alter table public.profiles
    add column avatar_key text;

comment on column public.profiles.avatar_key is 'Clé métier de l''avatar statique sélectionné par l''utilisateur.';
