'use client';

import { ReactNode } from 'react';
import { createStytchClient, StytchProvider as StytchProviderBase } from '@stytch/react';

const stytchPublicToken = import.meta.env.VITE_STYTCH_PUBLIC_TOKEN;
export const isStytchEnabled = Boolean(stytchPublicToken);

if (!isStytchEnabled) {
  console.warn('Stytch is disabled because VITE_STYTCH_PUBLIC_TOKEN is missing.');
}

const stytchClient = stytchPublicToken ? createStytchClient(stytchPublicToken) : null;

interface StytchProviderProps {
  children: ReactNode;
}

export function StytchProvider({ children }: StytchProviderProps) {
  if (!stytchClient) {
    return <>{children}</>;
  }

  return <StytchProviderBase stytch={stytchClient}>{children}</StytchProviderBase>;
}

export { stytchClient };
