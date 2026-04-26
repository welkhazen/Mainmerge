-- Profiles table
-- We'll use a UUID but not strictly reference auth.users yet if we're using custom auth.
-- However, to keep it forward-compatible, we'll use a UUID.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  phone_hash TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  traits JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Community Memberships
CREATE TABLE IF NOT EXISTS public.community_memberships (
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (community_id, user_id)
);

ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- Polls
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.profiles(id),
  question TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- Poll Options
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL
);

ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;

-- Poll Answers
CREATE TABLE IF NOT EXISTS public.poll_answers (
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (poll_id, user_id)
);

ALTER TABLE public.poll_answers ENABLE ROW LEVEL SECURITY;

-- User Events
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- For custom auth, we might need more permissive policies if the backend is the one doing the work
-- But since we use SERVICE_ROLE_KEY on backend, RLS is bypassed there.
-- These are mostly for frontend direct access if we ever do that.

-- Communities
CREATE POLICY "Public communities are viewable by everyone" ON public.communities
  FOR SELECT USING (is_public = true);

-- Polls
CREATE POLICY "Anyone can view polls in public communities" ON public.polls
  FOR SELECT USING (true);

-- Poll Options
CREATE POLICY "Anyone can view poll options" ON public.poll_options
  FOR SELECT USING (true);

-- Poll Answers
CREATE POLICY "Users can view their own answers" ON public.poll_answers
  FOR SELECT USING (user_id = auth.uid());
