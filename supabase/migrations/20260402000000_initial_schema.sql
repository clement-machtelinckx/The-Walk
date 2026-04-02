-- V1 Initial Schema for The-Walk
-- Convention:
-- auth.users = Authentification technique Supabase
-- public.profiles = Entité métier applicative représentant l'utilisateur côté The-Walk (The-Walk core user)

-- ENUMS
CREATE TYPE public.table_role AS ENUM ('gm', 'player', 'observer');
CREATE TYPE public.session_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
CREATE TYPE public.response_status AS ENUM ('going', 'maybe', 'declined', 'pending');
CREATE TYPE public.presence_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- TABLES

-- 1. Profiles (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Entité métier principale pour l''utilisateur applicatif. Synchronisée avec auth.users via trigger.';

-- 2. Tables (RPG tables)
CREATE TABLE public.tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Table Memberships
CREATE TABLE public.table_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role public.table_role DEFAULT 'player' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(table_id, user_id)
);

-- 4. Sessions
CREATE TABLE public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status public.session_status DEFAULT 'scheduled' NOT NULL,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Session Responses
CREATE TABLE public.session_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status public.response_status DEFAULT 'pending' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(session_id, user_id)
);

-- 6. Invitations (By email/token link)
CREATE TABLE public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE NOT NULL,
    inviter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    email TEXT NOT NULL,
    role public.table_role DEFAULT 'player' NOT NULL,
    status public.invitation_status DEFAULT 'pending' NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Pre-session Messages (Preparation channel)
CREATE TABLE public.pre_session_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Live Session Messages (Live game channel)
CREATE TABLE public.live_session_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Session Presence (Real-time or check-in status)
CREATE TABLE public.session_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status public.presence_status DEFAULT 'present' NOT NULL,
    last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(session_id, user_id)
);

-- 10. Personal Notes
CREATE TABLE public.personal_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Group Notes
CREATE TABLE public.group_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_tables_owner ON public.tables(owner_id);
CREATE INDEX idx_memberships_table ON public.table_memberships(table_id);
CREATE INDEX idx_memberships_user ON public.table_memberships(user_id);
CREATE INDEX idx_sessions_table ON public.sessions(table_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_responses_session ON public.session_responses(session_id);
CREATE INDEX idx_invitations_table ON public.invitations(table_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_pre_messages_session ON public.pre_session_messages(session_id);
CREATE INDEX idx_live_messages_session ON public.live_session_messages(session_id);
CREATE INDEX idx_presence_session ON public.session_presence(session_id);
CREATE INDEX idx_personal_notes_user ON public.personal_notes(user_id);
CREATE INDEX idx_group_notes_table ON public.group_notes(table_id);

-- TRIGGER for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_update BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_tables_update BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_sessions_update BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_responses_update BEFORE UPDATE ON public.session_responses FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_invitations_update BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_personal_notes_update BEFORE UPDATE ON public.personal_notes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_group_notes_update BEFORE UPDATE ON public.group_notes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- FUNCTION for profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur auth.users (attention, nécessite les bons droits lors de l'exécution initiale)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
