-- Remove the old seeded admin row that has no password (cannot be used for login).
-- After signing up via the UI with your desired admin username, promote it here.

DELETE FROM users WHERE username = 'admin' AND password_hash IS NULL;

-- Insert admin user with username 'admin' and password 'Admin123!'
INSERT INTO users (id, username, password_hash, role, status, warnings, avatar_level)
VALUES (
	gen_random_uuid(),
	'admin',
	crypt('Admin123!', gen_salt('bf')),
	'admin',
	'active',
	0,
	1
)
ON CONFLICT (username) DO NOTHING;

-- Replace 'yourusername' with the username you signed up with, then run:
-- npx supabase db query --linked --file supabase/seed.sql
-- UPDATE users SET role = 'admin' WHERE username = 'yourusername';
