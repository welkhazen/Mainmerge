-- communities table was missing INSERT/UPDATE policies and GRANTs
-- Without these, createCommunityFromRequest upsert fails silently

DROP POLICY IF EXISTS "anon_write" ON communities;
DROP POLICY IF EXISTS "anon_update" ON communities;

CREATE POLICY "anon_write" ON communities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update" ON communities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

GRANT INSERT, UPDATE ON communities TO anon, authenticated;
