-- Backfill communities for any approved requests that never got inserted
-- (failed silently before communities INSERT policy was added)

INSERT INTO communities (id, abbr, title, description, topic, status, locked, created_at, created_by)
SELECT
  'request-' || r.id::text,
  upper(substring(r.community_name from 1 for 1)) ||
    upper(substring(r.community_name from position(' ' in r.community_name) + 1 for 1)),
  r.community_name,
  r.why_now,
  CASE WHEN r.sample_prompt <> '' THEN r.sample_prompt ELSE r.focus_area END,
  'Early Access',
  false,
  COALESCE(r.reviewed_at, r.submitted_at),
  r.requester_name
FROM community_requests r
WHERE r.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM communities c WHERE c.id = 'request-' || r.id::text
  );
