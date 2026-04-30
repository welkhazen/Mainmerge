CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- signup_user: hashes password server-side, inserts user row, returns user data
CREATE OR REPLACE FUNCTION public.signup_user(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RETURN json_build_object('ok', false, 'error', 'Username is already taken');
  END IF;

  v_id := gen_random_uuid();

  INSERT INTO users (id, username, password_hash, role, status, warnings, avatar_level)
  VALUES (v_id, trim(p_username), crypt(p_password, gen_salt('bf')), 'user', 'active', 0, 1);

  RETURN json_build_object(
    'ok', true,
    'user', json_build_object(
      'id', v_id,
      'username', trim(p_username),
      'role', 'user',
      'status', 'active',
      'avatar_level', 1
    )
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('ok', false, 'error', 'Username is already taken');
END;
$$;

GRANT EXECUTE ON FUNCTION public.signup_user(text, text) TO anon, authenticated;

-- login_user: verifies password against stored bcrypt hash, returns user data
CREATE OR REPLACE FUNCTION public.login_user(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user users%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM users WHERE username = p_username;

  IF NOT FOUND OR v_user.password_hash IS NULL
     OR v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
    RETURN json_build_object('ok', false, 'error', 'Invalid username or password');
  END IF;

  RETURN json_build_object(
    'ok', true,
    'user', json_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'role', v_user.role,
      'status', v_user.status,
      'avatar_level', v_user.avatar_level
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.login_user(text, text) TO anon, authenticated;
