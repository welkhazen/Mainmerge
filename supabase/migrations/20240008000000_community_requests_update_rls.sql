-- community_requests was missing an UPDATE policy — status changes were silently blocked

CREATE POLICY "anon_update" ON community_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

GRANT UPDATE ON community_requests TO anon, authenticated;
