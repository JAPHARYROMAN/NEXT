import { create } from 'zustand';
import { clearTokens, loadTokens, storeTokens, type TokenSet } from '@next/auth-sdk/client';

export interface AuthUser {
  readonly id: string;
  readonly handle: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
}

interface AuthState {
  readonly user: AuthUser | null;
  readonly tokens: TokenSet | null;
  readonly isAuthenticated: boolean;
  readonly hydrate: () => void;
  readonly setSession: (user: AuthUser, tokens: TokenSet) => void;
  readonly signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  hydrate: () => {
    const tokens = loadTokens();
    set({
      tokens,
      isAuthenticated: Boolean(tokens),
      user: tokens ? { id: 'demo', handle: 'you', displayName: 'You' } : null,
    });
  },
  setSession: (user, tokens) => {
    storeTokens(tokens);
    set({ user, tokens, isAuthenticated: true });
  },
  signOut: () => {
    clearTokens();
    set({ user: null, tokens: null, isAuthenticated: false });
  },
}));
