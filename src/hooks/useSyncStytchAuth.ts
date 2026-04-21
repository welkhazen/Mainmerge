import { useEffect } from 'react';
import { useStytchSession, useStytchUser } from '@stytch/react';
import { useRawStore } from '@/store/useRawStore';
import { isStytchEnabled } from '@/providers/StytchProvider';

function useSyncStytchAuthEnabled() {
  const { session, isInitialized } = useStytchSession();
  const { user } = useStytchUser();
  const { setStytchSession } = useRawStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (session) {
      // User is logged in via Stytch
      const email = user?.emails?.[0]?.email;
      const userId = user?.user_id;
      const sessionToken = (session as unknown as { session_token?: string }).session_token;
      
      setStytchSession({
        authenticated: true,
        userId,
        email,
        sessionToken,
      });
    } else {
      // User is not logged in via Stytch - don't call logout, just reset session
      setStytchSession(null);
    }
  }, [session, isInitialized, setStytchSession]);

  return { isInitialized, isStytchAuthenticated: !!session };
}

/**
 * Hook to sync Stytch authentication with RawStore
 * When a user logs in via Stytch, this automatically updates the RawStore state
 */
export function useSyncStytchAuth() {
  const { setStytchSession } = useRawStore();

  useEffect(() => {
    if (!isStytchEnabled) {
      setStytchSession(null);
    }
  }, [setStytchSession]);

  if (!isStytchEnabled) {
    return { isInitialized: true, isStytchAuthenticated: false };
  }

  return useSyncStytchAuthEnabled();
}
