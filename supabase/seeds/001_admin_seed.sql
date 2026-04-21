-- Seed: Admin User
-- Run this after migrations to create initial admin user
-- Username: admin | Password: (bcrypt hashed - set securely in production)

INSERT INTO users (
  username,
  password_hash,
  email,
  avatar_level,
  role,
  status
) VALUES (
  'admin',
  '$2a$12$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQR', -- Replace with real bcrypt hash
  'admin@theartofraw.me',
  8,
  'admin',
  'active'
) ON CONFLICT (username) DO NOTHING;

-- Insert avatar levels if not exists
INSERT INTO avatars (level, name, theme_token, description) VALUES
(1, 'Mossgrown', 'avatar-1', 'Stone guardian'),
(2, 'Combat Helm', 'avatar-2', 'Orange-visored robot'),
(3, 'Plasma Wraith', 'avatar-3', 'Electric-blue figure'),
(4, 'Shadow Panther', 'avatar-4', 'Black panther mask'),
(5, 'Death Chrome', 'avatar-5', 'Silver skull, red eyes'),
(6, 'Gilded Samurai', 'avatar-6', 'Gold warrior'),
(7, 'Neon Streamer', 'avatar-7', 'Pink-haired gamer'),
(8, 'Violet Overlord', 'avatar-8', 'Purple mecha')
ON CONFLICT (level) DO NOTHING;

-- Insert default challenges
INSERT INTO challenges (slug, name, description, target, reward_xp, status) VALUES
('first-5-polls', 'First 5 Polls', 'Vote on 5 polls to unlock level 2', 5, 50, 'active'),
('community-explorer', 'Community Explorer', 'Join 3 communities', 3, 100, 'active'),
('power-voter', 'Power Voter', 'Vote on 20 polls in one week', 20, 200, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert founding communities
INSERT INTO communities (slug, name, description, status, created_by) VALUES
('general', 'General Discussion', 'Anything and everything', 'active', (SELECT id FROM users WHERE username = 'admin' LIMIT 1)),
('tech', 'Tech & Innovation', 'Technology, startups, and innovation', 'active', (SELECT id FROM users WHERE username = 'admin' LIMIT 1)),
('life', 'Life & Culture', 'Culture, relationships, and daily life', 'active', (SELECT id FROM users WHERE username = 'admin' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;
