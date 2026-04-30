-- poll_options was missing RLS policies — options were silently dropped on insert

CREATE POLICY "public_read" ON poll_options FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert" ON poll_options FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_delete" ON poll_options FOR DELETE TO anon, authenticated USING (true);

GRANT SELECT, INSERT, DELETE ON poll_options TO anon, authenticated;
