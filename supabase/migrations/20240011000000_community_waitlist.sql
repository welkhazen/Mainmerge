-- Per-community waitlist used by locked / Early Access communities.
-- Each user can join a community waitlist at most once.

CREATE TABLE IF NOT EXISTS community_waitlist (
  community_id text NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  username text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_waitlist_community_idx
  ON community_waitlist (community_id);

ALTER TABLE community_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON community_waitlist
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_write" ON community_waitlist
  FOR INSERT TO anon, authenticated WITH CHECK (true);

GRANT SELECT, INSERT ON community_waitlist TO anon, authenticated;

-- Atomic join: insert (idempotent) and return the resulting waitlist count.
CREATE OR REPLACE FUNCTION public.join_community_waitlist(
  p_community_id text,
  p_user_id text,
  p_username text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO community_waitlist (community_id, user_id, username)
  VALUES (p_community_id, p_user_id, p_username)
  ON CONFLICT (community_id, user_id) DO NOTHING;

  SELECT count(*)::int INTO v_count
  FROM community_waitlist
  WHERE community_id = p_community_id;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_community_waitlist(text, text, text)
  TO anon, authenticated;
